---
id: api.tasks-events
title: 任务、结果、日志与 WebSocket API
document_type: development
document_version: 1.1.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M07]
related_operators: []
related_apis: ["/api/v1/tasks", "/api/v1/tasks/{task_id}", "/api/v1/ws/tasks/{task_id}"]
owners: [backend-team]
reviewed_at: 2026-08-21
summary: 任务查询、日志、取消、人工重运行和实时进度接口。
---

# 任务、结果、日志与 WebSocket API

## 用途与权限

提供任务查询、日志、取消、人工重运行和实时进度；接口按 `task:read`、`task:cancel` 和 `task:rerun` 校验。

## 请求

任务查询使用路径和筛选参数；取消无请求体，WebSocket 使用 Token。

## 响应

REST 返回任务状态和 `trace_id`；WebSocket 返回进度事件，终态后关闭连接。

## 错误与重试

以 MySQL 支撑的 REST 状态为准；基础设施错误可恢复，参数、权限和业务错误不自动重试。

## 1. REST 任务接口

`GET /api/v1/tasks` 支持 `task_type`、`status`、时间、数据集、工作流、分页等筛选；`GET /api/v1/tasks/{task_id}` 返回状态、进度、错误和 `trace_id`；`GET /api/v1/tasks/{task_id}/logs` 返回按时间排序的日志；`POST /api/v1/tasks/{task_id}/cancel` 协作式取消；`POST /api/v1/tasks/{task_id}/rerun` 只支持已终态的工作流任务并创建新任务。

状态通常为 `pending → queued → running → success|failed|cancelled`，导入还可能出现 `mapping`。未知状态应按处理中展示。`GET /api/v1/results/tasks/{task_id}` 查询算法结果，`payload` 由结果类型决定，不能假定统一字段。

## 2. WebSocket

连接：

```text
ws://<host>:18000/api/v1/ws/tasks/{task_id}?access_token=<access_token>
```

也可用 `Authorization: Bearer <access_token>` 请求头。需要 `task:read`；鉴权失败以关闭码 `1008` 关闭。事件包含 `task_id`、`task_type`、`status`、`progress`、`trace_id` 和错误字段。WebSocket 只做实时刷新，断线后必须用任务 REST 接口恢复状态。
