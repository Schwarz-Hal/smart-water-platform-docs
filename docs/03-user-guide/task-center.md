---
id: user.task-center
title: 任务中心、日志流与实例管理
document_type: user_guide
document_version: 1.1.0
status: published
locale: zh-CN
audience: [platform_user, operator, developer, admin]
related_modules: [M07]
related_operators: []
related_apis: ["/api/v1/tasks"]
owners: [product-team]
reviewed_at: 2026-09-07
summary: 全局异步任务监控、状态过滤、日志查询、取消申请与失败重试操作。
---

# 任务中心、日志流与实例管理

任务中心（Task Center）统一聚合展示平台发生的所有异步计算、数据导入、模型训练与工作流执行实例。

---

## 1. 任务筛选与全局视图

- **多维组合筛选**：支持按任务类型（`workflow_run`、`csv_import`、`model_train`）、状态（`PENDING`、`RUNNING`、`SUCCESS`、`FAILED`）、触发人及时间范围进行快速检索；
- **耗时与资源开销**：直观展示每个任务的排队耗时、实际执行耗时与分配的 Worker 节点。

---

## 2. 实例操作与排障

- **查看任务事件与可公开日志**：点击任务进入详情页查看执行记录。治理失败提供安全的中文原因和错误码，不向普通用户展示原始异常堆栈；
- **任务取消与重运行**：
  - 对支持取消的任务提交取消申请；正在执行的算法可能需要到达安全边界。以服务端最终状态为准，不保证点击后立即释放 Worker 槽位；
  - 对 `FAILED` 任务，点击【使用相同参数重运行】，系统将自动复制参数并创建新运行实例。

## 3. 治理任务的反馈

数据中心的【治理任务】使用同一套任务记录，提供来源文件、版本、操作类别和结果入口。治理详情优先接收实时状态，连接异常时通过状态查询恢复；日志读取与任务状态分离。

进度指示反映实际执行阶段，不是剩余时间承诺。显示“状态暂未同步”时应先检查连接，不能据此判断算法失败。治理弹窗关闭不取消任务；在当前用户会话中仍可收到关注任务的终态提示，并通过精确运行链接查看结果或失败原因。
