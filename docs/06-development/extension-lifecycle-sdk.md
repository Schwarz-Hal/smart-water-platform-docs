---
id: development.extension-lifecycle-sdk
title: 扩展生命周期与 Python SDK 首段
document_type: development
document_version: 0.10.0
status: draft
locale: zh-CN
audience: [developer, operator]
related_modules: [M02, M03, M04, M05]
related_operators: []
related_apis: ["/api/v1/extensions/upload", "/api/v1/extensions/catalog", "/api/v1/extensions/{package_id}", "/api/v1/extensions/{package_id}/{operation}", "/api/v1/extensions/{package_id}/visualizer", "/api/v1/tasks/{task_id}", "/api/v1/workflow-templates", "/api/v1/workflows/from-template", "/api/v1/workflow-runs/{run_id}/artifacts", "/api/v1/workflow-artifacts/{artifact_id}", "/api/v1/workflow-artifacts/{artifact_id}/content", "/api/v1/workflow-versions/{version_id}/composite-graph", "/api/v1/workflow-versions/{version_id}/composite-operator", "/api/v1/workflow-runs/{run_id}"]
owners: [backend-team]
reviewed_at: 2026-09-27
summary: 说明 Python 扩展 SDK、不透明二进制制品、资源绑定样例、动态子流程复用、受限结果视图及待验收边界。
---

# 扩展生命周期与 Python SDK 首段

## 用途与当前状态

本文面向扩展作者和平台维护者，说明如何用 SDK 生成、检查和打包扩展，以及平台如何区分私有上传、环境准备、试运行、安装、个人启用、公开审核和安全撤销。

截至 2026-09-27，扩展生命周期已部署为 release `20260927T040000Z-extension-lifecycle`，包含 Neo `6cf09ae`、前端 `7b46f21`、契约 `65084651`、文档 `51a4ca0` 精确提交；这不表示相关 Draft PR 已合并或完整主线已合并。MySQL migration `0027_extension_lifecycle` 在核验压缩备份后应用，已发布 migration `0021`–`0026` 的字节保持不变；8 项服务健康，自启动仍为 disabled。服务器129项定向测试、数值／GPU／预检／smoke 检查通过。部署测试环境曾继承 `softtime=0`，只在 deployment test environment 修复，生产配置未变。当前已验证批准镜像下的独立容器与 MinIO 组件路径；完整 HTTP 上传→MySQL 任务→Worker→DAG→浏览器链路仍未验收，后续各节区分已通过的窄路径和剩余集成门槛。

## 前置条件与角色

- SDK 要求 Python 3.12。扩展作者可从 Neo 仓库根目录安装本地 SDK：

  ```bash
  python -m pip install ./sdk/python
  ```

- schema 2 上传需要 `workflow:read` 和 `workflow:edit`；读取目录及包详情需要 `workflow:read`。
- 包所有者使用自己上传的扩展，并可启用自己有权访问的包；公开包的其他用户也必须为自己的账号单独启用。
- 公开审核、拒绝公开申请及安全撤销仅限管理员。生命周期操作沿用现有任务系统，操作返回任务标识不代表环境或执行成功。
- 运行代码还要求平台配置已批准的不可变镜像和可用 Linux Docker 环境。没有运行环境时，代码包不能通过环境准备或试运行。

## 使用 SDK 创建与检查包

SDK 0.1 使用 manifest schema 2.0 和执行协议 1.0。`swext init` 生成一个最小算术示例；`check` 检查清单或 ZIP；`pack` 生成 ZIP。静态检查和打包不会导入或执行作者代码。

```console
swext init ./my-extension --namespace my-water --name example
swext check ./my-extension/extension.json
swext pack ./my-extension ./example-1.0.0.zip
swext check ./example-1.0.0.zip
```

包内根目录应有 `extension.json`，可包含 `python/`、`web/` 和 `docs/`。SDK 检查精确版本、入口路径、包路径、JSON Schema、端口及包大小边界；包构建器只收集这些约定目录和清单，不覆盖已存在的目标 ZIP。检查通过表示清单或包结构通过静态校验，不表示平台已注册贡献、开放 DAG 节点或准备好运行代码。

扩展输入和输出都使用精确 `{namespace, code, version}` 类型引用及 `payload`。参数按声明的 JSON Schema 校验；SDK 可校验本包定义的类型，跨包类型和依赖由平台依据其授权目录处理。缺少必需端口、未声明输出或类型不匹配应明确失败，不静默转换。

### 本机可信代码试运行

作者可以对自己编写且信任的代码显式运行：

```console
swext run-local --trust-local-code --package ./my-extension --request ./request.json --output ./local-output
```

这条命令直接在本机 Python 进程执行扩展代码，**不是沙箱，也不是隔离测试**。仅用于自己掌握的本地源码；不要用它检查或运行未知上传包。镜像中的 `execute` 命令是容器入口，同样不是安全边界。平台不得在 Docker 或批准环境不可用时回退到 `run-local`、`execute` 或宿主 Python。

## 平台包身份、可见性与生命周期

schema 2 包以所有者、发布命名空间、扩展 ID 和精确版本组成身份。平台把作者清单中的 namespace 映射为 `u{owner_user_id}-{manifest.namespace}`；清单 namespace 最长 40 字符。相同用户重复上传相同内容可复用自己的包记录；不同用户即使上传字节相同，也有不同的私有身份。已发布的相同版本不能被覆盖，升级应提交新版本。

