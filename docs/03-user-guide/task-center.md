---
id: user.task-center
title: 任务中心、日志流与实例管理
document_type: user_guide
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, operator, developer, admin]
related_modules: [M07]
related_operators: []
related_apis: ["/api/v1/tasks"]
owners: [product-team]
reviewed_at: 2026-08-21
summary: 全局异步任务监控、状态过滤、实时标准日志流、任务强制终止与失败重试操作。
---

# 任务中心、日志流与实例管理

任务中心（Task Center）统一聚合展示平台发生的所有异步计算、数据导入、模型训练与工作流执行实例。

---

## 1. 任务筛选与全局视图

- **多维组合筛选**：支持按任务类型（`workflow_run`、`csv_import`、`model_train`）、状态（`PENDING`、`RUNNING`、`SUCCESS`、`FAILED`）、触发人及时间范围进行快速检索；
- **耗时与资源开销**：直观展示每个任务的排队耗时、实际执行耗时与分配的 Worker 节点。

---

## 2. 实例操作与排障

- **查看实时日志流**：点击任务进入详情页，实时 WebSocket 日志抽屉输出标准输出（Stdout）与错误堆栈（Stderr）；
- **任务取消与重运行**：
  - 对处于 `PENDING` 或 `RUNNING` 状态的长耗时任务，点击【终止任务】可安全撤回并释放 Worker 槽位；
  - 对 `FAILED` 任务，点击【使用相同参数重运行】，系统将自动复制参数并创建新运行实例。
