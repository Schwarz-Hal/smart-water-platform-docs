---
id: operations.document-publication
title: 文档快照发布、同步和失败恢复
document_type: operations
document_version: 1.0.0
status: published
locale: zh-CN
audience: [operator, developer]
related_modules: [M08]
related_operators: []
related_apis: []
owners: [operations-team]
reviewed_at: 2026-08-21
summary: 文档不可变快照构建流水线、Pagefind 索引生成与发布失败快速回退。
---

# 文档快照发布、同步和失败恢复

生产文档站仅在打上不可变 Tag（如 `v1.0.0`）时由 CI/CD 触发 `npm run build` 静态打包，并部署至生产 Web 目录。
