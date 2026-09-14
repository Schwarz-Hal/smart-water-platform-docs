---
id: development.data-resource-extension-foundation
title: 统一数据资源与声明式扩展基础
document_type: development
document_version: 0.2.0
status: draft
locale: zh-CN
audience: [developer, operator]
related_modules: [M02, M03, M04, M05, M06]
related_operators: []
related_apis: ["/api/v1/data-resources", "/api/v1/data-resources/recognize", "/api/v1/extensions", "/api/v1/scene-instances", "/api/v1/workflow-versions/{version_id}/runs"]
owners: [backend-team]
reviewed_at: 2026-09-14
summary: 统一数据资源、声明式扩展和场景实例的实现边界、输入契约与运行安全。
---

# 统一数据资源与声明式扩展基础

## 实现范围

本实现提供两条基础能力：

1. 资源能力：基于既有文件版本建立 topology、timeseries、mapping 投影，提供预检、构建、版本化读取、时间切片、追加和适用性检查；本批工作流数据输入适配仅面向 `series`/`table`，不宣称拓扑/映射已适配任意算法输入。
2. 扩展能力：解析 `extension.json`，保存扩展声明，支持声明式 workflow/scene template 的依赖检查、原子安装、启用/停用和场景实例桥接。

场景实例通过已有 workflow/task/standard-result 路径运行。代码扩展的环境安装和隔离执行不在本实现中；完整漏损算法、定时首版、人工确认版和任意拓扑水力计算也不在本实现中。

## 数据资源契约

资源 API 前缀为 `/api/v1/data-resources`，使用既有成功/错误包络。资源创建请求包括 `request_id`、名称、`kind`、可选集合和 `sources`；来源包含文件版本、角色、规范字段到来源列的映射及可选标量常量。来源格式为 CSV、Parquet、JSON、GeoJSON；构建结果存储为有界 NDJSON 分片和 manifest，不自创二进制格式。

支持来源格式为 CSV、Parquet、JSON、GeoJSON；单来源上限 512 MiB、总来源上限 2 GiB、来源数上限 100。规范字段如下：

- topology：节点至少 `node_id`；边至少 `edge_id`、`source`、`target`。
- timeseries：`point_id`、`metric`、`timestamp`、`value`；可选 `channel`、`unit`、`timezone`、`quality`、`statistic`。
- mapping：`point_id`、`metric`、`channel`、`target_id`、`target_kind`，并通过配置精确引用 topology/timeseries 版本。

每条标准记录保留原始值和 `{version_id, sha256, row}` 来源。资源身份尽量复用 DataFile/DataFileVersion，`file_kind` 与版本化 manifest 表达投影；不得引入平行的权威 ResourceVersion ID。

### 预检、构建和追加

- `POST /api/v1/data-resources/preflight` 只读执行完整流式验证，返回 errors、warnings、sources、counts 和 applicability；预览可用不代表计算可用。
- `POST /api/v1/data-resources/builds` 返回 202 和既有 task 摘要；Worker 成功发布前保留 pending 版本，失败/取消不切换 current。
- `GET /api/v1/data-resources/versions/{version_id}/points|topology|bindings|series|time-slice` 分页或按窗口读取；读取不返回对象键和存储 manifest。
- `POST /api/v1/data-resources/{file_id}/append` 必须携带 `base_version_id`；追加成功生成新版本，旧分区和原始来源保持不变。

追加对同一 `point_id + metric + channel + timestamp` 的不同数值拒绝发布；完全重复观测保持可追溯。当前版本采用 CAS，过期基准版本的并发追加拒绝。冲突拒绝是本批确定的安全策略，不阻断其余资源基础能力。

### 自动识别、微调与复用

`POST /api/v1/data-resources/recognize` 接收 `{version_id, reuse_from_version_id?}`，要求 `data_file:read`。服务只使用目标 `DataFileVersion` 已保存的 `schema`、`time_profile` 和最多 50 行预览，返回 `inference_scope: stored_schema_and_preview`、宽/长表建议、列候选、指标证据、时间摘要、警告和 `full_validation: false`。识别是建议接口，不执行全量构建验证。

识别器只在证据足够时选定时间/点位/指标；已有时区假设或时间格式歧义转为警告/待确认，不默认单位或时区，未知本地时区仍可留空以创建预览用途资源，Excel 日期序号则必须指定时区。宽表的多个指标在一次投影中共享来源扫描，但不同单位保持独立指标，不自动转换或合轴。客户端将微调后的映射直接提交 `builds`（或追加接口），由后台任务执行完整验证。

`reuse_from_version_id` 仅复用时序资源的既有创建规则。API 对任意单一来源且字段类型兼容、来源列存在的规则返回复用建议；是否可由简化表单完整往返由前端 `canRestoreAutomaticSources` 守卫判断。守卫拒绝后客户端应提示使用资源页的“高级追加”按钮。长表通道列可由自动表单表达；宽表按行质量、通道或时区列等复杂映射不能自动还原，不得静默丢弃。复用结果显式引用新来源版本，并保留既有常量/时间格式；旧资源版本若无创建任务中的来源引用，不能自动复用。该接口不改变旧的 `preflight`、`builds` 请求语义。

源映射 `SourceRequest` 可选 `time_format`；允许 `auto`、Unix 秒/毫秒、Excel 日期序号和受支持的明确日期格式。未传该字段的历史请求继续兼容。构建记录 `raw_value` 与原始行来源；空白数值转为 `null`，不填零、不静默去重，原始时间和值仍可追溯。

