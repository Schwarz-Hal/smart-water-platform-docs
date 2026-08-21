---
id: user.users-roles
title: 用户、角色和批量权限管理
document_type: user_guide
document_version: 1.0.0
status: published
locale: zh-CN
audience: [admin]
related_modules: [M01]
related_operators: []
related_apis: ["/api/v1/admin/users", "/api/v1/admin/roles"]
owners: [admin-team]
reviewed_at: 2026-08-21
summary: 系统管理员维护用户列表、分配 RBAC 角色、修改密码、冻结违规账号与批量权限授权。
---

# 用户、角色和批量权限管理

具备系统管理员权限（`admin`）的用户可通过【系统设置】→【用户与权限】模块对平台人员与安全策略进行统一配置。

---

## 1. 用户账号管理

- **用户列表与状态管控**：查阅全平台用户注册信息、最后登录时间与账号状态（`活跃` / `冻结` / `待审核`）；
- **账号冻结与解冻**：一键临时冻结可疑账号，阻断其继续发起任务与访问敏感数据；
- **重置密码**：协助遗忘密码的业务人员重置为高强度临时密码。

---

## 2. 角色与权限分配

- **分配角色**：在用户详情中勾选分配角色（`operator`、`developer`、`admin`）；
- **权限明细查验**：界面直观呈现所选角色具备的 30+ 项原子功能权限点（如 `dataset:import`、`operator:edit_default`、`workflow:publish` 等）。
