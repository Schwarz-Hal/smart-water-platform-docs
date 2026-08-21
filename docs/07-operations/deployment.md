---
id: operations.deployment
title: 前后端统一部署、升级与回退
document_type: operations
document_version: 1.1.0
status: published
locale: zh-CN
audience: [operator, developer]
related_modules: [M07, M08]
related_operators: []
related_apis: ["/health/live", "/health/ready"]
owners: [operations-team]
reviewed_at: 2026-08-21
summary: 按 deploy.sh 使用精确版本、数据库迁移、服务重启和烟测完成发布。
---

# 前后端统一部署、升级与回退

## 前置条件

在服务器准备可信的 `deploy.env`、后端环境文件和 Git 仓库访问权限。确认当前 `current`、`previous`、目标 commit、迁移状态及备份策略；不要把该流程描述为零停机发布。

## 检查

部署脚本默认 API `http://127.0.0.1:18000`、前端 `http://127.0.0.1:18001`，执行后端 Ruff/Pytest、前端测试和构建，并按需迁移数据库。确认磁盘、共享 Python 环境和前端构建缓存完整。

## 操作步骤

```bash
bash deploy/server/deploy.sh --config "$HOME/HITXL/shared/deploy.env" \
  --backend-ref <exact-backend-ref> --frontend-ref <exact-frontend-ref>
```

脚本解析精确 commit，准备或复用带内容摘要的环境和前端制品，比较 Alembic revision，必要时备份并升级数据库，组装不可变 release，原子切换 `current`，重启 API、Worker、训练 Worker、Scheduler 和 Provisioner，然后执行 API、前端和 Celery 烟测。`deploy-frontend.sh` 可固定当前后端 commit 单独发布前端。

## 验证与回退

确认 `/health/live`、`/health/ready`、前端首页和 Worker `inspect ping` 成功，并记录 release、commit、迁移版本。脚本没有公开的 `--rollback` 选项；部署错误或前端烟测失败时，错误处理会恢复到 `previous`（若存在）并重启服务。需要人工回退时先停止接收变更，切换已验证的旧 release，再重复健康和烟测，数据库回退另行按恢复流程处理。
