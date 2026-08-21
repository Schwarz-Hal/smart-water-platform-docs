---
id: operations.middleware
title: MySQL、RabbitMQ、Redis 和 MinIO 运维
document_type: operations
document_version: 1.0.0
status: published
locale: zh-CN
audience: [operator]
related_modules: [M07]
related_operators: []
related_apis: []
owners: [operations-team]
reviewed_at: 2026-08-21
summary: 说明平台依赖的四个核心中间件配置要求、持久化存储、连接池与健康检查。
---

# MySQL、RabbitMQ、Redis 和 MinIO 运维

---

## 1. 中间件规格与端口矩阵

| 中间件 | 版本要求 | 默认端口 | 平台职责与数据类型 |
| :--- | :--- | :---: | :--- |
| **MySQL** | 8.4 LTS | `3306` | 系统元数据、用户权限、工作流 DAG 拓扑、任务状态最终事实来源 |
| **RabbitMQ** | 3.13+ | `5672` / `15672` | Celery 分布式任务队列 Broker，支持消息确认与任务持久化 |
| **Redis** | 7.2+ | `6379` | 会话缓存、数据质量热数据缓存与 WebSocket 事件 Pub/Sub 广播 |
| **MinIO** | Latest | `9000` / `9001` | S3 兼容对象存储，保存 CSV 数据集文件、中间时序表与图表 Artifacts |

---

## 2. 常用运维指令

```bash
# 检查各中间件容器运行状态
docker compose -f /opt/smart-water-platform/docker-compose.yml ps

# 查看 RabbitMQ 队列积压情况
rabbitmqctl list_queues name messages_ready messages_unacknowledged

# 查看 Redis 内存与连接数
redis-cli -a <REDIS_PASSWORD> info memory
```
