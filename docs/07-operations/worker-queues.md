---
id: operations.worker-queues
title: CPU、工作流与专用运行时 Worker 架构
document_type: operations
document_version: 1.0.0
status: published
locale: zh-CN
audience: [operator, developer]
related_modules: [M07]
related_operators: []
related_apis: []
owners: [operations-team]
reviewed_at: 2026-08-21
summary: Celery 分布式 Worker 队列路由、并发配置、工作流调度器与故障隔离机制。
---

# CPU、工作流与专用运行时 Worker 架构

平台采用**多队列物理隔离**的分布式 Worker 架构，避免耗时的大模型推理或数据导入任务阻塞轻量的工作流调度。

---

## 1. 队列划分与职责

| 队列名称 | 消费者 Worker | 适用任务类型 |
| :--- | :--- | :--- |
| `workflow` | `smart-water-worker-workflow` | 工作流有向图拓扑调度、节点依赖解析、状态状态机推进 |
| `default` / `cpu` | `smart-water-worker-cpu` | CSV 导入解析、Qscore 质量评估、时序清洗、Hampel、DMA 水量平衡计算 |
| `gpu_inference` | `smart-water-worker-gpu` | Chronos-2 时序大模型零样本预测、深度学习模型前向推理 |
| `training` | `smart-water-worker-training` | 专用机器学习模型长周期离线训练 |
