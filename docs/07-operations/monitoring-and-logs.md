---
id: operations.monitoring-logs
title: 任务状态、服务日志与常见故障排查
document_type: operations
document_version: 1.1.0
status: published
locale: zh-CN
audience: [operator, developer]
related_modules: [M07]
related_operators: []
related_apis: ["/health/ready", "/api/v1/tasks/{task_id}"]
owners: [operations-team]
reviewed_at: 2026-08-21
summary: 使用任务接口、trace_id 和服务日志排查导入、队列和运行时故障。
---

# 任务状态、服务日志与常见故障排查

## 前置条件与检查

需要受控运维会话和任务 ID 或 `trace_id`。先调用 `/api/v1/tasks/{task_id}` 和 `/logs`，再查看对应 systemd user service；不要复制 Authorization、密码、数据库 URI 或上传内容。

## 常见故障

| 现象 | 检查方向 | 处理 |
| --- | --- | --- |
| 任务长期 `queued` | RabbitMQ、分发表、Worker 心跳 | 检查依赖和 Worker；修复基础设施后观察 Scheduler 恢复 |
| CSV 导入失败 | 编码、表头、映射、任务日志 | 使用支持的编码和唯一映射，修正后人工重运行 |
| 质量任务失败 | 数据版本是否 `ready`、队列和报告错误 | 修正输入或依赖，不把业务错误自动重试 |
| GPU 任务失败 | Profile、Worker、CUDA、模型和 GPU 队列 | 按错误码处理；GPU 不可用时不会回退 CPU |

## 操作步骤

保存任务 ID、`trace_id`、错误码和服务日志片段，按表格方向检查依赖或输入；修正后使用人工重运行接口创建新任务。

## 验证与回退

记录错误码、任务状态、`trace_id`、服务 commit 和处理时间。人工重运行会创建新任务并保留旧结果；基础设施故障由调度器按策略恢复，参数、权限、数据质量和算法业务错误不会自动重试。
