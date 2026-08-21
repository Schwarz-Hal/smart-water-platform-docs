---
id: operations.gpu-runtime
title: GPU Runtime 与模型缓存管理
document_type: operations
document_version: 1.2.0
status: published
locale: zh-CN
audience: [operator, developer]
related_modules: [M04, M07]
related_operators: [chronos2_flow_forecast]
related_apis: ["/api/v1/diagnostics/gpu", "/api/v1/runtime-workers"]
owners: [operations-team]
reviewed_at: 2026-08-21
summary: 说明 GPU Profile、专属队列和诊断任务的边界。
---

# GPU Runtime 与模型缓存管理

## 前置条件

GPU Worker 使用独立运行环境和 Profile `gpu_runtime_py312_torch28_cu128_v1`，实际消费同名队列；`gpu_algorithm` 仅作为历史兼容队列保留。确认 Worker 心跳、设备摘要、镜像摘要和已登记模型就绪；不要把未验证的 GPU 环境用于生产发布。

## 检查

调用 `GET /api/v1/runtime-workers` 查看在线摘要。管理员可调用 `POST /api/v1/diagnostics/gpu` 创建诊断任务，再用任务详情和日志查看 PyTorch、CUDA 和设备结果。诊断不读取业务数据，也不是业务算法入口。

## 操作步骤

Chronos-2 通过已登记的 `chronos2_flow_forecast` 运行；它要求严格 15 分钟间隔和 `flow` 指标。GPU、CUDA、模型或 Worker 不可用时，任务应以明确错误码失败，不能静默回退 CPU。

## 验证与失败处理

记录 Profile、Worker 心跳和诊断任务 `trace_id`。常见失败包括 `RUNTIME_PROFILE_MISSING`、`RUNTIME_UNAVAILABLE`、`GPU_RUNTIME_NOT_INSTALLED`、`GPU_UNAVAILABLE` 和 `QUEUE_UNAVAILABLE`。平台不声明固定推理毫秒数或硬件性能。

## 验证与回退

诊断失败时保留任务日志和错误码，停用不可用 GPU Worker 或恢复上一份已验证 Profile；不要把失败任务切换到 CPU 伪装成功。
