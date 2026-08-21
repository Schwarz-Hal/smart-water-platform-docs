---
id: algorithm.s01-pressure-correction
title: 管网压力修正模型
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M04, M06]
related_operators: [s01_pressure_correction_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 基于 FAVAD 理论与孔口出流定律的管网漏损压力修正计算模型。
---

# 管网压力修正模型 (`s01_pressure_correction_v1`)

依据国际水协（IWA）FAVAD（Fixed and Variable Area Discharges）理论，管网漏损流量与管网平均运行压力之间满足幂函数关系：

$$
Q_{\text{leak}} = C \cdot P^{N1}
$$

其中 $P$ 为管网实测水头压力，$N1$ 为泄漏孔口指数（金属管道 $N1 \approx 0.5$，塑料/PVC 管道 $N1 \approx 1.0 \sim 1.5$）。该算子将实测漏水量标准化至基准参考压力下的等效漏损量。
