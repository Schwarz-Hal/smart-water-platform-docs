---
id: api.auth-users
title: 认证、账户、用户与角色 API
document_type: development
document_version: 1.0.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M01]
related_operators: []
related_apis: ["/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/me", "/api/v1/admin/users", "/api/v1/admin/roles"]
owners: [backend-team]
reviewed_at: 2026-08-21
summary: JWT 登录鉴权、注册、当前用户状态查询与管理员用户角色分配 RESTful 接口规范。
---

# 认证、账户、用户与角色 API

---

## 1. 用户登录认证

- **接口**：`POST /api/v1/auth/login`
- **请求体 (JSON)**：
  ```json
  {"username": "water_engineer", "password": "SecurePassword123"}
  ```
- **响应**：返回 `access_token` 与 `token_type: "bearer"`。

---

## 2. 查询当前用户信息

- **接口**：`GET /api/v1/auth/me`
- **请求头**：`Authorization: Bearer <TOKEN>`
- **响应**：包含用户 ID、用户名、邮箱、角色列表与权限标识集合。
