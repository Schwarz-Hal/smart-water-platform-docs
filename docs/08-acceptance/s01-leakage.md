---
id: acceptance.s01-leakage
title: S01 DMA 漏损闭环验收
document_type: acceptance
document_version: 1.0.1
status: published
locale: zh-CN
audience: [project_stakeholder, operator, developer]
related_modules: [M04, M05, M06]
related_operators: [s01_water_balance_v1, s01_minimum_night_flow_v1, s01_seasonal_baseline_v1, s01_ewma_cusum_v1, s01_evidence_normalize_v1, s01_evidence_fusion_v1, s01_assessment_report_v1]
related_apis: ["/api/v1/workflows"]
owners: [quality-team]
reviewed_at: 2026-08-21
summary: 验证 S01 漏损工作流的组装、运行、候选输出和报告追溯步骤，并记录证据。
---

# S01 DMA 漏损闭环验收

## 1. 验收步骤

- [ ] 加载已批准的 S01 模板，记录模板版本、节点和端口校验结果。
- [ ] 绑定测试 DMA 数据并完成参数配置，记录数据版本和参数快照。
- [ ] 执行图校验、发布和运行，记录工作流版本、任务状态和 trace_id。
- [ ] 查看候选结果与综合报告，记录排序、证据贡献和导出产物。

## 2. 预期结果

节点、端口、任务、候选和报告应能沿记录的版本或运行标识互相追溯。风险阈值和准确性结论必须引用实际报告。

## 3. 证据记录

| 步骤 ID | 证据标识/链接 | 审阅人 | 日期 | 结论 |
| --- | --- | --- | --- | --- |
| S01-01 | 待执行：填写模板版本、校验报告或链接 | 待指定 | 待填写 | [ ] 通过 |
| S01-02 | 待执行：填写数据版本、参数快照或链接 | 待指定 | 待填写 | [ ] 通过 |
| S01-03 | 待执行：填写工作流 run_id、trace_id 或链接 | 待指定 | 待填写 | [ ] 通过 |
| S01-04 | 待执行：填写候选/报告 ID 或导出链接 | 待指定 | 待填写 | [ ] 通过 |
