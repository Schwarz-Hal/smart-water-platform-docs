---
id: quickstart.chronos-forecast
title: 使用 Chronos-2 完成一次流量预测
document_type: quick_start
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, algorithm_user]
related_modules: [M04, M05]
related_operators: [chronos2_flow_forecast]
related_apis: [/api/v1/workflows]
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 指导用户使用 Chronos-2 时序预训练大模型快速完成管网未来流量预测与区间评估。
---

# 使用 Chronos-2 完成一次流量预测

Chronos-2 是基于语言模型架构自监督预训练的时间序列大模型，具备极其出色的零样本（Zero-shot）跨域泛化能力。

---

## 操作步骤

1. **导入流量时序数据**：
   - 准备至少包含 7 天以上历史流量监测数据（建议采样周期 15 分钟，共 672 点以上）；
2. **编排 Chronos-2 预测流程**：
   - 在【工作流编排】中新建流程，拖入 `数据资产输入` 与 `Chronos-2 时序预测` (`chronos2_flow_forecast`) 算子并完成连线；
3. **配置预测参数**：
   - `prediction_length`：未来预测步数（如 `96`，代表未来 24 小时）；
   - `num_samples`：分位数采样路径数（推荐 `20`）；
   - `temperature`：采样温度系数（推荐 `0.7`）；
4. **运行与解读预测曲线**：
   - 运行工作流，完成后在结果视图中查看未来 24 小时预测曲线；
   - 包含中位数点预测（P50）与 10%~90% 置信区间，辅助管网调度与高峰供水预警。
