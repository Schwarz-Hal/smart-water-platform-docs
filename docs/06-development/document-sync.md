---
id: development.document-sync
title: 文档发布清单与平台同步协议
document_type: development
document_version: 1.0.0
status: published
locale: zh-CN
audience: [developer, operator]
related_modules: [M08]
related_operators: []
related_apis: []
owners: [platform-team]
reviewed_at: 2026-08-21
summary: 说明文档 Backlog 元数据规范、不可变快照构建流程与前后端主工程协调协议。
---

# 文档发布清单与平台同步协议

文档仓库通过权威清单 `catalog/document-backlog.yml` 维护全部 92 篇文档的稳定 ID 与发布状态，并通过 Git Tag 生成不可变快照发布包。