读取包时，其他用户的私有包与不存在的包均按不可见处理。目录接口支持 `accessible`、`mine`、`public`、`review` 范围；`review` 仅管理员可读。包的安装状态、运行环境、试运行结果、公开状态、安全状态和当前用户的启用状态是分开的字段；不要把“已安装”理解为“对所有用户已启用”或“代码已经可运行”。

| 阶段 | 操作 | 结果与约束 |
| --- | --- | --- |
| 上传并解析 | `POST /api/v1/extensions/upload` | 返回既有 `202` 任务标识。schema 2 默认私有；异步解析检查清单、路径、贡献及精确引用。schema 1 上传规则保持兼容。 |
| 目录与详情 | `GET /api/v1/extensions/catalog`、`GET /api/v1/extensions/{package_id}` | 目录按范围分页；详情显示 schema、所有者、namespace、环境、验证、公开与安全状态。私有包不泄露给无权用户。 |
| 准备运行环境 | `POST /api/v1/extensions/{package_id}/prepare` | 检查已批准运行档及镜像。首档为 Python 3.12 CPU / SDK 0.1；仅使用平台预先批准的依赖版本，不在宿主机为扩展运行 `pip install`。声明式包环境标记为不需要运行时。 |
| 试运行 | `POST /api/v1/extensions/{package_id}/smoke` | 代码包须声明试运行用例；环境镜像摘要须与准备时一致，输入和输出端口按精确类型检查。声明式包的结果是静态通过，不是代码执行证据。 |
| 安装与个人启用 | `install`，随后 `enable` | 安装检查依赖并登记精确版本声明；启用写入每用户激活状态。未完成环境准备和试运行的可执行代码包不能安装／启用。 |
| 申请公开与审核 | `request_public`，管理员执行 `approve_public` 或 `reject_public` | 所有者提出申请，管理员决定是否公开；公开后其他用户仍需分别启用。撤回申请使用 `withdraw`。 |
| 停用、归档与撤销 | `disable`、`archive`、管理员 `revoke` | 停用当前用户的新使用；有活动启用、已记录引用或依赖关系时归档被拒绝。安全撤销立即阻止新的执行授权，并保留审计和历史引用。 |

这些操作均为 `POST /api/v1/extensions/{package_id}/{operation}`，复用已有异步任务响应和任务状态，不创建第二套任务引擎。schema 2 lifecycle 操作需要 `workflow:edit`；对象所有权／管理员规则另外校验。公开审核和安全撤销另要求管理员权限。通过 `/api/v1/tasks/{task_id}` 与 `/api/v1/tasks/{task_id}/logs` 查看权威任务状态和日志，并以终态而非 HTTP `202` 判断操作结果。

迁移 `0027_extension_lifecycle` 顺接 `0026_data_resource_extensions`。迁移为包补充 schema、namespace、环境、验证、公开和安全状态，另建个人启用、使用引用和容器执行所有权记录；它不会替换任务表。历史 schema 1 包保留既有 package ID 和 legacy 可见性。执行降级前必须先核对数据；只要存在新增生命周期数据、schema 2 包或回退后会形成重复身份，downgrade 就会拒绝删除。需要回退时使用已验证的备份恢复流程，不要强制删表或绕过拒绝。

## 运行环境与执行协议

平台运行时通过 Worker 配置 `EXTENSION_RUNTIME_IMAGE`。该值必须是预先批准的不可变镜像 digest；Worker 启动装配读取此配置，有值时只构造适配器对象，不在装配阶段访问 Docker。后续环境准备、试运行或执行阶段才调用 readiness 检查 Docker Engine 的 Linux 能力、资源限制及镜像标签，未就绪时返回 `EXTENSION_RUNTIME_UNAVAILABLE`。实际执行使用 `--pull=never`，不会在处理任务时拉取镜像，也不会采用清单提供的宿主路径、命令或镜像。设置缺失或运行时不可用时不得切换到宿主执行。

已实现的 Docker 启动策略包括非 root 用户、无网络、只读根文件系统和只读输入挂载、移除 Linux capabilities、默认 seccomp/no-new-privileges、CPU／内存／进程／时间限制，以及有界私有 tmpfs 输出和暂存目录。Docker Engine 29.1.3 上独立 `ContainerRunner` 检查通过：容器以 UID 65532 运行，只见 loopback 网络接口、无法建立外连，root、package 和 input 写入受拒；正常返回、失败、取消、超时、OOM 后均确认容器及宿主 staging workspace 清理。该测试不走 HTTP／MySQL 任务流程；直接调用 `cleanup_owned` 的失联资源回收演练也不等于 Worker SIGKILL 加数据库 reaper 验收。上述窄路径不是完整容器安全审计；完整平台生命周期仍是发布门槛。

