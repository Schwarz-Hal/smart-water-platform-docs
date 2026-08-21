---
id: operations.backup-recovery
title: MySQL、MinIO 与发布版本备份恢复
document_type: operations
document_version: 1.1.0
status: published
locale: zh-CN
audience: [operator]
related_modules: [M07]
related_operators: []
related_apis: []
owners: [operations-team]
reviewed_at: 2026-08-21
summary: 说明部署脚本执行的数据库备份、发布保留和恢复检查边界。
---

# MySQL、MinIO 与发布版本备份恢复

## 前置条件

仅由受授权运维人员在服务器执行。部署配置和后端环境文件属于服务器私有文件，权限应为 `600`；不要把密码、数据库 URI、对象存储凭据或真实数据写进命令和文档。

## 检查

确认 `current` 和 `previous` 发布链接、应用服务状态、`/health/live`、`/health/ready` 和对象存储可用。确认最近的数据库备份文件与发布 ID 对应，并记录迁移版本。

## 操作步骤

当数据库实际 revision 落后于代码 head 时，`deploy.sh` 会在升级前使用配置中的数据库连接执行单库 `mysqldump`，压缩后保存在服务器 `shared/backups`。数据库已在 head 时会跳过无意义的备份和迁移。

MinIO 对象不由该脚本自动导出。需要恢复时，按基础设施团队批准的对象存储备份流程，先恢复对象，再恢复引用对象的 MySQL 元数据；不得把父版本或不可变对象覆盖成其他内容。

## 验证与回退

恢复后检查迁移 revision、健康检查、任务查询和代表性 Artifact。部署脚本失败会在错误处理路径把 `current` 恢复到原 `previous`（若存在）；数据库恢复是人工操作，必须单独记录并验证，脚本没有 `--rollback` 数据库回滚选项。
