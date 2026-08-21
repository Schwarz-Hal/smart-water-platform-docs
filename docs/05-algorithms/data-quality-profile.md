---
id: operator.data-quality-profile
title: 整体数据质量分析算子
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [algorithm_user, platform_user]
related_modules: [M03, M04]
related_operators: [data_quality_profile_v1, qscore_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 data_quality_profile_v1 的数据集输入、质量汇总、等级和输出报告。
---

# 整体数据质量分析算子 (`data_quality_profile_v1`)

## 用途与适用范围

该治理算子遍历数据集中的各通道，调用 `qscore_v1` 计算五维分数，再按通道行数加权汇总为数据集报告。它不修改数据，也不自动发布修复版本。

## 输入与输出

输入端口为必填的 `dataset`（数据集包）。每个通道应提供 `time`、`value` 和通道描述。输出包含原数据集引用和 `data_quality_report` 报告，报告包括：数据集 `score`、`grade`、五维 `dimensions`、`issues`、通道明细、总行数和权重。

## 原理与关键公式

每个通道先独立计算 Qscore 维度。设通道行数为 $n_j$、维度分数为 $S_{j,k}$，总报告维度为：

$$
S_k=\frac{\sum_j n_jS_{j,k}}{\sum_j n_j}
$$

然后按 Qscore 默认权重计算总分：

$$
\mathrm{score}=100\times\sum_k w_kS_k
$$

`issues` 汇总缺失、重复、无效、冻结和跳变计数。`expected_interval_seconds` 为 `0` 时，传给 Qscore 后不执行时间间隔检查；它不会在算子内部推断一个新的间隔。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `expected_interval_seconds` | `900` | 传给通道 Qscore 的期望间隔；`0` 表示不检查间隔。 |
| `valid_min` / `valid_max` | `null` | 可选的数值有效范围，会传给 Qscore。 |
| `jump_z` | `8.0` | 通道稳定性跳变阈值。 |

## 结果解释与限制

等级为 A（`≥90`）、B（`≥80` 且 `<90`）、C（`≥60` 且 `<80`）和 D（`<60`）。通道行数越多，对汇总分的影响越大。质量画像是统计诊断，不证明物理值正确，也不替代后续治理动作；治理动作应显式选择并产生派生版本。

## 参考资料

本算子为平台确定性数据质量汇总规则，无单独外部论文基准；质量维度沿用本文所述的 `qscore_v1` 规则。
