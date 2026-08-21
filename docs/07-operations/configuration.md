---
id: operations.configuration
title: 配置项、密钥边界与环境检查
document_type: operations
document_version: 1.0.0
status: published
locale: zh-CN
audience: [operator, developer]
related_modules: [M07]
related_operators: []
related_apis: []
owners: [operations-team]
reviewed_at: 2026-08-21
summary: 说明平台环境变量 .env 配置规范、敏感密钥隔离、默认端口映射与启动自检。
---

# 配置项、密钥边界与环境检查

---

## 1. 核心环境变量清单 (`.env`)

```ini
# 基础服务与数据库连接
ENVIRONMENT=production
SECRET_KEY=ChangeMeToAStrongRandomSecretKey
DATABASE_URL=mysql+pymysql://sw_user:Password@127.0.0.1:3306/smart_water_db

# 消息中间件与缓存
CELERY_BROKER_URL=amqp://guest:guest@127.0.0.1:5672//
REDIS_URL=redis://:RedisPassword@127.0.0.1:6379/0

# MinIO 对象存储
MINIO_ENDPOINT=127.0.0.1:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=MinioSecretPassword
MINIO_BUCKET_DATASETS=smart-water-datasets
MINIO_BUCKET_ARTIFACTS=smart-water-artifacts
```
