---
id: operations.backup-recovery
title: MySQL、MinIO 与发布版本备份恢复
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
summary: 说明数据库每日逻辑备份、MinIO 对象数据冷备份与灾难恢复（Disaster Recovery）实操步骤。
---

# MySQL、MinIO 与发布版本备份恢复

---

## 1. 自动化全量备份脚本

```bash
# 1. 导出 MySQL 数据库
mysqldump -u sw_user -p --single-transaction --routines --triggers smart_water_db > /backup/db_$(date +%Y%m%d).sql

# 2. 同步 MinIO 存储桶数据
mc mirror local/smart-water-datasets /backup/minio_datasets_$(date +%Y%m%d)
mc mirror local/smart-water-artifacts /backup/minio_artifacts_$(date +%Y%m%d)
```