每个用户跨 Worker 最多允许 **2 个未清理的扩展容器资源记录**。创建前在数据库事务中检查活跃账户、任务 owner、worker、attempt、包安全状态和当前数量；已回收记录不计入并发额度。开始写入包或输入文件之前，平台先持久登记容器所有权和宿主 workspace 身份；身份包括平台生成的 workspace 名称以及绑定主机名与 workspace 根目录的摘要，拒绝被重定向的根目录。执行结束或回收时，必须先按对应 Docker engine ID 确认目标容器已删除（或已不存在），再按登记的 workspace 身份清理宿主目录；容器检查／删除失败、身份不匹配或目录不安全时保留目录和未清理记录。持久清理记录交由现有 stale sweep 路径处理：只有任务、worker、attempt、包状态或 cleanup-pending 状态满足回收条件时才清理，不能仅凭本地容器列表推断陈旧。daemon 不可用时不把删除失败记作已清理；资源状态可能仍是 `allocated` 或 `cleanup_pending`。

SDK 为事件附上协议版本、运行 ID、attempt 和递增序号。事件类别包括：

- `progress`：阶段名及可选的真实 `completed/total` 计数；未知工作量不生成百分比。
- `metric`：指标名、有限数值及可选步骤。
- `log`：级别和消息。
- `output_chunk`、`output_end`：有序结果分块、总长度与 SHA-256 摘要。

Worker 把进度、指标和日志写入既有任务日志；执行结束后还要检查分块顺序、大小、摘要、运行标识和输出类型，完成提交后才把任务标为成功。扩展生成的 `result.json` 只是类型化结果载荷，不是权威任务状态。错误任务可从任务详情和日志检查错误码；状态轮询或连接失败时重新读取同一任务，不要因已收到 `202` 重复创建上传或将其判为成功。

### 不透明二进制 Artifact

SDK 提供内置类型 `builtin/artifact@1.0.0`，用于在既有 DAG 节点间传递文件字节，不替代普通 JSON `payload`。作者可在已声明的输出端口返回 `context.artifact(raw_bytes, name="result.bin", content_type="application/octet-stream")`，并在消费者中调用 `context.read_artifact(inputs["file"])` 读取已绑定的输入句柄。读取方法只接受平台放入本次调用的精确 Artifact 输入元数据，检查长度和 SHA-256 后返回 `bytes`；SDK 不提供宿主文件路径、对象存储键或平台凭据。

每次节点调用的输入集合与输出集合分别限制为最多 16 个非空文件、合计不超过 32 MiB；超过数量或总大小会明确失败。Artifact 的不透明字节不塞入 JSON 结果体：SDK 通过 `artifact_start`、按序号递增的 `artifact_chunk`、`artifact_end` 事件传输文件元数据和分块；分块在线路上是 Base64 数据。Worker 检查事件序号、文件句柄、分块次序、声明长度和最终摘要，并确认每个二进制输出均来自本次运行中已校验的传输且对应声明的输出端口。一个句柄只能返回在一个输出端口；多个下游需消费同一制品时，应从该单一节点端口在 DAG 中扇出，不要重复返回同一文件以绕过额度或重复写入。JSON 结果体仅保留类型与文件元数据引用，不能据此声称平台已解析 Parquet／Arrow 等文件语义。

平台解析并授权输入制品后，才把相应文件放入本次容器的只读 `/input/artifacts/` 挂载；名称与内容经平台生成的句柄关联，不接受作者给出的本机路径。输出文件先登记持久的 `sw_extension_artifact_stage` 暂存记录，再写入对象存储；同节点成功事务内才把暂存项发布为既有工作流制品。已发布文件通过现有授权的制品内容接口读取并校验长度和 SHA-256。结果页只在用户点击“下载文件”后请求完整内容，再在浏览器核验大小与摘要；不会为了列表展示自动拉取文件。

未发布的 `reserved`／`ready` 暂存对象由既有维护路径检查：创建超过 15 分钟后，仍会按持久任务状态、取消标记、worker、attempt 与包撤销状态判断是否可清理；15 分钟是候选回收阈值，不是清理完成 SLA。仍由匹配 worker 执行中的暂存项会保留；已发布对象不属于暂存清理范围。Smoke 输入中的二进制样本必须引用包内 `fixtures/` 文件；ZIP 中每个文件条目最多 5 MiB，整个包最多 20 MiB。读取型 smoke 用例要实际绑定 fixture 并验证预期输出，不能只声明一个未使用的输入。平台校验扩展包摘要及 fixture 内容，不接受任意服务器路径或上传表单中的外部路径。

## 前端受限可视化 SDK

`sdk/frontend/index.d.ts` 声明作者侧类型，`sdk/frontend/README.md` 给出对应脚本接口。作者包中的 `visualizers` 声明指向 `web/` 下的自包含 JavaScript 源码，并关联精确类型引用；当前包类型 SDK 是仓库内私有源码，不是已经发布的 npm 插件 API。结果展示请求使用 `GET /api/v1/extensions/{package_id}/visualizer?namespace=…&code=…&version=…`；此只读接口沿用 `workflow:read` 与包可见性检查，并只读取 schema 2 且处于已安装／已归档、未撤销状态的匹配声明。后端返回 JSON 中的源码文本、`quickjs-view-v1` 协议标识和 SHA-256；这不是给页面注入可执行 `<script>`。

前端验证协议与源码摘要后，把输入 `payload`、上次返回的 `state` 和可选 `{id}` 事件传给独立 Web Worker 中的 QuickJS WASM runtime。作者提供全局 `render(input, state, event)` 函数并返回 `protocol_version: '1.0'` 的 `ExtensionView`。宿主允许的展示块为 `text`、`metrics`、`table`、`chart`、`network`，以及受限的 `canvas`；例如网络块可表达节点、管段和按资产／指标／时间标注的 observations，宿主再用固定 Angular 视图渲染。