### 接口增量

新增 `POST /api/v1/data-resources/recognize`，请求体仅含必需的正整数 `version_id`，以及可选正整数 `reuse_from_version_id`；响应沿用成功包络，`data` 为识别建议对象。权限不足、来源不可读或非结构化文件分别沿用现有错误包络和资源错误码。新资源创建仍调用 `POST /api/v1/data-resources/builds` 并返回 `202` 任务摘要；追加仍调用 `POST /api/v1/data-resources/{file_id}/append`。因此旧客户端不发送 `time_format` 时无需迁移，新增字段只影响需要明确时间解释的源映射。

### Reader 和适用性

工作流使用 `read_frame(actor, version_id, selection)` 或有界 partition reader，选择可包含 point、metric、channel、start、end 和 max_rows。默认单次执行上限为 1,000,000 行和 256 MB 序列化输出，超限失败，不静默截断。

Reader 按分区读取，不先 read-all 再截取；预览限制不改变执行范围。本批仅保存和检查单位，不自动转换单位。单位或时区未知时仍可预览，但适用性阻断相应计算；非数值和非有限值使用明确标记或错误，不静默转换为 null。拓扑无坐标可以读取真实连接；无边点位集合不构造拓扑。

## 扩展契约

扩展上传前缀为 `/api/v1/extensions`，上传 `/upload` 最大 20 MiB，异步静态解析。根清单 `extension.json` schema 1.0 声明 ID、namespace、版本、摘要、依赖和 contributions；贡献可识别 `algorithms`、`operators`、`workflow_templates`、`scene_templates`。

扩展安装规则：

- 相同 ID+版本+digest 幂等；相同 ID+版本不同 digest 拒绝；不同版本并存。
- workflow 节点必须引用精确 `node_code`/`node_version`，算法/算子依赖使用精确 namespace/code/version；`builtin` namespace 保留。
- 纯声明式 template 可安装并注册；首批只允许引用已安装精确算法/算子。
- 受支持算法/算子 Python 代码包可静态解析并标 `runtime_required`，本批阻止安装/启用；代码不执行。
- 任意 hooks、路由、迁移、前端 JavaScript、远程 Schema `$ref`、外部引用或不支持内容静态拒绝；不将安全拒绝混同为环境延期。

扩展生命周期状态、解析/安装 task 和运行环境能力分开保存。安装先保存对象，再在事务中注册贡献；事务失败不得出现半注册。缺少依赖不自动下载。数据库 catalog 投影是 API/Worker 多进程共享来源，当前实现每次从 DB 读取；场景实例和 workflow run 冻结声明内容，历史运行不随 catalog 变化。

## 场景实例桥接

场景路由为 `/api/v1/scene-instances`：创建需要 `workflow:edit`，读取需要 `workflow:read`，运行需要 `workflow:run`；扩展查看需要 `workflow:read`，上传按 `algorithm:publish`，安装/启停为管理员策略。具体权限应以现有实现和契约核对，不另造权限名。

创建请求选择模板、资源和参数。服务端执行 Schema、权限、required bindings、资源 kind/calculation 和时序非空窗口检查，并保存 template snapshot、规范化 selections 和 parameters。运行请求携带 idempotency key，返回既有 workflow/run/task 标识；状态、Artifact、标准结果和自动运行报告复用既有 workflow API，不复制任务状态。HTML 报告通过 `GET /api/v1/scene-instances/{instance_id}/runs/{run_id}/report` 提供，前端使用认证 Blob 下载；当前内容仅含运行状态、冻结输入/参数和输出清单。

首验已使用所有必要输入明确的时序 workflow。缺少拓扑只允许明确不依赖拓扑的流程；必需输入缺失由 required bindings、资源 kind/calculation 和非空时序窗口门禁阻止，不新增通用条件分支引擎或静默跳节点。当前首批不接定时和人工确认版。

## 失败恢复与兼容

上传/解析/安装 task 关闭或断网后可从任务中心重开；失败原因和配置保留。运行取消、资源构建取消和安装事务失败都不得改变已发布 current 或历史快照。terminal failed 进入明确安全终态。

旧 SWNet 读取和旧 workflow/algorithm-package 入口保持兼容，资源 reader 不重写 legacy manifest。停用阻止新选择/运行但保留运行中任务和历史；逻辑 archive 受引用保护，不物理 GC 破坏历史。

自动识别失败、来源版本不可访问或客户端刷新只影响建议/未提交微调，不会发布半成品资源。客户端可重新读取文件版本并重发识别；创建/追加使用既有任务幂等键和任务中心状态恢复。完整构建失败或取消不切换 current，未保存的微调需重新确认。

## 验证范围

基础资源/扩展能力已随 `20260914T092131Z-extension-ui-recovery` 部署（backend `e9faa40`、frontend `3d1d082`、docs `f57c18e`）。本次自动识别与简化追加复用仍为本地工作分支内容，尚未推送、合并或部署。当前验证证据为 Neo 后端 462 passed、15 项可选算法依赖缺失而 skip，前端完整套件 234 passed，追加生命周期回归定向测试 10 passed；production build 通过。浏览器本地目标受 `ERR_BLOCKED_BY_CLIENT` 阻断，未形成四尺寸验收结论。静态解析或页面展示不代表代码扩展环境已就绪，也不代表完整漏损业务准确率验收完成。
