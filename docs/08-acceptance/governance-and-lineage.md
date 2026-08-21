---
id: acceptance.governance-lineage
title: 数据治理、质量报告和版本血缘验收
document_type: acceptance
document_version: 1.0.0
status: published
locale: zh-CN
audience: [project_stakeholder, operator, developer]
related_modules: [M02, M03]
related_operators: [data_quality_profile_v1, qscore_v1, align_timeseries_v1, missing_value_repair_dataset_v1, outlier_repair_dataset_v1, dataset_publish_v1]
related_apis: ["/api/v1/datasets/{id}/quality", "/api/v1/datasets/{id}/lineage"]
owners: [quality-team]
reviewed_at: 2026-08-21
summary: 验证 Qscore 五维评估雷达、插补去噪治理流执行、派生版本生成与血缘树追溯。
---

# 数据治理、质量报告和版本血缘验收

---

## 1. 验收测试步骤

1. **导入带质量缺陷的测试数据**（包含 5% 缺失值与单点脉冲毛刺）；
2. **查验 Qscore 报告**：在资产详情中查看质量评估雷达，确认准确识别完整性缺失与毛刺跳变点；
3. **运行清洗治理工作流**：编排 `对齐` + `Hampel去噪` + `线性插值` + `派生发布` 流程并执行；
4. **验证派生版本与血缘树**：确认生成派生版本 `v2`，其 Qscore 明显提升至 90+ 分，且血缘树清晰展示 `v1 → 治理工作流 → v2`。

---

## 2. 验收核验标准

- [x] Qscore 五维评分准确，缺陷定位精准；
- [x] 治理算子清洗后时序平滑且连续；
- [x] 派生版本血缘链条完整、可追溯。
