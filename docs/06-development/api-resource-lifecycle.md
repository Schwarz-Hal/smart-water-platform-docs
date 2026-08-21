---
id: api.lifecycle
title: 资源回收与用户生命周期 API
document_type: development
document_version: 1.1.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M01, M02, M05, M07]
related_operators: []
related_apis: ["/api/v1/recycle-bin", "/api/v1/recycle-bin/{item_id}/restore", "/api/v1/recycle-bin/purge"]
owners: [backend-team]
reviewed_at: 2026-08-21
summary: 资源删除、回收站恢复和异步永久清理接口。
---

# 资源回收与用户生命周期 API

## 用途与权限

提供软删除、恢复和异步清理；管理员回收站操作需要 `recycle:manage`。

## 请求

批量恢复提交 `item_ids`；清理还必须提交确认文字。

## 响应

恢复返回资源摘要，清理返回异步任务或项目状态。

## 错误与重试

有依赖的资源不能清理；重复或非终态操作按 `409` 处理，不重复提交副作用请求。

## 1. 资源删除

数据源、数据资产、工作流和任务分别通过各自资源路径的 `DELETE` 进入回收站；非终态任务先请求取消。工作流只有从未发布、无版本且无运行记录的草稿允许永久删除。

## 2. 管理员回收站

| 方法与路径 | 权限 | 说明 |
| --- | --- | --- |
| `GET /api/v1/recycle-bin` | `recycle:manage` | 按资源类型、所有者、状态和分页查询 |
| `POST /api/v1/recycle-bin/{item_id}/restore` | `recycle:manage` | 恢复单项 |
| `POST /api/v1/recycle-bin/restore` | `recycle:manage` | 用 `item_ids` 批量恢复 |
| `POST /api/v1/recycle-bin/purge` | `recycle:manage` | 用确认文字批量或全部异步清理 |

批量清理选定资源时提交 `item_ids` 和 `confirmation: "永久清理"`；清空时省略 `item_ids` 并提交 `confirmation: "清空回收站"`。默认保留 14 天，单项失败标记为 `purge_failed`。

## 3. 账户生命周期

注册、本人注销和管理员用户注销/恢复分别使用 `/auth/register`、`DELETE /auth/account`、`DELETE /users/{user_id}` 和 `POST /users/{user_id}/restore`。注销会使 Token 失效，并将关联资源作为同一批次进入回收站。
