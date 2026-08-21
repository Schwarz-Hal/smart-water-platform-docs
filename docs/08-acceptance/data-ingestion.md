---
id: acceptance.data-ingestion
title: CSV 与只读 MySQL 数据接入验收
document_type: acceptance
document_version: 1.0.1
status: published
locale: zh-CN
audience: [project_stakeholder, operator, developer]
related_modules: [M02]
related_operators: [dataset_asset_v1]
related_apis: ["/api/v1/data-sources/csv-uploads", "/api/v1/csv-uploads/{batch_code}/imports"]
owners: [quality-team]
reviewed_at: 2026-08-21
summary: 验证 CSV 和只读 MySQL 数据接入步骤，并记录资产、任务和权限证据。
---

# CSV 与只读 MySQL 数据接入验收

## 1. 验收步骤

- [ ] 准备经批准的测试 CSV，记录文件版本、字段和时间范围。
- [ ] 执行上传预检和采样预览，记录解析、编码和字段映射结果。
- [ ] 提交异步导入，记录任务状态变化和完成事件。
- [ ] 查看生成的数据资产、版本和统计信息，并验证原始只读边界。
- [ ] 如包含 MySQL 场景，使用只读凭据执行导入并记录失败处理结果。

## 2. 预期结果

数据资产、版本、通道和导入任务应可通过记录的标识复核；任何字段、权限或状态异常都应保留失败证据。

## 3. 证据记录

| 步骤 ID | 证据标识/链接 | 审阅人 | 日期 | 结论 |
| --- | --- | --- | --- | --- |
| DI-01 | 待执行：填写数据版本、文件校验值或报告链接 | 待指定 | 待填写 | [ ] 通过 |
| DI-02 | 待执行：填写导入 run_id 或报告链接 | 待指定 | 待填写 | [ ] 通过 |
| DI-03 | 待执行：填写任务 run_id、事件或报告链接 | 待指定 | 待填写 | [ ] 通过 |
| DI-04 | 待执行：填写资产版本、trace_id 或报告链接 | 待指定 | 待填写 | [ ] 通过 |
| DI-05 | 待执行：填写只读连接测试或报告链接 | 待指定 | 待填写 | [ ] 通过 |
