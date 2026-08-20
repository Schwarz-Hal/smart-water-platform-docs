---
id: operations.health-topology
title: 服务拓扑、健康检查与安全化排障
document_type: operations
document_version: 1.0.0
status: published
locale: zh-CN
audience: [operator]
related_modules: [M07, M08]
related_operators: []
related_apis: [/health/ready]
owners: [operations-team]
reviewed_at: 2026-08-20
summary: 说明平台服务组成、健康检查边界和不暴露敏感信息的排障方式。
---

# 服务拓扑、健康检查与安全化排障

## 服务组成

平台由 API、前端、异步 Worker、消息队列、关系数据库和对象存储共同构成。API 负责鉴权、业务请求和查询；Worker 负责导入、数据治理、算法和工作流任务；数据库保存最终任务状态；对象存储保存文件、模型与大结果内容。

## 健康检查

部署或重启后，使用受控运维环境访问 `/health/ready` 确认必要依赖可用。该接口用于运维判断，不应把内部连接地址、账号或凭据暴露给普通使用者。

## 排障顺序

1. 确认 API、普通 Worker、调度器和专用运行时服务均处于运行状态。
2. 在任务中心按 `trace_id` 或任务 ID 查询状态与安全化日志。
3. 区分输入、权限、算子业务错误与基础设施异常；只对可恢复的基础设施问题执行重试。
4. 变更部署前备份平台数据库，并记录版本与验证结果。
