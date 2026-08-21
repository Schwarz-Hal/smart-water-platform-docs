---
id: operations.health-topology
title: 服务拓扑、健康检查与安全化排障
document_type: operations
document_version: 1.1.0
status: published
locale: zh-CN
audience: [operator]
related_modules: [M07, M08]
related_operators: []
related_apis: ["/health/live", "/health/ready"]
owners: [operations-team]
reviewed_at: 2026-08-21
summary: 说明 API、Worker、依赖和健康检查的运维边界。
---

# 服务拓扑、健康检查与安全化排障

## 前置条件

需要受控运维会话和访问 API `18000` 的权限；普通用户不应访问依赖组件管理端口。

## 服务组成

应用服务包括 API、普通 Worker、训练 Worker、Scheduler、Provisioner 和可选 GPU Runtime Worker；基础设施包括 MySQL、RabbitMQ、Redis 和 MinIO。API 负责业务请求和查询，Worker 执行任务，MySQL 保存最终状态。

## 健康检查

`GET /health/live` 无需认证，只表示 API 进程存活。`GET /health/ready` 无需认证，检查 MySQL、Redis、配置的 Celery Broker 和 MinIO；返回 `503` 时查看 `data.dependencies`。GPU 能力单独报告，GPU Worker 离线不会把 CPU API 判为未就绪。

## 排障顺序

1. 检查 API、普通 Worker、训练 Worker、Scheduler、Provisioner 和需要的 GPU Worker 服务。
2. 用任务 ID 或 `trace_id` 查询任务和安全化日志，区分输入、权限、业务错误与基础设施故障。
3. 检查 RabbitMQ 投递、Redis 事件和 MySQL 任务状态；以 MySQL REST 查询作为最终依据。
4. 变更前备份数据库并记录 commit、迁移版本和验证结果，不暴露内部地址或凭据。

## 操作步骤

按上述顺序检查服务和依赖，修复后重新调用 `/health/live`、`/health/ready` 和最小任务查询。

## 验证与回退

健康检查和烟测均成功后再接受新任务；若修复失败，切换到上一份已验证 release 并重复检查。
