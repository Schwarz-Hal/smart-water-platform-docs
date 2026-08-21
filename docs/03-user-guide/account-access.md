---
id: user.account-access
title: 注册、登录、退出与账户管理
document_type: user_guide
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, operator, developer, admin]
related_modules: [M01]
related_operators: []
related_apis: ["/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/auth/me"]
owners: [product-team]
reviewed_at: 2026-08-21
summary: 指导用户完成平台账号注册、登录认证、个人信息维护与安全退出。
---

# 注册、登录、退出与账户管理

智慧水务算法平台采用标准的 JWT（JSON Web Token）无状态鉴权体系，为各类水务业务与算法研发人员提供安全的账户访问环境。

---

## 1. 账号注册与登录

### 用户登录
1. 访问平台主入口（如 `http://<server-ip>/login`）；
2. 输入已注册的 **用户名** 与 **密码**；
3. 点击【登录】。认证成功后，系统将在本地安全存储加密的 Access Token 并自动跳转至平台控制台首页。

### 新用户注册
1. 在登录界面点击【注册新账号】；
2. 填写 **用户名**、**电子邮箱**、**设置密码**（需满足至少 8 位及复杂度要求）；
3. 选择所申请的初始角色（默认为 `operator` 业务操作员）；
4. 提交注册后，需等待系统管理员在后台审批通过或直接登录生效（视系统部署模式而定）。

---

## 2. 个人信息与会话管理

- **查看当前用户信息**：点击顶部导航栏右上角的用户头像，可查阅当前用户的登录名、归属角色（`admin` / `developer` / `operator`）及分配的功能权限集；
- **会话有效期与自动续期**：平台 Access Token 默认有效期为 24 小时。若长时间未操作导致凭据过期，系统将弹出登录重连提示；
- **安全退出登录**：点击用户菜单中的【退出登录】，系统将立即注销本地 Token 并清空会话缓存，安全重定向至登录界面。
