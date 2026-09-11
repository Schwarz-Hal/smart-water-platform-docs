---
id: operator.regression-evaluation
title: 回归误差评测
document_type: algorithm
document_version: 1.0.0
status: draft
locale: zh-CN
audience: [platform_user, algorithm_user, developer]
related_modules: [M03, M04]
related_operators: [regression_evaluation]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-09-11
summary: 使用明确的真实对照计算可追溯的标准评测报告。
---

# 回归误差评测

## 用途与输入

算子 `regression_evaluation@1.0.0` 无需模型训练。输入actual和predicted两条时序，时间戳严格对齐后计算MSE、MAE、RMSE。

真实对照必须来自明确选定的数据版本，不能用预测值代替真实观测。两条输入的时间戳必须唯一且时间集合相同，不截短或仅取交集计算。

## 配置

split描述评测用途，可选train、validation、test、backtest、reconstruction、unknown，默认unknown。该选项不会自动划分数据，也不能将训练数据回算变成独立测试。

本算子仅有split参数，评测所连接的两条时序。

## 输出与解释

result输出 `sw.result/1.0` 评测报告，包含scope、metrics及provenance。有效样本数量和评测口径随报告保存。详情可查看指标和运行依据，不需要阅读原始JSON。

MSE、MAE、RMSE适用于连续值预测，越低表示所选范围内误差越小。MSE使用原数值单位的平方；来源未提供单位时不猜测物理单位。不同划分、单位、预测长度的数据不能直接比较。

## 错误与边界

时间缺失、重复或数组长度不一致时应修正配置。缺失数值按评测策略排除；无有效对照时失败。未来真实值尚未到达时不能产生预测精度报告。

本算子不会创建新的训练权重或修改输入数据。更多协议说明见[标准结果契约](../06-development/standard-results.md)，查看方法见[结果与评测](../03-user-guide/result-visualization.md)。
