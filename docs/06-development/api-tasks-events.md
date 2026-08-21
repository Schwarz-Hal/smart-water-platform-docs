---
id: api.tasks-events
title: 任务、结果、日志与 WebSocket API
document_type: development
document_version: 1.0.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M07]
related_operators: []
related_apis: ["/api/v1/tasks", "/api/v1/tasks/{id}", "/ws/v1/events"]
owners: [backend-team]
reviewed_at: 2026-08-21
summary: 异步任务生命周期查询、日志拉取与基于 WebSocket 的实时计算进度与事件广播推送。
---

# 任务、结果、日志与 WebSocket API

---

## 1. 任务详情与标准日志

- **接口**：`GET /api/v1/tasks/{task_id}`
- **日志接口**：`GET /api/v1/tasks/{task_id}/logs`（支持分片流式读取）。

---

## 2. WebSocket 实时事件推送通道

- **连接端点**：`ws://<host>/ws/v1/events?token=<JWT_TOKEN>`
- **事件协议**：
  ```json
  {
    "event": "TASK_STATUS_CHANGED",
    "data": {
      "task_id": "tsk_8910a",
      "status": "RUNNING",
      "progress": 45,
      "current_node": "s01_water_balance_v1"
    },
    "timestamp": "2026-08-21T15:00:00Z"
  }
  ```
