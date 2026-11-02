---
id: operations.document-publication
title: 文档快照发布、同步和失败恢复
document_type: operations
document_version: 1.2.0
status: published
locale: zh-CN
audience: [operator, developer]
related_modules: [M08]
related_operators: []
related_apis: ["/api/v1/document-assets/{asset_id}"]
owners: [operations-team]
reviewed_at: 2026-08-21
summary: 说明人工批准不可变文档快照、同步和失败保留策略。
---

# 文档快照发布、同步和失败恢复

## 前置条件

文档作者、独立审核者和发布负责人分离。确认正文、front matter、术语、链接、Markdown 校验和来源均已检查；`main` 更新不会自动成为公开内容。

## 操作步骤

1. 将已批准的文档变更合入 `main`，确认仓库 Settings → Pages 的发布来源为 GitHub Actions。
2. 仅更新文档网站时，在 Actions 手动运行【Publish approved documentation site】，选择 `main` 并填写新的 `docs-snapshot-*`、`docs-milestone-*` 或 `docs-release-*` 标签。工作流构建站点和 Pagefind 索引，记录不可变标签，然后部署 Pages；站点根目录的 `publication.json` 可核对发布标签及提交。
3. 需要完整交付包时，使用【Publish approved documentation snapshot】并填写另一个新标签，生成 PDF、Word、离线 HTML、内容包及摘要清单。网站更新与完整导出可以分别执行。
4. 不要移动或覆盖既有标签。网站发布中断时，可从相同提交、相同标签重试；标签已指向其他提交时会拒绝发布。文档内容有变更则使用新标签。

GitHub Pages 发布仅更新公开网站，不会自动替换业务服务器的文档镜像。平台镜像随对应应用发布更新，按该发布记录核对版本。

## 检查

核对快照标签不可变、内容包文件完整、清单摘要一致，并确认正文与资源的版本号对应。

## 验证与回退

核对标签、清单摘要、站点页面和平台当前文档版本。同步失败时保留最近一次成功版本，不影响算法、工作流或任务执行；修复后重新生成新的快照，不修改旧标签。
