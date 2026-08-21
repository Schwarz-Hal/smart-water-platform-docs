---
id: algorithm.s01-evidence-fusion
title: 漏损证据多源融合算子
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M04, M06]
related_operators: [s01_evidence_fusion_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 多源证据加权融合模型与候选时段置信度判定。
---

# 漏损证据多源融合算子 (`s01_evidence_fusion_v1`)

$$
\text{RiskScore}(t) = 100     imes \sum_{i} w_i \cdot E_i(t)
$$
融合夜间流量（30%）、水量平衡（30%）、基线残差（25%）与持续变化（15%）证据，筛选高风险漏损候选。
