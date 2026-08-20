---
id: development.first-api-call
title: 登录认证与调用第一个 API
document_type: development
document_version: 1.0.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M01, M08]
related_operators: []
related_apis: [/api/v1/auth/login]
owners: [backend-team]
reviewed_at: 2026-08-20
summary: 使用登录接口获取访问令牌并调用当前用户信息接口。
---

# 登录认证与调用第一个 API

## 前置条件

需要具有已启用的平台账号和 API 地址。真实令牌只应保存在受控客户端会话中，不应写入源代码、截图或示例文档。

## 登录

```bash
curl -X POST "$API/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"your_username","password":"your_password"}'
```

从响应中读取访问令牌后，可以调用当前用户接口：

```bash
curl "$API/api/v1/auth/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## 结果与错误

成功响应包含用户身份、角色和权限。认证失败时检查账号状态与令牌是否过期；客户端应显示服务返回的安全错误信息，并使用 `trace_id` 协助排查。
