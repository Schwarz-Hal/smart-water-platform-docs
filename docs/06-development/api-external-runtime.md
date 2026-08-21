---
id: api.external-runtime
title: 外部算法包与 Runtime Profile API
document_type: development
document_version: 1.0.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M04]
related_operators: []
related_apis: ["/api/v1/operators/packages", "/api/v1/operators/runtimes"]
owners: [backend-team]
reviewed_at: 2026-08-21
summary: 外部算法包上传、沙箱执行配置与 Runtime Profile 规格注册 API。
---

# 外部算法包与 Runtime Profile API

---

## 1. 上传算法包与注册运行时

- **上传并触发制备**：`POST /api/v1/operators/packages` (`multipart/form-data`)
- **查询 Runtime 环境状态**：`GET /api/v1/operators/runtimes/{runtime_id}`
