---
id: user.users-roles
title: 用户、角色与权限
document_type: user_guide
document_version: 1.2.0
status: published
locale: zh-CN
audience: [platform_user, admin]
related_modules: [M01]
related_operators: []
related_apis: ["/api/v1/auth/register", "/api/v1/auth/me", "/api/v1/users", "/api/v1/users/{user_id}/roles"]
owners: [product-team]
reviewed_at: 2026-08-21
summary: 通过登录、用户管理和角色页面维护账户权限。
---

# 用户、角色与权限

## 用途

通过角色和权限控制数据、算法、工作流、任务与系统管理操作。

## 前置条件与角色

注册是否开放由平台配置决定。管理员负责用户和角色管理；普通用户只能查看自己的账户信息和页面实际可用功能。

## 操作步骤

1. 注册开放时，在登录页选择注册并填写用户名、显示名称和至少 12 位密码；注册关闭时，由管理员在【用户管理】中创建账号。
2. 管理员打开用户列表，查看账号状态和角色；需要时修改显示名称、启用或停用账号。
3. 在角色设置中为用户选择一个或多个角色。常见角色包括管理员、数据操作员、算法操作员、基础用户和只读用户。
4. 保存角色变更后，通知用户重新登录；用户在登录后按页面实际显示的权限使用功能。

## 结果与失败处理

用户名重复、角色无效或密码不符合要求时，页面会阻止保存并提示原因。账号停用或注销后不能继续创建任务；不要在浏览器、截图或工单中保存密码和访问令牌。
