---
id: algorithm.qscore
title: 数据质量评分 Qscore 模型
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [algorithm_user, platform_user, developer]
related_modules: [M03, M04]
related_operators: [qscore_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 qscore_v1 的五维质量评分、参数、等级和结果解释。
---

# 数据质量评分 Qscore 模型

## 用途与适用范围

`qscore_v1` 对一列 `time`、`value` 时序生成 0–100 的综合质量分和五个诊断维度。它只计算质量，不修改输入值；可作为数据画像或下游质量门的输入。

## 输入与输出

输入为时序表，至少包含 `time` 和 `value`。输出包括 `qscore`、`completeness`、`timeliness`、`uniqueness`、`validity`、`stability`，以及 `frozen_ratio`、`jump_ratio` 和权重等 `details`。

## 原理与关键公式

令五个维度为 $S_k$，权重为 $w_k$：

$$
\mathrm{Qscore}=100\times\sum_k w_kS_k,\qquad \sum_k w_k=1
$$

- 完整性：有限数值行数占总行数的比例。
- 时间一致性：当配置了正的 `expected_interval_seconds` 时，先按时间排序，计算相邻间隔落在期望间隔 ±20% 内的比例；未配置或为 `0` 时保持为 `1.0`，不进行间隔检查。
- 唯一性：`1 - duplicated(time)` 的行比例。
- 有效性：有限且满足可选 `valid_min`、`valid_max` 的行比例。
- 稳定性：先对有限的一阶差分计算冻结比例 `frozen_ratio`（绝对差不大于 `frozen_tolerance`），再以差分的中位数和 MAD 计算稳健 Z 值，超过 `jump_z` 的差分计入 `jump_ratio`：

$$
S_{\mathrm{stability}}=\max(0,1-r_{\mathrm{frozen}}-r_{\mathrm{jump}})
$$

默认权重为完整性 `0.35`、时间一致性 `0.20`、唯一性 `0.15`、有效性 `0.20`、稳定性 `0.10`。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `expected_interval_seconds` | `900`（`qscore_v1` 默认） | 期望采样间隔；为 `0` 或空值时不检查时间间隔。 |
| `valid_min` / `valid_max` | `null` | 可选物理范围边界，包含边界值。 |
| `frozen_tolerance` | `1e-9` | 一阶差分被视为冻结的绝对差阈值。 |
| `jump_z` | `8.0` | 差分稳健 Z 值超过该值时计为跳变。 |
| `weights` | 五维默认权重 | 可传入维度到权重的映射；实现按传入映射计算，调用方应明确提供五维权重及其总和。 |

## 结果解释与限制

质量分反映输入表在当前参数下的统计特征，不等价于传感器或业务数据“正确”。时间一致性按时间排序后计算，而唯一性按原表的重复时间戳计算；这两个维度可能同时受重复和乱序影响。稳定性只看有限一阶差分，不能区分真实工况变化与传感器故障。

等级由数据质量画像服务使用：A 为 `≥90`，B 为 `≥80` 且 `<90`，C 为 `≥60` 且 `<80`，D 为 `<60`。等级不是自动修复或准确率结论。

## 参考资料

本算子为平台确定性质量评分规则，无单独外部论文基准。