`canvas` 让 renderer 用数据计算几何、语义颜色和动作状态，但不把绘图代码或标记交给主站执行。作者只能返回 `rect`、`circle`、`polyline`、`text` 四种原语及坐标／颜色／文字等数据；颜色只能用平台语义色或 `#RRGGBB` 六位十六进制色。每个画布必须有非空 `label` 和 `description`，并声明宽高；主站重新校验后，以自有 SVG 模板重建白名单元素，不接收任意 SVG 标记、路径、HTML、CSS、远端资源或脚本。单画布最多 4096 个原语、32768 个折线顶点及 128 个唯一 action；超限或未知图元会被拒绝。图元上的 action 仅是 `{id,label}` 描述，交互由宿主提供按钮，触发后把 `{id}` 作为下一次 `render` 的 `event`，作者据此返回更新后的 `state` 和绘图数据。它不是任意 React／Angular 插件，也不是扩展直接操作 DOM。

前端 SDK 的 `ViewCanvas`、`DrawingPrimitive` 和 `DrawingColor` 类型位于 `sdk/frontend/index.d.ts`。画布及 action 都只是 renderer 的序列化输出描述；运行时校验器和宿主组件才是最终能力边界，TypeScript 声明本身不授予额外权限。

宿主还对单次视图的全部 blocks 合计执行总量限制：最多 16,000 个表格单元格（含表头）、96 个指标项、8 个 chart、120,000 个 chart 数据点、1 个 network、4,096 个 canvas 图元、32,768 个折线顶点及每个 canvas 分别去重后再求和最多 128 个 action ID。另有协议／局部结构上限：每视图最多 32 个 block 和 8 个顶层 action；单表最多 32 列、1,000 行，每个 metrics block 最多 24 项，每个 chart 最多 12 条 series 且每条最多 10,000 点，每个 network 最多 5,000 个节点、10,000 条管段和 50,000 条观察；序列化 state 最多 65,536 个字符。任一总量超限会拒绝扩展视图，结果页显示“扩展展示内容过多，请缩小展示范围；原始结果仍可查看。”并保留原始类型化数据，不把截断内容当作完整结果。

`extension_visualizer` 是可选的 presentation metadata，不会覆盖 artifact 的原生 `data_type`、payload／preview、大小、摘要或存储信息，也不改变 DAG 下游端口值。若制品有匹配的 visualizer 声明，结果页可在保留文件卡片／授权下载入口的同时展示该扩展视图和原始类型化数据；没有匹配声明时继续使用内置标准结果查看器。二进制文件内容不会因此自动读取或传给 renderer，renderer 只接收结果载荷中显式提供的 JSON 数据。

按钮只传递 action `id`，主机以新 event 调用 renderer，renderer 返回更新后的 `state` 和数据视图。宿主每 30 秒重新读取可视化授权与源码摘要；如果权限仍有效且摘要不变，不会因检查而重跑脚本或重置当前视图。读取失败或摘要变化时会终止当前 Worker 并清除旧扩展视图；结果页可回退到平台标准结果查看器及原始类型化数据。

### QuickJS 运行边界与限制

