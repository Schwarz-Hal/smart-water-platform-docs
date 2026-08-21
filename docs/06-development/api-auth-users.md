---
id: api.auth-users
title: 认证、账户、用户与角色 API
document_type: development
document_version: 1.1.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M01]
related_operators: []
related_apis: ["/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/me", "/api/v1/users"]
owners: [backend-team]
reviewed_at: 2026-08-21
summary: JWT 登录、Token 刷新、账户状态和角色管理接口。
---

# 认证、账户、用户与角色 API

## 用途与权限

提供 JWT 认证和账户管理；用户管理需要 `user:manage`，角色覆盖需要 `role:manage`。

## 请求

认证请求使用 JSON；受保护接口携带 Bearer Token。

## 响应

成功响应读取 `data`，并保存 `trace_id`；`/auth/me` 返回实际权限。

## 错误与重试

认证失败先刷新或重新登录；用户名、角色和权限错误按返回状态处理，不重试有副作用的写请求。

## 1. 认证

| 方法与路径 | 说明 |
| --- | --- |
| `POST /api/v1/auth/register` | 在服务器开启注册时创建 `basic_user` |
| `POST /api/v1/auth/login` | 用用户名和密码获取 `access_token`、`refresh_token` |
| `POST /api/v1/auth/refresh` | 刷新访问令牌 |
| `POST /api/v1/auth/logout` | 使刷新令牌失效 |
| `GET /api/v1/auth/me` | 返回当前用户、角色和实际权限 |
| `DELETE /api/v1/auth/account` | 校验用户名和当前密码后注销本人 |

除登录、注册、刷新和健康检查外，使用 `Authorization: Bearer <access_token>`。客户端应从 `/auth/me` 的 `permissions` 控制页面，不按角色名硬编码功能。

## 2. 用户管理

需要 `user:manage` 的管理员调用 `POST /api/v1/users` 创建用户、`GET /api/v1/users` 查询列表、`GET /api/v1/users/{user_id}` 查询详情、`PATCH /api/v1/users/{user_id}` 修改显示名称或启停状态、`DELETE /api/v1/users/{user_id}` 注销用户，以及 `POST /api/v1/users/{user_id}/restore` 恢复。

## 3. 角色管理

`PUT /api/v1/users/{user_id}/roles` 覆盖单个用户角色；`POST /api/v1/users/batch/roles` 批量覆盖。分别需要 `role:manage`。角色变化会使旧 Access Token 失效，调用方应要求重新登录。密码至少 12 位；重复用户名返回 `409`，无效角色返回 `422`。
