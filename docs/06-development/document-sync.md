---
id: development.document-sync
title: 文档发布清单与平台同步协议
document_type: development
document_version: 1.1.0
status: published
locale: zh-CN
audience: [developer, operator]
related_modules: [M08]
related_operators: []
related_apis: ["/api/v1/document-assets/{asset_id}"]
owners: [platform-team]
reviewed_at: 2026-08-21
summary: 说明文档仓库、人工批准快照和平台同步的不可变边界。
---

# 文档发布清单与平台同步协议

## 用途与权限

用于人工批准快照和平台同步；发布负责人控制标签，平台同步只读取批准内容。

## 请求

同步输入为不可变标签、内容包和 SHA256 清单。

## 响应

平台保留最近一次成功同步的文档版本和资源摘要。

## 错误与重试

清单或同步失败时不替换当前版本；修复后创建新快照，不修改旧标签。

文档仓库的 `main` 是协作源，不是自动公开发布。对外站点、平台同步和交付文件只使用人工批准的不可变 `docs-snapshot-*`、`docs-milestone-*` 或 `docs-release-*` 标签。

## 1. 发布流程

1. 作者在允许范围内修改正文并通过元数据、术语、链接和 Markdown 校验。
2. 独立审核者核对权威代码、API 契约、部署脚本和受众要求，批准后才进入发布候选。
3. 发布负责人创建不可变快照标签并生成内容包及 SHA256 清单；标签不移动、不强制覆盖。
4. 平台同步只导入批准快照。同步失败时继续展示最近一次成功版本，不影响算法、工作流或任务执行。

文档资源由鉴权 API（例如 `GET /api/v1/document-assets/{asset_id}`）读取，客户端不直连对象存储。
