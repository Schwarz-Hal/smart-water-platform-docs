---
id: api.workflows
title: 工作流编排、子流程复用、运行与 Artifact API
document_type: development
document_version: 1.2.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M05, M06, M07]
related_operators: []
related_apis: ["/api/v1/workflows", "/api/v1/workflows/{workflow_id}/validate", "/api/v1/workflow-versions/{version_id}/runs", "/api/v1/workflow-versions/{version_id}/composite-graph", "/api/v1/workflow-versions/{version_id}/composite-operator", "/api/v1/workflow-runs/{run_id}"]
owners: [backend-team]
reviewed_at: 2026-09-27
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

当部署接入动态子流程时，`POST /api/v1/workflows/{workflow_id}/validate` 除检查作者提交的 Graph 外，也会检查展开后的叶节点图。展开层内部节点的端口、参数或依赖问题会映射回最外层对应的子流程节点 ID；这样草稿校验与发布复用同一套动态执行规则，避免图形校验通过而到发布时才发现内部契约错误。该行为属于本节后述的开发分支增量，尚未进入当前部署。

## 2. 创建运行

```http
POST /api/v1/workflow-versions/{version_id}/runs
```

请求体的 `input_bindings` 按输入节点实例 ID 绑定 `dataset_version_id`、`monitor_point_id`、`metric_code`、`value_source`、`start`、`end`；可选 `parameter_overrides`。需要 `workflow:run`。创建后通过任务接口和运行接口查询，不把返回成功解释为执行成功。

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

子流程节点把一个精确已发布工作流版本映射为现有算子目录中的复合节点。此功能仍在开发分支，尚未部署到当前服务；下述接口约定不表示旧部署已经支持。它继续由现有工作流发布、版本冻结和 DAG 执行协调器处理，不引入独立场景实例或新执行引擎。此前内置固定复合节点的支持，不代表数据库新注册子流程已经接通。

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

本地验证由 `tests/extensions/test_subflows.py::test_nested_registered_subflow_preserves_parameters_types_authority_and_results` 覆盖两层算术结果35／18、以 `$defs` 本地引用保留参数 `minimum` 约束、草稿中的负值拒绝、权限拒绝、停用阻止新运行和引用保护；`tests/extensions/test_network_package.py::test_two_node_package_runs_static_and_timeseries_against_versioned_resources` 还验证网络样例封装后保留资源选择器、精确文件版本引用及 `0`／`null` 值。后两项使用 SQLite 和可信测试 SDK 代码，不代表真实容器或浏览器端到端验收。当前完整后端回归486项通过、15项因可选依赖缺失跳过、4项真实基础设施用例排除，另有2项子流程定向检查通过。前端65个测试文件共259项通过，Production build 通过；注册界面相关26项既有测试及1项参数默认值测试也通过。实际服务器点击验收仍未完成，当前分支未部署。
