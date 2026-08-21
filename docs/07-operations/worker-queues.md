---
id: operations.worker-queues
title: CPU、工作流与专用运行时 Worker 架构
document_type: operations
document_version: 1.2.0
status: published
locale: zh-CN
audience: [operator, developer]
related_modules: [M07]
related_operators: []
related_apis: ["/api/v1/tasks/{task_id}"]
owners: [operations-team]
reviewed_at: 2026-08-21
summary: 说明当前 Celery 队列、Worker 服务和任务恢复边界。
---

# CPU、工作流与专用运行时 Worker 架构

## 前置条件

API、Worker、Scheduler、训练 Worker、Provisioner 和 GPU Runtime Worker 使用同一代码基线但职责分离。服务由 systemd user units 管理，队列分工以服务器配置为准。

## 队列划分

| 队列 | 用途 |
| --- | --- |
| `ingest` | CSV 和只读 MySQL 导入 |
| `quality` | 独立质量任务 |
| `cpu_algorithm` | CPU 算法和历史 S01 |
| `training_cpu` | CPU 训练任务 |
| `workflow_node` | 工作流节点子任务；GPU 节点由协调器创建并等待子任务唤醒 |
| `gpu_runtime_py312_torch28_cu128_v1` | 当前 GPU Runtime Profile 队列；GPU 诊断和 GPU 算法实际路由到这里 |
| `gpu_algorithm` | 历史/兼容队列；不是当前 GPU Runtime Profile 的实际主消费队列 |
| `algorithm_management` | 外部算法包静态检查 |
| `algorithm_provisioning` | 外部算法运行环境制备和试运行 |
| `workflow` | 工作流按拓扑顺序执行 |
| `dataset_management` | 数据资产永久清除 |
| `system` | 分发扫描、心跳恢复和暂存清理 |

CPU Worker 不消费 GPU 队列，GPU Worker 不消费 CPU、导入或工作流队列。训练任务使用独立训练 Worker，不应阻塞普通工作流 Worker。GPU 节点会创建 `workflow_node` 子任务并等待后续唤醒；普通 CPU/工作流节点仍按既有顺序边界执行。

## 检查

检查各 systemd user unit、Worker 心跳、RabbitMQ 队列和 MySQL 分发表，确认每个 Worker 只监听预期队列。

## 操作步骤

修复队列或 Worker 后，观察任务从 `queued` 到终态的收敛，并用任务日志确认实际执行者。

## 验证与失败处理

任务先在 MySQL 创建分发表，再尝试投递。Worker 以状态修订原子领取，重复消息只有一个执行者；Scheduler 可恢复未投递或失去心跳的任务。检查任务状态和日志，不以 Redis 事件作为最终依据。取消在节点边界协作收敛，单个调用不保证立即终止。

## 验证与回退

验证代表性导入、质量、工作流和（如有）GPU 任务；若新 Worker 配置不稳定，恢复上一份已验证配置并重新检查任务状态。
