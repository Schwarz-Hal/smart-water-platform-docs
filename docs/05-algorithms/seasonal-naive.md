---
id: algorithm.seasonal-naive
title: 季节朴素时序预测
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M04]
related_operators: []
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明利用上一周期历史观测值直接作为未来预测值的季节朴素基准算法。
---

# 季节朴素时序预测 (`seasonal_naive`)

季节朴素预测（Seasonal Naive）作为经典的时序预测基准（Baseline）：

$$
\hat{y}_{t+h} = y_{t+h - m \cdot \lfloor(h-1)/m + 1\rfloor}
$$

其中 $m$ 为季节周期长度（如 15 分钟采样的 24 小时对应 $m=96$）。该算法无须训练，计算极快，常用于与深度学习模型进行基线效果比对。
