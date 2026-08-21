---
id: algorithm.s01-evidence-normalize
title: 漏损证据归一化算子
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M04, M06]
related_operators: [s01_evidence_normalize_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 S01 证据对齐、正值裁剪、参考尺度和 [0,1] 映射。
---

# 漏损证据归一化算子 (`s01_evidence_normalize_v1`)

## 用途与适用范围

把水量平衡、夜间超额、残差和持续变化等不同量纲的输入对齐为 `[0,1]` 分数，供证据融合使用。它不判断是否漏损，也不生成候选。

## 输入与输出

输入包括质量分 `quality`、质量门结果 `quality_gate`、`balance`、`night`、`residual_z` 和 `change_score`。时序按时间内连接，夜间值按 `timezone` 映射到本地日。输出为 `scores` 表和 `summary`；质量门输入要求上游已执行，但本算子不重新判断门结果。

## 原理与关键公式

质量分直接除以 100 并裁剪到 `[0,1]`。其他证据先裁剪负值：

$$
x^+=\max(x,0),\qquad s=\min\left(\frac{x^+}{R},1\right)
$$

若未配置参考值 $R$，使用当前对齐数据的第 95 百分位；参考值至少为 $10^{-9}$。残差使用绝对值后归一化，夜间值按本地日期复制到对齐行。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `timezone` | `UTC` | 夜间日映射使用的 IANA 时区。 |
| `balance_reference_m3h` | 自动 P95 | 水量平衡参考尺度。 |
| `night_flow_reference_m3h` | 自动 P95 | 夜间超额参考尺度。 |
| `residual_z_reference` | 自动 P95 | 绝对残差 Z 参考尺度。 |
| `change_score_reference` | 自动 P95 | 持续变化分数参考尺度。 |

## 结果解释与限制

P95 是当前数据相对尺度，不是校准后的概率；配置参考值会改变分数。输入时间没有共同交集的行会被排除。归一化结果只能说明相对证据强度，不能单独解释为漏损概率。

## 参考资料

本算子为平台确定性证据归一化规则，无单独外部论文基准。
