---
id: operations.gpu-runtime
title: GPU Runtime 与模型缓存管理
document_type: operations
document_version: 1.3.0
status: draft
locale: zh-CN
audience: [operator, developer]
related_modules: [M04, M07]
related_operators: [chronos2_flow_forecast]
related_apis: ["/api/v1/diagnostics/gpu", "/api/v1/runtime-workers"]
owners: [operations-team]
reviewed_at: 2026-10-22
summary: 说明 GPU Profile、专属队列和诊断任务的边界。
---

# GPU Runtime 与模型缓存管理

## 前置条件

本手册供获准维护 GPU 主机的运维人员和负责 Runtime Profile 的开发人员使用。主机驱动、CUDA 运行库或 GPU Python 环境变更应安排在批准的维护窗口，并先确认 GPU 队列没有待处理或运行中的任务、备份可用、当前发布可恢复。不要在普通安全更新之外扩大变更范围。

GPU Worker 的代码 Profile 标识为 `gpu-py312-torch28-cu128-v1`；其任务队列名为 `gpu_runtime_py312_torch28_cu128_v1`，两者用途不同。`gpu_algorithm` 是历史兼容队列，不应作为新 GPU 任务的路由目标。

当前主机采用 `host_venv` Runtime：它以 `environment_digest` 绑定主机 Python、依赖和 NVIDIA 驱动指纹，不以 OCI `image_digest` 识别。OCI Profile 才使用镜像摘要；不要为 `host_venv` 填入镜像摘要来代替环境摘要。模型就绪、主机 GPU 可见和 Worker 在线是不同检查，不能相互替代。

## 检查

维护前记录当前发布、Profile 版本及其环境摘要，并确认 Worker、心跳、设备标识和 Runtime readiness 状态。可通过 `GET /api/v1/runtime-workers` 查看已登记 Worker 摘要。

检查主机上的驱动可见性、目标 GPU Python 环境和它计算出的完整 Runtime 指纹。驱动更新后应比较更新前后的规范化清单；只有在证据确认变化范围符合已批准方案时才可继续。不能仅因 `RUNTIME_ENVIRONMENT_MISMATCH` 就把数据库摘要改成新值，也不能通过关闭校验或反复重启来绕过拒绝。

本地 CUDA 张量/反向传播和已选算法的小规模冒烟只能证明该 Python 进程能执行所测计算。获准的管理员还应通过 `POST /api/v1/diagnostics/gpu` 创建真正的 GPU 诊断任务，并检查任务详情和日志中的终态及设备信息；这项队列诊断与本机冒烟是两种独立证据。诊断任务不读取业务数据，也不是业务算法入口。

## 操作步骤

1. 在批准的维护窗口中更新 NVIDIA/CUDA 栈。普通安全更新保持启用；仅将 NVIDIA 驱动及库、内核 NVIDIA 模块，以及 CUDA、cuDNN、cuBLAS、cuFFT、cuRAND、cuSOLVER、cuSPARSE、NCCL、TensorRT、Nsight 等 GPU 相关包排除在无人值守升级之外。不要整体关闭安全更新。自动重启必须保持关闭，任何需要重启的维护都由运维人员另行计划并执行。
2. 更新后先验证驱动与 GPU 可见性，再运行目标 `host_venv` 的指纹和 CUDA 冒烟检查。将完整清单与批准基线逐项比较，不要把新驱动之外的依赖变更当作默认可接受。
3. 如果完整比较证明只有经批准的驱动字段发生变化，使用部署所有者控制的 Runtime Profile 同步/重绑定流程更新该 `host_venv` Profile 的环境摘要。同步必须保留代码清单哈希和其他 Profile/历史记录；这是显式、有审计证据的维护操作，不是遇到摘要不匹配时的通用修复。OCI 镜像 Profile 继续使用自己的镜像摘要流程。
4. 通过受控发布/启动流程让 GPU Worker 与独立心跳侧车加载同一 Runtime Profile。确认运行环境摘要匹配后，再验证 Worker 心跳、设备摘要及 readiness；确认 GPU 任务由专属队列消费。
5. 完成主机冒烟后，执行实际队列诊断任务并等待终态成功，再恢复普通 GPU 工作负载。只记录已观测的结果；队列任务未完成时，不能把本机冒烟、服务存活或 readiness 单项标记为诊断通过。

Chronos-2 通过已登记的 `chronos2_flow_forecast` 运行；它要求严格 15 分钟间隔和 `flow` 指标。GPU、CUDA、模型或 Worker 不可用时，任务应以明确错误码失败，不能静默回退 CPU。

## 验证与失败处理

2026-10-22 恢复时确认，此前驱动已从 `580.173.02` 自动升级至 `580.178.04`；与原基线相比，规范化运行环境清单中的 141 个发行包一致，仅驱动字段变化。CUDA 矩阵乘法反向传播与 DLinear 12 步训练冒烟通过。随后由正常调度器经 RabbitMQ 分发、既有 GPU Worker 消费，完成一项实际队列诊断，任务终态成功、进度 100%。该验证使用获准的服务器维护系统审计上下文，不模拟用户身份；它不是浏览器登录态或用户 API 会话验收。Worker 未发生重启；心跳在 Worker 建立连接时有一次初始重试，随后稳定。

记录 Profile、Worker 心跳和已完成诊断任务的 `trace_id`。常见失败包括 `RUNTIME_PROFILE_MISSING`、`RUNTIME_UNAVAILABLE`、`RUNTIME_ENVIRONMENT_NOT_PINNED`、`RUNTIME_ENVIRONMENT_MISMATCH`、`GPU_RUNTIME_NOT_INSTALLED`、`GPU_UNAVAILABLE`、`GPU_DIAGNOSTIC_FAILED` 和 `QUEUE_UNAVAILABLE`。平台不声明固定推理毫秒数或硬件性能。

遇到环境摘要不匹配时保持拒绝状态，停止 GPU Worker/心跳的重复启动；核对驱动、完整包清单、Profile 类型及其摘要后，由部署所有者决定修复或回退。旧环境摘要对应旧驱动，不能在驱动已改变时直接回滚旧摘要冒充匹配；需要恢复旧摘要时，必须先恢复并重新验证其对应的完整环境。诊断失败时保留受控审计记录、任务标识和错误码，停用不可用 GPU Worker。不得静默切到 CPU 来伪装 GPU 成功。
