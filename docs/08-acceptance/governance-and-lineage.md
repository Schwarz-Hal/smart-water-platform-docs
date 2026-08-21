---
id: acceptance.governance-lineage
title: 数据治理、质量报告和版本血缘验收
document_type: acceptance
document_version: 1.0.1
status: published
locale: zh-CN
audience: [project_stakeholder, operator, developer]
related_modules: [M02, M03]
related_operators: [data_quality_profile_v1, qscore_v1, align_timeseries_v1, missing_value_repair_dataset_v1, outlier_repair_dataset_v1, dataset_publish_v1]
related_apis: ["/api/v1/dataset-versions/{version_id}/quality-profiles", "/api/v1/datasets/{dataset_id}/lineage"]
owners: [quality-team]
reviewed_at: 2026-08-21
summary: 验证数据质量评估、治理工作流、派生版本和血缘追溯步骤，并记录证据。
---

# 数据治理、质量报告和版本血缘验收

## 1. 验收步骤

- [ ] 导入包含已知缺陷的测试数据，记录数据版本和缺陷构造说明。
- [ ] 查看质量报告，记录各维度结果、缺陷定位和报告版本。
- [ ] 运行经批准的治理工作流，记录拓扑、参数、任务和失败处理。
- [ ] 查看派生版本与血缘树，记录源版本、工作流版本和目标版本。

## 2. 预期结果

质量结果、治理任务和版本血缘应可由记录的标识独立复核。不得用未记录的分数提升或平滑效果作结论。

## 3. 证据记录

| 步骤 ID | 证据标识/链接 | 审阅人 | 日期 | 结论 |
| --- | --- | --- | --- | --- |
| GL-01 | 待执行：填写数据版本、构造说明或报告链接 | 待指定 | 待填写 | [ ] 通过 |
| GL-02 | 待执行：填写质量报告 ID、trace_id 或链接 | 待指定 | 待填写 | [ ] 通过 |
| GL-03 | 待执行：填写治理任务 run_id 或报告链接 | 待指定 | 待填写 | [ ] 通过 |
| GL-04 | 待执行：填写源/目标版本、血缘报告或链接 | 待指定 | 待填写 | [ ] 通过 |
