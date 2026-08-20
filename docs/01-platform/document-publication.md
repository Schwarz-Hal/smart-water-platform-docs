---
id: platform.document-publication
title: 文档发布与快照说明
document_type: platform
document_version: 1.0.0
status: published
locale: zh-CN
audience: [project_stakeholder, developer]
related_modules: [M08]
related_operators: []
related_apis: []
owners: [documentation-team]
reviewed_at: 2026-08-20
summary: 说明文档如何从协作内容冻结为可复现的交付快照。
---

# 文档发布与快照说明

文档发布使用不可移动的 Git Tag 作为快照标识，例如 `docs-snapshot-2026-08-20`。每个快照记录来源提交、章节清单、导出文件及其 SHA256。公开站点只在人工发布快照后更新。

快照可重复导出为 PDF、DOCX 和离线 HTML。交付方可通过快照 Tag、提交 ID 和校验和确认文件来源。
