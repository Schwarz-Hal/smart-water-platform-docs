---
id: development.first-api-call
title: 登录认证与调用第一个 API
document_type: development
document_version: 1.1.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M01, M08]
related_operators: []
related_apis: ["/api/v1/auth/login", "/api/v1/auth/me"]
owners: [backend-team]
reviewed_at: 2026-08-21
summary: 使用登录接口获取令牌并调用当前用户接口。
---

# 登录认证与调用第一个 API

## 用途与权限

用于验证登录和当前用户查询；登录无需已有 Access Token，当前用户接口需要登录。

## 请求

登录提交用户名和密码；后续请求使用 Bearer Token。

## 响应

成功响应包含 `data` 和 `trace_id`。

## 错误与重试

认证失败先检查账号状态和令牌有效期，不重复提交错误密码。

## 前置条件

准备受控的 API 地址和已启用账号。不要把真实密码、Token 或内部地址写入代码、日志或文档。

## 登录和调用

```bash
curl -X POST "$API/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

从响应的 `data.access_token` 读取令牌，然后调用：

```bash
curl "$API/api/v1/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

成功响应使用 `{code, message, data, trace_id}` 包络。认证失败时检查账号状态和令牌有效期，并记录 `trace_id`；客户端还要兼容 FastAPI 的 `detail` 错误字段。
