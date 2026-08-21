---
id: acceptance.s01-leakage
title: S01 DMA 漏损闭环验收
document_type: acceptance
document_version: 1.0.0
status: published
locale: zh-CN
audience: [project_stakeholder, operator, developer]
related_modules: [M04, M05, M06]
related_operators: [s01_water_balance_v1, s01_minimum_night_flow_v1, s01_seasonal_baseline_v1, s01_ewma_cusum_v1, s01_evidence_normalize_v1, s01_evidence_fusion_v1, s01_assessment_report_v1]
related_apis: ["/api/v1/workflows"]
owners: [quality-team]
reviewed_at: 2026-08-21
summary: 验证 S01 漏损全链路算子组装、多源证据融合、候选排序与可视化报告输出闭环。
---

# S01 DMA 漏损闭环验收

---

## 1. 验收测试步骤

1. **加载 S01 内置模板**：确认画布自动载入水量平衡、MNF、基线残差、EWMA 及证据融合全部 7 个核心算子节点；
2. **绑定 DMA 流量与夜间用水数据**；
3. **执行图校验与发布运行**；
4. **验证漏损候选输出**：
   - 检查综合漏损评估报告；
   - 验证高风险候选时段（`risk_score > 70`）在夜间流量突增时段被正确检出；
   - 确认多源证据雷达贡献度（夜间流量、水量平衡、残差、持续性）合理。

---

## 2. 验收核验标准

- [x] S01 全链路 7 节点无缝协同运行，无端口类型冲突；
- [x] 漏损候选风险分值稳定可靠，支持排序与详情溯源；
- [x] 漏损综合报告支持图表交互与导出。
