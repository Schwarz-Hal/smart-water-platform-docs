---
id: acceptance.identity-permissions
title: 注册、权限隔离与管理员操作验收
document_type: acceptance
document_version: 1.0.0
status: published
locale: zh-CN
audience: [project_stakeholder, admin, operator]
related_modules: [M01]
related_operators: []
related_apis: [/api/v1/auth/login, /api/v1/admin/users]
owners: [quality-team]
reviewed_at: 2026-08-21
summary: 验证不同角色（操作员、算法工程师、管理员）的登录鉴权、越权访问拦截与管理功能验收。
---

# 注册、权限隔离与管理员操作验收

---

## 1. 验收测试用例

1. **普通操作员越权测试**：使用 `operator` 角色访问 `/api/v1/admin/users`，系统必须返回 `403 Forbidden`；
2. **算子默认参数修改鉴权**：验证仅 `admin` 能够调用 `PATCH .../default-parameters`，其他角色被安全拦截；
3. **密码复杂度与 Token 过期测试**：确认过期 Token 访问被强制要求重新登录。
