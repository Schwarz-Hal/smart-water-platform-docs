---
id: algorithm.s01-water-balance
title: DMA 水量平衡分析
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [algorithm_user, operator]
related_modules: [M04, M06]
related_operators: [s01_water_balance_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: S01 DMA 水量平衡计算模型、产销差残差与时序积分原理。
---

# DMA 水量平衡分析 (`s01_water_balance_v1`)

---

## 1. 物理原理

$$
Q_{\text{loss}}(t) = Q_{\text{inflow}}(t) - Q_{\text{authorized}}(t)
$$
算子在统一时间轴上对齐总供水量与合法用水量，计算瞬时未计量水量（NRW）与积分失衡时序。
