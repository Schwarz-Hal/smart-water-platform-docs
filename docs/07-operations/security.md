---
id: operations.security
title: 账户、网络、凭据和只读数据源安全
document_type: operations
document_version: 1.0.0
status: published
locale: zh-CN
audience: [operator, admin]
related_modules: [M01, M07]
related_operators: []
related_apis: []
owners: [security-team]
reviewed_at: 2026-08-21
summary: 网络防火墙策略、TLS 加密、JWT 凭据轮换与只读外部数据库安全边界管控。
---

# 账户、网络、凭据和只读数据源安全

平台遵循最小权限原则（PoLP）与深度防御理念：
- **外部数据源安全**：仅请求只读账号，驱动层强制 `READ ONLY`；
- **网络隔离**：中间件仅监听 `127.0.0.1`，仅对网关开放 80/443 端口；
- **审计追踪**：全量写入与删除操作记录客户端 IP 与用户身份。
