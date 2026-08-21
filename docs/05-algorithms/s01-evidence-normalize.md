---
id: algorithm.s01-evidence-normalize
title: 漏损证据归一化算子
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M04, M06]
related_operators: [s01_evidence_normalize_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 将水量平衡、MNF、残差与持续变化等异构指标映射至 [0, 1] 证据置信空间。
---

# 漏损证据归一化算子 (`s01_evidence_normalize_v1`)

采用 S 型 Sigmoid 或分位数基准将不同物理量纲的残差指标归一化为统一的置信度证据分值。
