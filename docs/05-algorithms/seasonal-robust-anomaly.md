---
id: algorithm.seasonal-robust-anomaly
title: 季节稳健基线异常检测
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M04]
related_operators: [seasonal_robust_anomaly]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 seasonal_robust_anomaly 的训练模型、季节槽位和持续候选输出。
---

# 季节稳健基线异常检测 (`seasonal_robust_anomaly`)

## 用途与适用范围

该算子先按数据集训练季节槽位的中位数和 MAD，再在推理时比较观测值与对应季节基线。它适合检测相对季节模式的偏离，并可把连续偏离汇总为候选时段；它不直接给出物理原因或现场结论。

## 输入与输出

训练输入为 `time`、`value`，要求有有效数值和可推断的正采样间隔，并至少包含 `minimum_cycles` 个完整周期。推理输入的时间和值都必须有效，并且必须提供 `kind=seasonal_robust_anomaly` 的训练模型。

推理输出包括 `baseline`、`scores`、整数 `labels`、连续异常段 `candidates` 和元数据。候选包含起止时间、最大/平均分数和点数。

## 原理与关键公式

训练阶段按采样间隔将时间映射到日或周的季节槽位。每个槽位保存中位数 $m_s$ 与 MAD，并将尺度下限设为 `mad_floor`。推理时：

$$
s_t=\frac{|y_t-m_{s(t)}|}{1.4826\times\max(\mathrm{MAD}_{s(t)},\text{mad\_floor})}
$$

当 $s_t\ge\text{threshold}$ 时标记该点；只有连续点数不少于 `min_consecutive_points` 的片段才进入 `candidates`。

## 参数说明

训练参数：

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `seasonality` | `auto` | `auto` 在采样间隔不大于一天时选择 `daily`，否则选择 `weekly`；也可显式指定。 |
| `minimum_cycles` | `3` | 所需最少完整季节周期，范围 `1–365`。 |
| `mad_floor` | `1e-6` | 每个槽位 MAD 的正下限。 |

推理参数：

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `threshold` | `4.5` | 异常分数阈值。 |
| `min_consecutive_points` | `2` | 进入候选所需的最少连续异常点。 |

## 结果解释与限制

这是按训练数据季节槽位建立的相对异常分数。缺少训练模型、历史不足、槽位覆盖不足或输入包含无效值会失败；模型训练间隔和推理数据应保持兼容。候选仅说明相对基线的连续偏离，不证明漏损、故障或其他根因，也不自动生成工单。

## 参考资料

本算子为平台确定性季节槽位与稳健残差规则，无单独外部论文基准；平台算子为 `seasonal_robust_anomaly`。
