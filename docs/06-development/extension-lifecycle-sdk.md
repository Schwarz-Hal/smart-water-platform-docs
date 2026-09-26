---
id: development.extension-lifecycle-sdk
title: 扩展生命周期与 Python SDK 首段
document_type: development
document_version: 0.2.0
status: draft
locale: zh-CN
audience: [developer, operator]
related_modules: [M04, M05]
related_operators: []
related_apis: ["/api/v1/extensions/upload", "/api/v1/extensions/catalog", "/api/v1/extensions/{package_id}", "/api/v1/extensions/{package_id}/{operation}", "/api/v1/tasks/{task_id}"]
owners: [backend-team]
reviewed_at: 2026-09-26
summary: 说明 Python 扩展 SDK、schema 2 生命周期、运行环境策略和当前未完成的产品接入边界。
---

# 扩展生命周期与 Python SDK 首段

## 用途与当前状态

本文面向扩展作者和平台维护者，说明如何用 SDK 生成、检查和打包扩展，以及平台如何区分私有上传、环境准备、试运行、安装、个人启用、公开审核和安全撤销。

截至 2026-09-26，`feature/extension-lifecycle` 开发分支已加入 schema 2 上传和静态检查、个人生命周期接口、Python SDK／运行适配器，以及把已启用扩展算子接入既有 DAG 执行路径的后端首段。迁移为 `0027_extension_lifecycle`，尚未部署；当前部署的平台仍只接受 schema 1 包。下文的 DAG 验证是 SQLite 上使用可信测试适配器执行的窄路径证据，不是浏览器、真实 Docker 或生产验收。

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

已实现的 Docker 启动策略包括非 root 用户、无网络、只读根文件系统和只读输入挂载、移除 Linux capabilities、默认 seccomp/no-new-privileges、CPU／内存／进程／时间限制，以及有界私有 tmpfs 输出和暂存目录。实现策略和自动化参数检查不等于真实容器隔离已经通过验收。当前本地没有可用的 Docker Linux 引擎；未启动容器。真实 Docker 执行、取消、OOM、回收和恢复测试仍是发布门槛。

SDK 为事件附上协议版本、运行 ID、attempt 和递增序号。事件类别包括：

- `progress`：阶段名及可选的真实 `completed/total` 计数；未知工作量不生成百分比。
- `metric`：指标名、有限数值及可选步骤。
- `log`：级别和消息。
- `output_chunk`、`output_end`：有序结果分块、总长度与 SHA-256 摘要。

Worker 把进度、指标和日志写入既有任务日志；执行结束后还要检查分块顺序、大小、摘要、运行标识和输出类型，完成提交后才把任务标为成功。扩展生成的 `result.json` 只是类型化结果载荷，不是权威任务状态。错误任务可从任务详情和日志检查错误码；状态轮询或连接失败时重新读取同一任务，不要因已收到 `202` 重复创建上传或将其判为成功。

## 已实现边界与待接入能力

本次 SDK／生命周期单元没有完成完整扩展产品：

- schema 2 包上传、静态解析、所有者私有身份、个人启用、公开申请／审核以及容器准备／试运行流程已有开发分支实现；现有部署未升级到 migration 0027。
- 后端现有 DAG 首段已把当前用户启用且通过运行门禁的 `operators`／`algorithms` 投影为既有算子目录的 `NodeDefinition`，含精确版本、输入／输出端口和参数 Schema；发布工作流时冻结扩展包摘要、声明摘要和环境快照，运行时复用既有 workflow/task 协调器。仅安装尚不足以使用节点，用户还须启用包并满足运行环境和验证状态。
- 扩展节点目录投影当前没有自定义 `ui_schema` 或 `visualization_schema`（两者为空）。后端 API 已输出当前用户可用的扩展定义，但本地验证没有覆盖浏览器中能否发现、选择和呈现这些节点；自定义可视化宿主仍待接入。
- 当前节点运行已按精确类型引用检查输入和输出，并对有用版本记录冻结快照和使用引用；`tests/extensions/test_personal_lifecycle.py` 中的首个图由同一包的两个来源节点（3、5）连接到汇总节点（8）。这证明该可信测试运行时上的最小既有 DAG 路径，不代表拓扑业务样例或完整跨包 namespace 依赖闭包、所有者边界及全图类型策略已验收。
- 通用二进制 Artifact 通道、宿主签发并回收 Artifact、模型注册／下载／生命周期接入尚未实现。不要用普通 JSON `payload` 宣称这些能力已覆盖。
- Python 3.12 CPU 档是当前首个实现目标；其他 SDK、运行档、依赖审批机制、部署迁移、既有 schema 1 运行兼容及服务器运行验收仍需独立验证。

因此，SDK 和后端最小 DAG 路径均不表示通用二进制 Artifact 通道、宿主签发并回收 Artifact、模型注册／下载／生命周期、拓扑业务样例、完整跨包依赖、前端可视化宿主或完整生命周期产品已经完成。

## 本地检查证据与交接

截至 2026-09-26，定向个人生命周期记录覆盖3条主路径及110项既有回归。新增 SQLite 集成测试使用同一扩展包中的两个来源节点和一个汇总节点，验证值3与5经 DAG 汇总为8；发布版本冻结精确类型／包／环境并记录使用引用，停用阻止新运行，有引用的包拒绝归档。该测试使用仅执行测试内生成算术代码的 `TrustedAuthorTestRuntime`；它不在生产装配中，也没有启动 Docker，不能作为浏览器交互、容器隔离或服务器执行证据。本地未验证真实 Linux Docker 引擎下的镜像就绪、隔离、输出、取消、OOM 与恢复。

合并 `feature/extension-lifecycle` 前，至少应确认：迁移 `0027` 在备份和校验流程后按预期运行；未配置或未就绪镜像时无宿主回退；私有包跨用户不可见；公开申请必须审批且逐用户启用；安全撤销和引用保护有效；真实容器下输入授权、事件限制、结果校验和清理通过。任何未执行项应记录为待验收，而不是由 SDK 单测或虚拟运行时替代。

## 实现与契约依据

- SDK：`sdk/python/README.md`、`pyproject.toml`，以及 `src/smart_water_extensions/{cli,manifest,package,protocol,runner}.py`。
- schema 2 与状态策略：`app/platform/extensions/{version_two,lifecycle_policy}.py`；个人可见性、操作、类型、节点目录和冻结引用：`app/infrastructure/extensions/{personal,lifecycle_operations,access,type_registry,node_registry,operator_catalog,workflow_references}.py`。
- HTTP 与任务边界：`app/interfaces/http/extensions.py`、`app/interfaces/worker/foundation.py`、`app/entrypoints/{settings,celery}.py`。
- Docker 策略：`app/infrastructure/extensions/{container_policy,container_runner}.py`；数据库迁移见契约仓库 `migrations/versions/0027_extension_lifecycle.py`，字段和路径见 `docs/API_CONTRACT_V1.md` 的“扩展生命周期 schema 2”节。
- DAG 执行与工作流接线：`app/infrastructure/extensions/node_execution.py`、`app/platform/workflows/application.py`、`app/infrastructure/runtime/workflow_execution.py`、`app/bootstrap/foundation.py`、`app/bootstrap/production_worker.py`。
- 测试：`tests/extension_sdk/`、`tests/extensions/test_personal_lifecycle.py`。DAG 最小路径由 `test_installed_extension_runs_in_existing_dag_with_frozen_types_and_usage` 验证；测试意图和可信适配器限制见测试文件说明，不得包装成生产隔离证据。
