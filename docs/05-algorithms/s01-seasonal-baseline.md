---
id: algorithm.s01-seasonal-baseline
title: 季节基线与残差算子
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M04, M06]
related_operators: [s01_seasonal_baseline_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 算子 s01_seasonal_baseline_v1 提取日周期基线并计算残差时序。
---

# 季节基线与残差算子 (`s01_seasonal_baseline_v1`)

按配置的周期长度（如 $96$ 点对应 15 分钟采样的 24 小时）构造稳健中位数日基线，并剥离残差序列。
