---
id: operations.middleware
title: MySQL、RabbitMQ、Redis 和 MinIO 运维
document_type: operations
document_version: 1.1.0
status: published
locale: zh-CN
audience: [operator]
related_modules: [M07]
related_operators: []
related_apis: ["/health/ready"]
owners: [operations-team]
reviewed_at: 2026-08-21
summary: 说明四个依赖组件的职责、开发默认端口和健康检查边界。
---

# MySQL、RabbitMQ、Redis 和 MinIO 运维

## 前置条件

组件由服务器基础设施项目管理。端口只作为受控环境的配置参考，不应对浏览器或公共网络开放。

## 职责与开发默认端口

| 组件 | 配置默认端口 | 平台职责 |
| --- | ---: | --- |
| MySQL | `13306` | 业务元数据、任务最终状态、审计和对象摘要 |
| RabbitMQ | `15672` | 当前 Celery Broker，接收任务消息 |
| Redis | `16379` | 缓存、实时进度事件和 WebSocket 发布订阅 |
| MinIO | `19000` | CSV 原件、算法包、模型、Parquet 和大 Artifact |

端口来自后端配置默认值，服务器实际值以私有环境文件为准。

## 检查与失败处理

发布后使用 `/health/ready` 检查四个依赖。RabbitMQ 中断时由 Scheduler 按任务分发表恢复投递；Redis 事件丢失时由 MySQL 查询恢复状态；MinIO 不可用时不要删除或覆盖 MySQL 元数据。运维命令必须在受控服务器执行，凭据使用安全工具注入。

## 操作步骤

在基础设施项目中检查组件状态、持久化卷和连接；按组件责任修复后，再执行 readiness 和任务查询验证。

## 验证与回退

依赖全部就绪且代表性任务状态可查询后恢复业务。组件升级失败时按基础设施项目的已验证版本回退，不删除平台数据库或对象。
