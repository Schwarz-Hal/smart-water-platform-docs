---
id: api.lifecycle
title: 资源回收与用户生命周期 API
document_type: development
document_version: 1.0.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M01, M02, M05, M07]
related_operators: []
related_apis: ["/api/v1/admin/recycle-bin", "/api/v1/admin/recycle-bin/{id}/restore", "/api/v1/admin/recycle-bin/{id}/purge"]
owners: [backend-team]
reviewed_at: 2026-08-21
summary: 软删除资源检索、一键恢复、物理彻底清理及用户生命周期管理接口规范。
---

# 资源回收与用户生命周期 API

---

## 1. 回收站资源管理

- **查询回收站列表**：`GET /api/v1/admin/recycle-bin`
- **恢复资源**：`POST /api/v1/admin/recycle-bin/{id}/restore`
- **彻底物理清理**：`DELETE /api/v1/admin/recycle-bin/{id}/purge`