renderer 只在 WASM QuickJS 引擎的专用 Worker 中执行；本项目通过 [quickjs-emscripten](https://github.com/justjake/quickjs-emscripten) wrapper 加载 QuickJS，没有向解释器提供 DOM、`window`、网络、计时器、存储、模块加载、身份凭据或宿主回调。当前防御限制包括：源码文件最多 512 KiB；序列化输入的 JavaScript `String.length` 最多 8×1024×1024 UTF-16 code units；QuickJS heap 64 MiB、stack 256 KiB、解释器中断目标 800 ms；序列化输出的 `String.length` 最多 2×1024×1024 UTF-16 code units；Worker 最长等待 5 秒后终止。输入／输出字符串上限计的是 UTF-16 code units，不是 UTF-8 字节；宿主另行校验块、行、点数和字段长度。**这些超限／中断控制不是安全证明：QuickJS WASM 与 wrapper 未在本项目中经过独立安全审计，Worker 终止和配额也不保证消除所有引擎漏洞或拒绝服务风险。** 可查阅 [QuickJS 官方 README](https://github.com/bellard/quickjs/blob/master/readme.txt) 与[官方语言文档](https://bellard.org/quickjs/quickjs.html)。

浏览器样例由 `src/playground/foundation/extension-host-demo.component.ts` 提供固定合成数据：4 个节点、3 条管段和 4 个小时的压力观察，按钮在纯拓扑与含时序观察之间切换；既有网络组件提供搜索、选择、时间轴及选中资产曲线。它是 Playground 第31个注册示例。扩展网络视图默认折叠图例是此宿主的 opt-in 设置，不改变原漏损闭环页面的默认展开。这证明该脚本协议在本地浏览器可驱动受限视图，不代表真实上传包经容器执行后端到前端 E2E，也不包含敏感真实管网或生产数据。

## 资源绑定与 network-inspection 两节点样例

Neo 仓库中的 `sdk/examples/network-inspection/` 是尚未发布的 schema 2 样例包：SDK 仍为 0.1，清单声明的示例包版本为 1.0.0，不表示已有正式公共版本。先安装已有 Python SDK，并从仓库根目录静态检查、打包和复查归档：

```console
python -m pip install ./sdk/python
swext check sdk/examples/network-inspection/extension.json
swext pack sdk/examples/network-inspection ./network-inspection.zip
swext check ./network-inspection.zip
```

样例只有两个职责分离的可执行节点：

| 节点 | 输入与输出 | 边界 |
| --- | --- | --- |
| `topology-input`（拓扑数据输入） | 从必需的 `topology` 资源版本读取节点与边，输出精确类型 `network-tools/topology@1.0.0`，包含 `nodes`、`edges` 和连通性／坐标等 `quality` 摘要 | 只输出拓扑摘要／质量，不生成 `network-view`、`renderable` 标记或三维坐标 |
| `network-output`（管网可视化输出） | 接收拓扑及可选的规范 `observations` 表、`timeseries` 资源版本和 `mapping` 资源版本，输出 `network-tools/network-view@1.0.0` | 负责判断是否可空间显示并组织网络视图、摘要和警告；拓扑本身就能生成不带观察值的纯拓扑结果，它不是漏损诊断或水力分析算子 |

包内 `network-overview` 是普通 `workflow_template`，由精确 `node_ref` 串接两个既有扩展节点；`network-scene` 是引用该工作流模板的 `scene_template` 起始方案。启用后，这类模板进入既有 workflow starter 流程，通过 `/api/v1/workflow-templates` 和 `/api/v1/workflows/from-template` 创建普通 DAG 草稿；它不调用旧 `/api/v1/scene-instances` 场景实例执行器，也没有独立场景引擎。资源输入参数未配置时允许先建草稿；发布前仍须在既有 DAG 编辑／校验流程填齐必要参数并通过完整校验。

### 选择并固定数据资源版本

上传样例后，按扩展生命周期完成静态解析、环境准备、试运行、安装和为当前用户启用。每个可执行贡献至少需要一个完整覆盖其精确 code/version 的 smoke 用例；此包为两个节点分别声明 smoke case。样例 smoke 使用内嵌合成拓扑来验证节点接口，其版本参数值只是 fixture 占位，不是用户文件版本 ID，也不证明真实资源读取已经执行。

创建 DAG 草稿后：

1. `topology-input` 的必需 `source_version_id` 通过平台自有资源版本下拉框选择 topology。控件只保存所选版本 ID，不会随着资源“当前版本”变化自动追随新版本；提交工作流运行时由服务端重新授权、检查类型并读取该版本 SHA 来冻结运行绑定。
2. `network-output` 可不接入时序，输出纯拓扑；也可直接接收规范化 `observations` 表，或绑定可选的 `timeseries_version_id`。二者不能同时提供，否则样例明确失败。
3. 如果有拓扑与点位编码不同的情况，可选择可选 `mapping_version_id`。没有映射时只接受 `point_id` 与唯一拓扑节点 ID 的精确匹配，不按名称、距离或管段相似度猜测。未能唯一匹配的行会被计入未映射警告并不绘制；显式映射中同一键指向不同目标会失败。
4. 资源下拉只列出当前用户可读且类型匹配的资源；提交及 Worker 运行时再次检查 `data_file:read`、资源状态、种类和版本 SHA。Worker 只把有界、规范化的资源明细交给 SDK，不传递对象存储键或任意文件路径。
5. 绑定资源按节点快照固定。每个可执行贡献最多声明 8 个 `resource_inputs`；一次节点执行合计最多读取 100,000 行和 8 MiB。超过任何限制时明确返回资源输入错误，整个节点失败，不截断并伪装为完整输入。

显式映射不做单位转换。值为 `0` 会保留为零；原始缺测 `null` 继续为缺测，不填零。非数值值无法绘制时作为缺失并给出警告；不修改或覆盖原始数据资源。拓扑缺少平面坐标时不伪造位置，质量摘要令空间展示不可用；高程未知时按平面高度显示并明确警告，不推断实测高程。

对于同一节点／管段、指标、单位和时间戳，若存在不同数值则拒绝该输出，提示先治理冲突。完全相同的重复行可以在视图中合并，源数据保持不变。没有显式 mapping 且点 ID 同时存在于节点和管段集合时，不猜目标，作为未映射行跳过并告警。样例视图另限制最多 5,000 个节点、10,000 条管段和 50,000 条观察；这仅是该可视化定义的处理界限。

创建来自模板的草稿不代表可以发布或运行。正式工作流仍遵循现有 `workflow:publish`、`workflow:run` 及每个数据源的 `data_file:read` 校验；完成发布后通过已有任务和结果接口执行。此功能只提供一个带拓扑摘要和可选时序叠层的双节点验收样例，不代表完整跨包依赖闭包、任意格式映射、正式拓扑产品包、模型运行或已部署服务。

## 漏损与内涝合成场景预览样例

`sdk/examples/water-scenario-preview/` 提供两个明确标注为示例的普通 DAG 模板：漏损预览与内涝预警预览。可从 Neo 仓库根目录打包：

```console
swext pack sdk/examples/water-scenario-preview ./water-scenario-preview.zip
```

清单为每个模板声明三个普通节点：固定样例输入、预览数据整理、CSV 报告，并将报告制品列为模板输出。网络样例的2个 SDK smoke case 和场景包的3个 smoke case 均已通过；两个场景的三节点链还分别通过真实 `ContainerRunner` 执行，产生24点预览及 CSV（1196／1162 字节）。MinIO 中的临时验收对象完成上传、读取并核对 SHA、删除。以上是受控组件／容器验收，不是 HTTP 上传、MySQL 任务、Worker、平台 DAG、浏览器 renderer 或成功浏览器下载端到端验收；这些仍需分别完成。

业务内容是固定的 24 个合成采样点，结果用 `is_preview: true` 标记；代码不读取真实管网、传感器、在线天气或模型。阈值只改变这些固定数值的超阈计数；“峰值”“预警”“漏损”等展示文案不代表检测算法、预测能力、准确率或实际预警服务。内涝及漏损结果都明确注明为示例；界面说明不会发送通知或控制设备。模板第三个节点输出的 CSV Artifact 根据同一组合成序列生成，不是外部文件或生产报告。自定义 renderer 接收类型化 JSON 结果并绘制预览；它不读取 CSV 字节，文件内容仍走平台授权的 Artifact 内容／下载入口。详见 Neo 包内 `sdk/examples/water-scenario-preview/docs/README.md`。

## 工作流版本封装为动态子流程节点

复合目录节点可绑定到一个精确的已发布工作流版本，并声明外层可见的端口与参数。此动态子流程实现已包含在上述 extension-lifecycle 部署分支；本地 SQLite／可信代码验证不等于对当前服务器完成完整用户态发布和执行验收。注册使用现有 `operator:manage` 权限及来源工作流访问权；向导读取的是不可变发布 Graph，不会把当前未发布草稿包含进注册。

接口由服务端相对于该发布版本复核：

- 输入只能引用没有入边、但被内部连线或最终输出使用的边界源输出；外层输入连线运行时替换该边界源。
- 输出必须对应已发布 Graph 声明的最终输出，且至少暴露一个。
- 每个外部参数映射到发布 Graph 的一个唯一节点参数；其 JSON Schema 必须和该节点发布契约精确一致。本地 JSON Pointer `$ref`（包括 `#/$defs/...`）会重基址到按来源 Schema 隔离的 `$defs`，并保留原约束和默认值；远程 Schema 引用不支持。默认值优先使用已发布节点配置值，其次用 Schema `default`。
- 端口的 `data_type`、`semantic_type`、`unit` 均需和来源定义完全一致。只有在接口中显式暴露的参数会投影到外层属性；被暴露的资源版本参数保留来源控件并将精确版本绑定传递给内部叶节点，不自动追随资源当前版本。

编码、重复映射、未知端口／参数、未使用的输入或类型／语义／单位不匹配都会拒绝注册。相同目录 `node_code@node_version` 的接口不能修改，也不能重绑到另一来源版本；后续变更必须为来源或目录节点发布新版本。子流程节点与依赖摘要保存在现有算子目录中，来源删除受到版本引用保护；删除仍被引用的来源工作流会返回 `COMPOSITE_SOURCE_IN_USE`。目录按来源工作流可见性和目录节点状态筛选；内部扩展权限在展开校验、外层发布和运行时复核，数据权限在运行绑定和读取时检查，子流程节点不会成为权限代理。草稿校验也会展开子流程并检查内部叶节点规则，错误映射回外层子流程根节点；不会等到发布时才首次发现内部 Schema／端口问题。

外层发布时保留作者图，同时冻结展开后的执行计划、来源发布版本和接口／依赖摘要。运行仍由既有 DAG 协调器处理展开后的叶节点，不启用另一套引擎。当前约束为最多 3 层嵌套、100 个叶节点、200 条边；循环或超限图会失败。新运行会重新检查来源权限、精确依赖和冻结摘要；此前内置固定复合节点的支持，不代表数据库新注册子流程已经接通。

运行详情仅在确有子流程时返回 `subflow_sources`，包括来源名称、外层引用路径、目录节点编码／版本和来源发布版本 ID；没有子流程的旧运行不增加空数组字段。运行页按叶节点呈现状态和执行路径，不是折叠层级树。当前网络样例的 SQLite 集成测试确认封装后仍显示 `0` 与 `null`，并保留拓扑、时序两个精确文件版本引用。

### 本地作者复现记录

2026-09-27 使用已有 Neo Python 3.12.10 环境及已安装 SDK，对 `swext init` 生成的全新 scale 样例依次完成清单检查、ZIP 打包、ZIP 复查及显式信任的 `swext run-local --trust-local-code`。输入 `3`、参数 `factor=4`，类型化输出为 `12`。样例、请求和输出保存在仓库外的本地复现目录，不进入 Git。此记录只证明已知作者样例可通过 SDK 的本地运行路径，不表示包已上传或注册，不是容器隔离、服务器 API、数据库或对象存储验收；`run-local` 仍会在本机直接执行信任代码。

## 跨包类型、版本兼容与提交保护

schema 2 的 `publisher.<namespace>` 是同一发布者下的 namespace 别名。平台在包解析时将它映射到当前所有者的实际 namespace；作者不应把某个用户数字 ID 写进类型引用。跨包使用仍逐项解析精确 kind／namespace／code／version，并检查依赖对当前用户可见、已安装且未撤销，并由该用户逐一启用。公开批准只决定依赖的可见性，不替用户启用。公开 consumer 不能只因其依赖类型“存在”就通过公开审核：依赖包需要先达到当前公开资格。

本地跨包测试使用类型包声明 `shared-types/reading@1.0.0`，consumer 以 `publisher.shared-types/reading@1.0.0` 引用它。依赖尚未公开时，consumer 的公开申请拒绝；依赖公开后，用户2仍须自行启用 consumer 才能运行。结果按既有工作流产物权限隔离，用户1不能读取用户2运行的私有结果。该场景验证一个跨包精确 Schema 与授权路径，不等于所有多级依赖图或任意发布者组合都已验收。

同一包的 schema 2 扩展版本可以并存。版本目录保留被停用版本的历史元数据，并以 `available=false` 标明该用户当前不能执行；用户1停用较新的版本后，仍启用的旧版本可继续作为该用户的可用版本，用户2对 schema 2 版本的个人启用不因此被关闭。历史查询不是新的执行授权。

发布工作流时，服务端在图节点 `extension_snapshot` 冻结精确包摘要、贡献声明摘要和环境快照，并记录包的 workflow-version / workflow-run 使用引用。运行前及扩展节点提交结果前会重新检查权限、版本／环境摘要和安全状态；若执行期间发生撤销，提交会失败且不会发布节点产物。Worker 丢失后的 attempt 1 与 attempt 2 是分开记录的；测试中 attempt 1 失败、attempt 2 成功，仅保留一组最终节点产物。归档也会因活动启用、引用或依赖而拒绝，不能用覆盖同版本或删除行清理历史。

## 已实现边界与待接入能力

本次 SDK／生命周期单元没有完成完整扩展产品：

- schema 2 包上传、静态解析、所有者私有身份、个人启用、公开申请／审核以及容器准备／试运行流程已随 release `20260927T040000Z-extension-lifecycle` 部署；migration `0027` 已应用。相关 PR 仍是 Draft／未合并，不应把部署状态说成主线合并。
- 后端现有 DAG 首段已把当前用户启用且通过运行门禁的 `operators`／`algorithms` 投影为既有算子目录的 `NodeDefinition`，含精确版本、输入／输出端口和参数 Schema；发布工作流时冻结扩展包摘要、声明摘要和环境快照，运行时复用既有 workflow/task 协调器。仅安装尚不足以使用节点，用户还须启用包并满足运行环境和验证状态。
- 扩展节点目录只从 `resource_inputs` 生成平台拥有的 `resource_version` 参数选择控件；作者自带的任意 JS 参数组件不受支持，`visualization_schema` 仍为空。受限 `ExtensionView` renderer 已接入结果页，只支持前述数据块并由平台 Angular 组件显示；这不是任意 React／Angular 插件或工作流节点定制宿主。
- 当前节点运行已按精确类型引用检查输入和输出，并对有用版本记录冻结快照和使用引用；一个已验证的跨包类型路径不能代表完整多级依赖闭包、全部发布者组合或所有兼容回退情形。
- 有界不透明二进制 Artifact 通道已接入 SDK、既有 DAG、暂存对象存储、授权内容读取与未发布对象清理；它只传递字节，不解析 Arrow／Parquet 语义，也不提供模型注册／下载／生命周期。部署的 migration `0027_extension_lifecycle` 新增 `sw_extension_artifact_stage`。MinIO 中的临时验收对象完成 standalone put／verified-read／delete 和 SHA 核对，但不等于 HTTP／Worker／DAG 对象生命周期或浏览器成功下载；浏览器下载完整路径仍待验收。不要把该通道描述成全链路已验收的生产文件服务。
- Python 3.12 CPU 档是当前首个实现目标；其他 SDK、运行档、依赖审批机制及既有 schema 1 运行兼容仍需独立验证。

因此，已有 SDK 和已部署首段不表示 Arrow／Parquet 等制品语义解析、模型注册／下载／生命周期、正式拓扑产品、完整多级跨包依赖、自定义扩展节点／参数 UI 或完整生命周期产品已经完成；当前尚缺完整 HTTP／MySQL 任务／Worker／DAG／浏览器贯通与独立安全审计。

## 本地检查证据与交接

截至 2026-09-27，本地完整后端回归489项通过、15项因可选依赖缺失跳过、4项真实基础设施用例排除；5项迁移检查通过。子流程 SQLite／可信适配器回归和二进制 Artifact 协议／权限／回收测试结果见对应测试；它们不替代真实服务验收。此前486项回归、15项可选跳过、4项真实基础设施排除是较早检查点，不与当前489项相加。

服务器129项定向测试及数值、GPU、preflight、smoke 检查通过；部署测试环境最初继承 `softtime=0`，仅对 deployment test environment 做了修复，生产配置未变。release `20260927T040000Z-extension-lifecycle` 使用 Neo `6cf09ae`、前端 `7b46f21`、契约 `65084651`、文档 `51a4ca0`；核验 gzip 备份后应用 `0027`，确认已发布 `0021`–`0026` migration 文件字节未变，8 项服务健康且自启动仍为 disabled。此为部署分支 release，不代表完整主线合并。

Docker Engine 29.1.3 独立 `ContainerRunner` 检查6项通过：成功输出 `3 * 4 = 12`；UID 65532、root/package/input 写入拒绝、仅 loopback 网络接口且外连失败；两条 progress 事件间隔至少1秒；预期执行失败；取消、超时；128 MiB 限制下 OOM；以及人工遗留归属容器／workspace 经 `cleanup_owned` 回收。容器和 staging workspace 均核验已清理。它不经过 HTTP、MySQL 任务所有权／持久化或完整 Worker 生命周期；人工清理演练不等于 Worker SIGKILL／数据库 reaper，也不是独立安全审计。

网络样例2个 SDK smoke case、场景包3个 smoke case 均通过；两个场景的实际 `ContainerRunner` 三节点链分别产出24点预览和1196／1162字节 CSV。MinIO 中的临时验收对象 put、read-and-SHA-verify、delete 成功。它们是有边界的实际容器／存储组件验收，不是正式 HTTP 上传→MySQL task→Worker→DAG 或浏览器链路验收。

本地前端65个测试文件共260项通过，Production build 通过。浏览器当前为匿名状态，扩展目录／模板请求返回401；尚未通过登录态完成上传、启用、创建 DAG、结果展示与成功浏览器文件下载。既有4宽度 network 检查和扩展画布390／1440键盘检查使用固定合成数据，其余鼠标／宽度路径也待验。容器和 MinIO 中临时验收对象的组件测试不替代这些浏览器集成；QuickJS Worker／预算亦未通过独立安全审计。

剩余门槛：登录态 HTTP 上传→MySQL task→Worker→DAG→renderer／成功浏览器下载；私有／公共扩展双账号隔离验证（新建验收账号待用户确认）；Worker SIGKILL／数据库 reaper 检查。Draft PR 仍未合并，当前部署不代表主线完整合并。本轮未进行独立安全审计，不据此作安全认证承诺。

## 实现与契约依据

- SDK：`sdk/python/README.md`、`pyproject.toml`，以及 `src/smart_water_extensions/{cli,manifest,package,protocol,runner}.py`；前端类型见 `sdk/frontend/index.d.ts` 与 `sdk/frontend/README.md`。
- schema 2 与状态策略：`app/platform/extensions/{version_two,lifecycle_policy}.py`；个人可见性、操作、类型、节点目录和冻结引用：`app/infrastructure/extensions/{personal,lifecycle_operations,access,type_registry,node_registry,operator_catalog,workflow_references}.py`。
- HTTP 与任务边界：`app/interfaces/http/extensions.py`、`app/interfaces/worker/foundation.py`、`app/entrypoints/{settings,celery}.py`。
- Docker 与资源回收：`app/infrastructure/extensions/{container_policy,container_runner,execution_resources}.py`；授权只读源码见 `app/infrastructure/extensions/visualizations.py` 与 `app/interfaces/http/extensions.py`。数据库迁移见契约仓库 `migrations/versions/0027_extension_lifecycle.py`，字段和路径见 `docs/API_CONTRACT_V1.md` 的“扩展生命周期 schema 2”节。
- DAG 执行与工作流接线：`app/infrastructure/extensions/node_execution.py`、`app/platform/workflows/application.py`、`app/infrastructure/runtime/workflow_execution.py`、`app/bootstrap/foundation.py`、`app/bootstrap/production_worker.py`。
- 动态子流程接口与展开：`app/platform/workflows/{subflow_interface,subflow_expansion,application}.py`、`app/infrastructure/persistence/{subflow_registry,workflow_repository}.py`、`app/infrastructure/extensions/{dynamic_nodes,operator_catalog}.py`；来源引用、叶节点尝试和运行追溯在 `app/infrastructure/runtime/workflow_execution.py`。
- 子流程作者与网络资源证据：`tests/extensions/test_subflows.py`、`tests/extensions/test_network_package.py`；对话框和只读来源展示见 `src/app/features/workflows/workflow-composite-registration-dialog.component.ts`、`composite-registration/`、`workflow-subflow-sources.component.ts` 及 `workflow-run-detail.page.*`。
- 前端生命周期目录／分页及 `available_operations` 动作入口见 `src/app/features/extensions/extensions.page.*`、`extension-lifecycle.component.*`；受限结果视图位于 `src/app/shared/extensions/{runtime,view}/`，授权结果入口为 `extension-result.component.ts`，本地合成示例为 `src/playground/foundation/extension-host-demo.component.ts`。
- 数据绑定／模板及样例：`app/infrastructure/extensions/{resource_inputs,workflow_templates}.py`、`sdk/python/src/smart_water_extensions/manifest.py`、`sdk/examples/network-inspection/`；对应本地构建和绑定证据在 `tests/extensions/{test_network_package,test_resource_inputs}.py`。跨包版本、安全回退和租约证据见 `tests/extensions/test_cross_package.py`。
- 前端资源选择集成见 `src/app/shared/extensions/extension-resource-field.component.ts`、`src/app/shared/components/operator-parameter-form.component.ts` 与 `src/app/features/workflows/workflow-starter.page.ts`。
- 测试：`tests/extension_sdk/`、`tests/extensions/test_personal_lifecycle.py`。基础 DAG 路径由 `test_installed_extension_runs_in_existing_dag_with_frozen_types_and_usage` 验证，资源绑定样例由 `test_two_node_package_runs_static_and_timeseries_against_versioned_resources` 验证；可信适配器限制见测试文件说明，不得包装成 Docker 隔离或生产验收。
