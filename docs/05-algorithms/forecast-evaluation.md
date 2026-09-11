---
id: operator.forecast-evaluation
title: 预测结果评测
document_type: algorithm
document_version: 1.0.0
status: draft
locale: zh-CN
audience: [platform_user, algorithm_user, developer]
related_modules: [M03, M04]
related_operators: [forecast_evaluation]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-09-11
summary: 使用明确的真实对照计算可追溯的标准评测报告。
---

# 预测结果评测

## 用途与输入

算子 `forecast_evaluation@1.0.0` 无需模型训练。输入prediction标准预测JSON与actual真实观测时序。选择结果序列，按时间戳对齐后计算MSE、MAE、RMSE。

真实对照必须来自明确选定的数据版本，不能用预测值或重构值代替真实标签。输入时间唯一；标准结果评测要求真实数据覆盖结果时间戳，多出的范围外真实数据不参与计算，不静默截短结果数组。

## 配置

split描述评测用途，可选train、validation、test、backtest、reconstruction、unknown，默认unknown。该选项不会自动划分数据，也不能将训练数据回算变成独立测试。

标准结果评测可配置series_id；只有一条序列时可留空，多条时必须明确选择。回归双时序评测没有此参数。

## 输出与解释

result输出 `sw.result/1.0` 评测报告，包含scope、metrics及provenance。有效样本数量和评测口径随报告保存。详情可查看指标和运行依据，不需要阅读原始JSON。

MSE、MAE、RMSE适用于连续值预测，越低表示所选范围内误差越小。分类指标需要0/1真实标签；零分母时值为null、状态为not_available，不伪造0或1。不同划分、单位、预测长度的数据不能直接比较。

## 错误与边界

时间缺失、重复、数组长度不一致或无法明确选择序列时应修正配置。缺失或无效标记按评测策略排除；无有效对照时失败。未来真实值尚未到达时不能产生预测精度报告。

本算子不会创建新的训练权重或修改输入数据。更多协议说明见[标准结果契约](../06-development/standard-results.md)，查看方法见[结果与评测](../03-user-guide/result-visualization.md)。
