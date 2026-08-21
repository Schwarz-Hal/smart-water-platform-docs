---
id: acceptance.documentation-delivery
title: 文档站、快照、PDF、DOCX 和离线包验收
document_type: acceptance
document_version: 1.0.1
status: published
locale: zh-CN
audience: [project_stakeholder, operator]
related_modules: [M08]
related_operators: []
related_apis: []
owners: [quality-team]
reviewed_at: 2026-08-21
summary: 验证文档文件覆盖、正文审阅、批准快照与交付导出的可追溯步骤。
---

# 文档站、快照、PDF、DOCX 和离线包验收

## 1. 验收步骤

- [ ] 运行 npm run progress，记录文件覆盖与各 backlog 状态；不得把文件存在计为正文 ready。
- [ ] 对计划发布的文档完成独立正文审阅，记录文档 ID、审阅人、日期和问题清单。
- [ ] 运行 npm run validate、站点构建和交付导出，分别记录验证、构建和导出报告。
- [ ] 仅对已批准内容创建不可变快照，记录快照标签、提交和批准记录。
- [ ] 分别核验站点、PDF、DOCX 和离线包的产物清单；缺少产物时保持未通过。

## 2. 判定边界

文件覆盖、正文审阅和快照发布是三个独立维度。覆盖率不能替代内容完整性，构建成功也不能替代审阅或快照批准。

## 3. 证据记录

| 维度 | 证据标识/链接 | 审阅人 | 日期 | 结论 |
| --- | --- | --- | --- | --- |
| 文件覆盖 | 待执行：填写 progress 报告链接和状态摘要 | 待指定 | 待填写 | [ ] 通过 |
| 正文审阅 | 待执行：填写审阅清单、reviewer 和日期 | 待指定 | 待填写 | [ ] 通过 |
| 验证与构建 | 待执行：填写命令报告或构建提交 | 待指定 | 待填写 | [ ] 通过 |
| 快照发布 | 待执行：填写批准快照标签和提交 | 待指定 | 待填写 | [ ] 通过 |
| 交付导出 | 待执行：填写 PDF、DOCX、离线包清单或链接 | 待指定 | 待填写 | [ ] 通过 |
