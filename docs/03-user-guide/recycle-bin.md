---
id: user.recycle-bin
title: 回收站、恢复与永久清理
document_type: user_guide
document_version: 1.2.0
status: published
locale: zh-CN
audience: [platform_user, admin]
related_modules: [M01, M02, M05, M07]
related_operators: []
related_apis: ["/api/v1/recycle-bin", "/api/v1/recycle-bin/{item_id}/restore", "/api/v1/recycle-bin/purge"]
owners: [product-team]
reviewed_at: 2026-08-21
summary: 通过资源页面和管理员回收站恢复或清理资源。
---

# 回收站、恢复与永久清理

## 用途

删除数据源、数据资产、工作流或任务时先进入回收站，便于误删恢复并保留审计边界。默认保留 14 天。

## 前置条件与角色

普通用户只能删除自己拥有的资源。查看、恢复和永久清理由具备回收站管理权限的管理员执行；发布版本和有依赖的资产不能绕过生命周期规则清理。

## 操作步骤

1. 在数据源、数据资产、工作流或任务详情页选择删除，并确认页面显示的影响范围。
2. 管理员打开【回收站】，按资源类型、所有者或状态筛选，选择需要处理的项目。
3. 选择【恢复】将项目放回原列表；用户账户恢复时，相关注销批次资源按页面提示一并处理。
4. 选择【永久清理】时阅读确认提示并输入页面要求的确认文字；可以选择部分项目，也可以清空回收站。清理在后台执行。

## 结果与失败处理

删除后资源会从普通列表消失，但历史运行和审计信息按平台规则保留。已发布工作流、有运行记录的草稿或有业务依赖的资产不能永久清理；批量清理中单项失败不会阻塞其他项目，管理员应在回收站查看失败项并处理。
