---
id: api.workflows
title: 工作流编排、子流程复用、运行与 Artifact API
document_type: development
document_version: 1.3.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M05, M06, M07]
related_operators: []
related_apis: ["/api/v1/workflows", "/api/v1/workflows/{workflow_id}/validate", "/api/v1/workflow-versions/{version_id}/runs", "/api/v1/workflow-versions/{version_id}/composite-graph", "/api/v1/workflow-versions/{version_id}/composite-operator", "/api/v1/workflow-runs/{run_id}"]
owners: [backend-team]
reviewed_at: 2026-10-02
summary: 工作流草稿、校验、不可变版本、动态子流程展开、运行和 Artifact 查询接口。
---

# 工作流编排、子流程复用、运行与 Artifact API

## 用途与权限

提供工作流草稿、发布、运行和结果访问；校验/保存需要 `workflow:edit`，发布需要 `workflow:publish`，运行需要 `workflow:run`。

## 请求

草稿保存提交 `expected_revision`；运行绑定提交数据版本、点位、指标、值来源和时间范围。

## 响应

运行接口返回运行摘要；Artifact 接口返回预览或由 API 代理流式返回内容。

## 错误与重试

草稿冲突为 `409`；越权资源按 `404`；运行失败应查询任务和日志后再人工重运行。

## 1. 草稿和发布

`POST /api/v1/workflows` 创建 Graph；`PUT /api/v1/workflows/{workflow_id}/draft` 保存草稿并提交 `expected_revision`；`POST /api/v1/workflows/{workflow_id}/validate` 校验节点、端口、参数和最终输出；`POST /api/v1/workflows/{workflow_id}/publish` 发布不可变版本；`GET /api/v1/workflows/{workflow_id}/versions` 查询版本。

草稿冲突返回 `409 WORKFLOW_DRAFT_CONFLICT`。发布版本不能修改；可以从历史版本派生草稿。草稿 Graph 的节点实例 ID 是运行时输入绑定的键，不是算子编码。

新版 Studio 发布可提交 `{ "expected_revision": 3 }`，将发布绑定到已保存并校验的草稿修订；不一致返回 `409 WORKFLOW_DRAFT_CONFLICT`，并在数据库锁定草稿后再次核对。兼容旧调用：发布请求可不带 body 或提交空对象；省略该字段表示按服务端当前草稿处理。客户端“运行当前配置”应串行完成保存、校验、必要的发布、再按返回版本创建运行，不能把可变草稿当作运行版本。

### Graph 的画布元数据

Graph `contract_version` 仍为 `1.0`。可选根级 `ui` 用于区域和连线折点，形状为 `schema_version: "1"`、必需 `regions: []` 和可选 `reroutes: []`；未带 `ui` 的历史图保持可读，不强制改写。区域字段为 `id`、`title`、`color`、`node_ids`、`position:{x,y}`、`size:{width,height}`、`collapsed`。区域 ID 唯一，节点引用必须存在，每节点最多属于一个区域，不支持区域嵌套。

`reroutes` 每项为 `id`、`edge:{source:{node_id,port},target:{node_id,port}}`、`points:[{x,y}]`；必须引用真实执行边，每边最多一条折点记录。坐标必须有限，尺寸必须大于零；最多100个区域、每区100个成员、200条折点记录、每条32个点。UI 对象不接受未声明字段，错误以 `WORKFLOW_INVALID` 和 `ui` 下的路径定位。区域折叠和代理端口不修改执行图；子流程展开时将区域成员映射到叶节点，不能明确映射的展示折点不进入展开图。此元数据使用既有 JSON 字段，无需数据库迁移。

### 用途、来源与列表

`POST /api/v1/workflows` 可传 `purpose: "scene" | "transient"`（默认 `scene`）及 `created_via: "editor" | "quick_trial" | "template" | "model" | "system"`（默认 `editor`）。摘要返回这两个字段；`GET /api/v1/workflows` 增加可选 `purpose` 筛选，省略时保留既有列表语义。模板创建为 `scene/template`；调用方应为快速试用等生成入口显式设置分类，不通过编码猜测。

分类字段需要新增迁移 `0028_workflow_purpose`，顺接 `0027_extension_lifecycle`；历史记录使用 `scene/editor` 默认值，不自动删除或重新判定。含非默认分类数据时，降级迁移拒绝丢弃这些标记，需按受控备份恢复方案处理。新增分类并不改变运行状态权威或执行链。

