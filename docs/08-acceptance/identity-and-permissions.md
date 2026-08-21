---
id: acceptance.identity-permissions
title: 注册、权限隔离与管理员操作验收
document_type: acceptance
document_version: 1.0.1
status: published
locale: zh-CN
audience: [project_stakeholder, admin, operator]
related_modules: [M01]
related_operators: []
related_apis: ["/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/users"]
owners: [quality-team]
reviewed_at: 2026-08-21
summary: 验证注册、登录、角色隔离和管理员操作步骤，并记录请求与响应证据。
---

# 注册、权限隔离与管理员操作验收

## 1. 验收步骤

- [ ] 创建经批准的测试账户并完成登录，记录请求、响应和账户状态。
- [ ] 使用非管理员角色访问管理员资源，记录请求、响应状态和权限结果。
- [ ] 使用管理员角色执行允许的用户或默认参数操作，记录审计信息。
- [ ] 使用失效凭据或过期 Token 重试，记录错误响应和重新认证路径。

## 2. 预期结果

每个角色只能执行授权范围内的操作；成功和拒绝响应都必须与 API 契约及审计记录对应。

## 3. 证据记录

| 步骤 ID | 证据标识/链接 | 审阅人 | 日期 | 结论 |
| --- | --- | --- | --- | --- |
| IP-01 | 待执行：填写请求报告、trace_id 或链接 | 待指定 | 待填写 | [ ] 通过 |
| IP-02 | 待执行：填写拒绝响应、trace_id 或链接 | 待指定 | 待填写 | [ ] 通过 |
| IP-03 | 待执行：填写审计记录、请求报告或链接 | 待指定 | 待填写 | [ ] 通过 |
| IP-04 | 待执行：填写错误响应、trace_id 或链接 | 待指定 | 待填写 | [ ] 通过 |
