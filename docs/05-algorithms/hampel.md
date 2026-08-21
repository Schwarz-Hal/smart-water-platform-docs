---
id: algorithm.hampel
title: Hampel 滑动窗口异常检测
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M04]
related_operators: [hampel]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 区分独立 hampel 检测算子与治理流程中的 outlier_repair_dataset_v1。
---

# Hampel 滑动窗口异常检测

## 用途与适用范围

独立算法 `hampel` 用局部中位数和 MAD 为每个 `value` 计算异常分数并输出标记。它是点异常检测组件，不等同于漏损检测、根因诊断或数据修复。

治理工作流中的 `outlier_repair_dataset_v1` 是另一项算子：它也使用 Hampel 风格的局部统计量，但默认参数、输入输出和动作策略不同，可选择只标记或替换值。两者不能互换记录。

## 输入与输出

独立 `hampel` 输入 `time`、`value` 序列。输出 `scores`、整数 `labels`、实际使用的 `threshold` 和 `metadata.window`；不输出修复后的序列，也不会改变缺失值。

## 原理与关键公式

实现使用中心滚动窗口。窗口半宽由 `window` 决定，滚动中位数记为 $m_t$，再对绝对偏差求滚动中位数得到 $\mathrm{MAD}_t$：

$$
s_t=\frac{|v_t-m_t|}{1.4826\times\max(\mathrm{MAD}_t,10^{-12})}
$$

当 $s_t\ge\text{threshold}$ 时，`labels[t]` 为 `1`，否则为 `0`。窗口边界使用 `min_periods=max(3, window//3)`；无法计算的分数填为 `0`。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `window` | `9` | 中心滚动窗口点数；独立算子实现不额外强制奇数。 |
| `threshold` | `4.5` | 分数阈值，越小越敏感。 |

治理算子 `outlier_repair_dataset_v1` 的参数是 `window=7`、`threshold=3.0`、`action=flag_only`。其 `window` 必须为不小于 3 的奇数；`action` 可选 `flag_only`、`median`、`interpolate`。该治理算子使用 `outlier` 列保留标记，随后按所选动作处理值。

## 结果解释与限制

标记只表示局部统计异常，可能由真实突变、采样问题或工况变化造成。独立 `hampel` 不会自动插值。只有在明确运行 `outlier_repair_dataset_v1` 并选择 `median` 或 `interpolate` 时才会替换值；`flag_only` 不替换。修复结果应作为派生数据版本并重新进行质量检查。

## 参考资料

本算子为平台确定性 Hampel 检测规则，无单独外部论文基准；治理工作流中的 `outlier_repair_dataset_v1` 仅作为正文所述的独立区别。