当部署接入动态子流程时，`POST /api/v1/workflows/{workflow_id}/validate` 除检查作者提交的 Graph 外，也会检查展开后的叶节点图。展开层内部节点的端口、参数或依赖问题会映射回最外层对应的子流程节点 ID；草稿校验与发布复用同一套动态执行规则。

## 2. 创建运行

```http
POST /api/v1/workflow-versions/{version_id}/runs
```

请求体的 `input_bindings` 按输入节点实例 ID 绑定 `dataset_version_id`、`monitor_point_id`、`metric_code`、`value_source`、`start`、`end`；可选 `parameter_overrides`。需要 `workflow:run`。创建后通过任务接口和运行接口查询，不把返回成功解释为执行成功。

提交可带 `Idempotency-Key`。同一调用者以同一键和相同版本／绑定／参数覆盖重试，返回已有运行；键复用但 payload 不同返回 `409 WORKFLOW_IDEMPOTENCY_CONFLICT`。响应未知时保留键与原请求重试；确认失败并修正配置后才使用新键。

新版 `parameter_overrides` 按可直接编辑的节点实例 ID 提交参数对象：校验精确版本 Schema、拒绝未知参数，再冻结到本次实际执行 Graph／计划；不会修改已发布版本或历史运行。不支持对复合节点或仅存在于展开图的内部节点做不能明确映射的覆盖，返回 `422 WORKFLOW_PARAMETER_INVALID`。旧运行不会补写执行快照，不能仅凭记录中存在覆盖字段宣称参数已被执行。

### 从运行另存场景

`POST /api/v1/workflow-runs/{run_id}/save-as-scene`，body 为 `{ "workflow_name": "新的分析场景" }`，需要 `workflow:read`、`workflow:edit` 及原运行可见权限。返回新工作流草稿摘要，`purpose=scene`，保留原创建来源；不创建新运行、不复制 Artifact、不改写来源版本。以原发布作者图恢复子流程结构，保留实际执行参数、模型和精确输入绑定，并重新校验权限／就绪状态；不可用引用保留且标记校验问题。

无法取得原作者图，或旧覆盖记录与实际执行快照不一致时，返回 `409 WORKFLOW_RUN_SCENE_UNRECOVERABLE`；模板场景实例来源返回 `409 SCENE_WORKFLOW_CLONE_FORBIDDEN`，应新建场景实例。另存成功不保证立即可运行，调用者仍须处理返回的校验问题。

## 3. 运行和 Artifact

| 方法与路径 | 说明 |
| --- | --- |
| `GET /api/v1/workflow-runs` | 分页查询运行 |
| `GET /api/v1/workflow-runs/{run_id}` | 运行和快照 |
| `GET /api/v1/workflow-runs/{run_id}/nodes` | 节点状态、耗时和摘要 |
| `GET /api/v1/workflow-runs/{run_id}/artifacts` | Artifact 摘要 |
| `GET /api/v1/workflow-runs/{run_id}/result` | Graph 声明的最终输出 |
| `GET /api/v1/workflow-artifacts/{artifact_id}` | Artifact 元数据和预览 |
| `GET /api/v1/workflow-artifacts/{artifact_id}/content` | 由 API 流式返回完整内容 |
| `POST /api/v1/workflow-runs/{run_id}/cancel` | 协作式取消 |

API 不返回 MinIO 地址、对象键或凭据；未知 Artifact 类型应回退为安全 JSON/下载视图。

## 4. 发布版本封装为子流程节点

子流程节点把一个精确已发布工作流版本映射为现有算子目录中的复合节点，继续由现有工作流发布、版本冻结和 DAG 执行协调器处理，不引入独立场景实例或新执行引擎。具体可用能力以部署版本为准；内置固定复合节点的支持不等于任意旧部署支持数据库注册子流程。

### 读取发布快照

```http
GET /api/v1/workflow-versions/{version_id}/composite-graph
```

需要 `workflow:read` 和对该来源工作流版本的访问权。响应提供该精确版本的 `workflow_version_id`、原始 `graph`、节点 `definitions`、`dependency_sha256`，以及已有注册接口 `interface`（未注册时为空对象）。编辑器据此构建候选项，不读取或修改未发布草稿。

### 注册算子接口

```http
POST /api/v1/workflow-versions/{version_id}/composite-operator
```

