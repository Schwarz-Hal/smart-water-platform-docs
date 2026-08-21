---
id: operations.configuration
title: 配置项、密钥边界与环境检查
document_type: operations
document_version: 1.1.0
status: published
locale: zh-CN
audience: [operator, developer]
related_modules: [M07]
related_operators: []
related_apis: ["/health/ready"]
owners: [operations-team]
reviewed_at: 2026-08-21
summary: 说明服务器配置文件、应用端口、依赖边界和安全检查。
---

# 配置项、密钥边界与环境检查

## 前置条件

服务器使用 `~/HITXL/shared/deploy.env` 和 `~/HITXL/shared/backend.env`，发布目录只链接后者。配置文件不提交 Git，不在支持请求中粘贴内容。

## 核心配置边界

应用默认 API 端口为 `18000`，前端烟测端口为 `18001`。后端配置包括 MySQL、RabbitMQ、Redis、MinIO、JWT、Celery、GPU Profile、上传大小和回收站保留时间；其中 `CELERY_BROKER_TYPE` 默认使用 RabbitMQ，也可按受控环境切换到隔离 Redis DB。外部算法依赖索引必须是无凭据的 HTTPS 地址。

## 检查

部署前确认密钥非空、配置文件权限、CORS 来源、数据库和 Broker 可达性、MinIO bucket 及 GPU Profile 状态。启动后访问 `/health/ready`，确认 MySQL、Redis、Broker 和 MinIO；GPU 是可选能力，不应把 GPU 离线误报为 CPU API 未就绪。

## 操作步骤

复制服务器示例配置到受控路径，填入环境专属值并设置文件权限，再按目标 release 链接后端环境文件。修改后重启受影响服务。

## 失败处理

配置错误返回 `422` 或使 readiness 失败时，停止接受新任务，修正服务器私有配置后重启受影响服务。不要在日志中记录密码、Authorization、数据库 URI、对象键或上传内容。

## 验证与回退

访问 `/health/ready` 并检查服务日志；若失败，恢复上一份已验证的服务器配置并重启，不回退或覆盖业务数据。
