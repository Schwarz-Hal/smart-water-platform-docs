---
id: operator.missing-value-repair
title: 缺失值修复算子
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [algorithm_user, platform_user]
related_modules: [M03, M04]
related_operators: [missing_value_repair_dataset_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 missing_value_repair_dataset_v1 按通道处理缺失值的策略、参数和派生版本边界。
---

# 缺失值修复算子 (`missing_value_repair_dataset_v1`)

## 用途与适用范围

对数据集包中的每个通道独立处理缺失值，输出一个临时治理 stage，供后续质量检查或发布使用。算子不修改父数据集版本，也不保证所有缺失都能填补。

## 输入与输出

输入端口为 `dataset` 数据集包；输出端口仍为 `dataset` 数据集包，但指向新的 stage。每个通道按其 `time`、`value` 列处理，其他通道描述和点位/指标关系保持在数据集包中。只有随后运行发布节点，stage 才成为 `derived` 数据集版本。

## 原理与关键公式

令缺失点为 $v_t=\mathrm{NaN}$，算子按所选方法处理：

- `linear`：只对内部缺失做线性插值，连续限制为 `max_gap_points`；
- `forward_fill`：用之前最近的值向前填充，连续限制为 `max_gap_points`；
- `backward_fill`：用之后最近的值向后填充，连续限制为 `max_gap_points`；
- `seasonal_naive`：读取 `seasonal_period` 个位置之前的值，只在原值缺失的位置写入该滞后值。

超过限制、位于序列端点、没有可用邻值或没有对应季节滞后值的缺失会保留为空。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `method` | `linear` | `linear`、`forward_fill`、`backward_fill` 或 `seasonal_naive`。 |
| `max_gap_points` | `8` | 线性、前向和后向填充的连续点限制。 |
| `seasonal_period` | `96` | `seasonal_naive` 使用的滞后点数，必须不小于 `2` 才符合节点 Schema。 |

## 结果解释与限制

这是派生数据处理，不是对真实观测的证明性恢复。`seasonal_naive` 分支按固定滞后复制，不使用 `max_gap_points` 作为额外限制；调用方应在处理后查看剩余缺失并重新画像。方法名称、参数类型或数据集输入不符合契约时，节点失败并返回参数或输入错误。

## 参考资料

本算子为平台确定性缺失值处理规则，无单独外部论文基准。
