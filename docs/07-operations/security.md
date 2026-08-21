---
id: operations.security
title: 账户、网络、凭据和只读数据源安全
document_type: operations
document_version: 1.1.0
status: published
locale: zh-CN
audience: [operator, admin]
related_modules: [M01, M07]
related_operators: []
related_apis: ["/api/v1/data-sources", "/health/ready"]
owners: [security-team]
reviewed_at: 2026-08-21
summary: 说明最小权限、凭据隔离、只读源库和对象存储访问边界。
---

# 账户、网络、凭据和只读数据源安全

## 前置条件

使用服务器私有环境文件和最小权限账号。应用通过 JWT + RBAC 校验权限；客户端依据 `/auth/me` 的实际 `permissions` 控制界面，后端是最终边界。

## 安全边界

- 外部 MySQL 数据源必须 `is_read_only: true`，平台只执行查询。
- API 代理文件和 Artifact 读取；浏览器不获得 MinIO 对象地址、对象键或凭据。
- 数据库、RabbitMQ、Redis、MinIO 和管理端口不向公共网络开放；前端只访问 API `18000` 和前端 `18001` 的受控入口。
- 日志和审计可以记录任务 ID、资源 ID、用户和 `trace_id`，不得记录密码、Token、连接 URI、上传内容或密钥。

## 检查

检查环境文件权限、CORS 来源、Token 失效、只读账号、API 访问控制和依赖端口暴露范围。

## 操作步骤

发现越权或凭据异常时，先限制受影响账号或网络入口，再轮换凭据、保存审计证据并通知安全负责人。

## 验证与失败处理

定期检查环境文件权限、CORS 来源、Token 失效、只读账号和网络访问规则。发现凭据泄露或越权时立即停用凭据、保留审计证据并按安全事件流程处理，不在文档或工单粘贴秘密。

## 验证与回退

用健康检查、最小权限账号和只读源库测试验证修复；若失败，恢复上一份已验证安全配置，不恢复暴露的凭据。
