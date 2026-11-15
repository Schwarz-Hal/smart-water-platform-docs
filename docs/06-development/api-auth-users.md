---
id: api.auth-users
title: 认证、账户、用户与角色 API
document_type: development
document_version: 1.3.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M01]
related_operators: []
related_apis: ["/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/me", "/api/v1/users"]
owners: [backend-team]
reviewed_at: 2026-11-15
summary: JWT 登录、Token 刷新、账户状态、角色管理和密码创建长度规则接口。
---

# 认证、账户、用户与角色 API

## 用途与权限

提供 JWT 认证和账户管理；用户管理需要 `user:manage`，角色覆盖需要 `role:manage`。

## 请求

### 个人模型开发接口

以下接口均使用平台 Bearer 鉴权，仅操作当前用户，不接收其他账号 ID，不要求管理员角色：

| 方法与路径 | 内容 |
| --- | --- |
| GET /api/v1/personal-model/deepseek/settings | 返回 provider、configured、enabled、storage 和 expires_after_hours |
| POST /api/v1/personal-model/deepseek/settings | JSON：enabled 为布尔值，可选 key；不传 key 时保留现有 Key |
| DELETE /api/v1/personal-model/deepseek/settings | 清除当前账号 Key 并关闭服务 |
| POST /api/v1/personal-model/deepseek/turn | JSON：messages、state；用于 L-Town 公开示例对话 |

设置接口返回直接 JSON，而非通用 data 信封。Key 只保存在 API 进程内存，最长 8 小时；不写数据库或日志、不回显。此开发版本使用单 API 进程，多进程共享配置不在本轮范围。

对话返回 application/x-ndjson，每行是 text、done 或 error 事件。done 携带校验后的工具调用，工具不在本接口执行。只使用 DeepSeek 官方地址。普通查询、配置、调用均按登录用户隔离；每个用户同一时间只允许一个模型请求。

请求受理前返回 400（无效参数）、401（未登录）、409（未启用）、413（请求过大）或 429（正在请求）。流式上游错误通过 error 事件给出 MODEL_KEY_REJECTED、MODEL_BALANCE、MODEL_RATE_LIMIT 或 MODEL_UNAVAILABLE，不返回上游正文。流期间关闭服务、清除 Key 或 Key 到期时可能返回 MODEL_NOT_ENABLED，需重新检查设置。无新增数据库迁移。

认证请求使用 JSON；受保护接口携带 Bearer Token。

## 响应

认证、账户和用户管理接口的成功响应读取 `data`，并保存 `trace_id`；`/auth/me` 返回实际权限。个人模型设置接口返回直接 JSON，对话接口返回 NDJSON，不适用该信封格式。

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

公开注册和管理员创建用户时，新密码长度为 8–256 个字符；不要求大小写、数字或符号的组合。此规则只约束创建请求，不改变登录接口对已有密码的兼容。

## 2. 用户管理

需要 `user:manage` 的管理员调用 `POST /api/v1/users` 创建用户、`GET /api/v1/users` 查询列表、`GET /api/v1/users/{user_id}` 查询详情、`PATCH /api/v1/users/{user_id}` 修改显示名称或启停状态、`DELETE /api/v1/users/{user_id}` 注销用户，以及 `POST /api/v1/users/{user_id}/restore` 恢复。

## 3. 角色管理

`PUT /api/v1/users/{user_id}/roles` 覆盖单个用户角色；`POST /api/v1/users/batch/roles` 批量覆盖。分别需要 `role:manage`。角色变化会使旧 Access Token 失效，调用方应要求重新登录。创建用户密码至少 8 个字符且最多 256 个字符，无字符类别组合要求；重复用户名返回 `409`，无效角色返回 `422`。