注册需要原有 `operator:manage` 权限以及对来源版本的访问权。请求核心形状如下，版本由路径中的精确 `version_id` 确定：

以下 JSON 仅展示请求外层结构；有效注册必须按后文填入真实边界映射，`outputs` 至少包含一个来源于最终输出的条目，不能直接用空数组提交。

```json
{
  "node_code": "quality_subflow",
  "node_version": "1.0.0",
  "node_name": "质量检查子流程",
  "description": "封装已发布流程",
  "interface": {
    "schema_version": "1.0",
    "inputs": [],
    "outputs": [],
    "parameters": []
  }
}
```

接口每项分别遵循以下约束：

- `inputs[]` 从已发布 Graph 中选择没有入边、但供内部边或最终输出使用的边界输出；字段包含 `key`、`label`、`data_type`、可选 `semantic_type`／`unit`、`required`、`cardinality="one"` 和 `source:{node_id,port}`。
- `outputs[]` 必须引用该发布版本已声明的最终输出，使用相同的类型契约字段；至少暴露一个输出。
- 只有显式包含在 `parameters[]` 中的参数会暴露为外层属性。每项使用唯一 `key` 映射至已发布节点的 `target:{node_id,parameter}`，并携带该参数的 JSON Schema。服务端按精确 Schema 复核，不接受客户端更改类型规则。默认值优先取发布版本中该节点已配置的参数值，其次取 Schema 的 `default`；需要时通过 `required` 标记外层参数是否必填。Schema 的本地 JSON Pointer 引用（例如 `#/$defs/...`）会按来源节点隔离并保留原约束／默认值；远程 Schema 引用不支持，提交会返回 `422 COMPOSITE_PARAMETER_SCHEMA_INVALID`。

服务端从已发布版本读取节点定义，对照数据类型、语义、单位和参数 Schema 后规范化接口。接口无效返回 `422 COMPOSITE_INTERFACE_INVALID`。同一目录编码／版本不能改接口或改绑另一来源版本；与内置节点或其他所有者编码冲突会拒绝。来源工作流及其发布版本由注册记录和已发布外层依赖引用保护；尝试删除仍被引用的来源工作流返回 `409 COMPOSITE_SOURCE_IN_USE`。目录解析只按来源工作流可见性和目录节点状态筛选；内部扩展权限在展开校验、发布和运行时复核，数据权限在运行绑定和读取时复核，包装节点不会授予内部私有扩展或数据的权限。

注册成功响应包含 `workflow_version_id`、`node_code`、`node_version`、服务端规范化后的 `interface` 和 `dependency_sha256`；算子定义／版本仍保存在既有节点目录中，而不是另建一张执行任务表。

### 发布和运行时展开

外层工作流发布时保留作者提交的原始 `graph_snapshot`，并另存带精确子流程版本、接口／依赖摘要的 `execution_plan_snapshot`。执行计划把复合节点递归展开为既有 DAG 的叶节点：外层连线替换接口声明的边界源，对外参数和子流程中的数据绑定映射到对应内部节点。历史运行仍引用创建时冻结的计划，不会随子流程后来发布版本而改变。

嵌套最多 3 层，展开结果最多 100 个叶节点和 200 条边；超限返回 `COMPOSITE_EXPANSION_LIMIT`，循环返回 `COMPOSITE_DEPENDENCY_CYCLE`。来源权限失效返回 `COMPOSITE_SOURCE_UNAVAILABLE`，冻结来源或接口摘要不匹配返回 `COMPOSITE_SNAPSHOT_CHANGED`。不兼容或缺少必需输入按现有 Graph／工作流校验返回错误；草稿校验时也会验证展开后的叶节点图，并把内部问题定位到最外层子流程节点，不等到发布阶段才发现。执行由既有节点协调器完成。

详细运行接口 `GET /api/v1/workflow-runs/{run_id}` 仅对包含子流程的运行附加 `subflow_sources` 数组，包含来源名称、子流程路径、目录节点编码／版本和来源工作流发布版本 ID。没有子流程的旧运行不会返回空的 `subflow_sources` 字段；节点执行列表仍按展开后的叶节点提供状态与追溯路径。

本页描述接口与实现边界，不记录部署或线上验收结论。本地自动化和离线样例检查不能代替真实 API、Worker、数据资源和浏览器端到端验收。Studio、分类迁移和参数覆盖修复是否已上线，应核对部署发布记录；区域不提供局部执行、旁路缓存或新增嵌套执行能力。
