---
id: algorithm.s01-water-balance
title: DMA 水量平衡分析
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [algorithm_user, operator]
related_modules: [M04, M06]
related_operators: [s01_water_balance_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 S01 水量平衡算子的输入、净入流、未计量平衡和积分输出。
---

# DMA 水量平衡分析 (`s01_water_balance_v1`)

## 用途与适用范围

在已对齐的 DMA 时序上计算系统输入、授权用水和未计量平衡，为后续筛查提供可追溯的信号。未计量平衡不等于已确认的物理漏损。

## 输入与输出

必填输入为 `time`、`inlet_flow`、`authorized_consumption`；可选 `outlet_flow`、`known_losses`。所有流量单位为 `m3/h`，时间戳必须有效、升序且唯一，数值必须有限且非负。可选列缺失时按零处理。

输出包含 `system_input_flow`、`authorized_consumption_flow`、`known_losses_flow`、`unaccounted_flow` 时序，以及四项体积汇总（单位 `m3`）。

## 原理与关键公式

逐点计算：

$$
Q_{\mathrm{system}}=Q_{\mathrm{inlet}}-Q_{\mathrm{outlet}}
$$

$$
Q_{\mathrm{unaccounted}}=Q_{\mathrm{system}}-Q_{\mathrm{authorized}}-Q_{\mathrm{known\ losses}}
$$

按 `expected_interval_seconds`（默认 `900`）将流量乘以小时数并求和：

$$
V=\sum_t Q_t\frac{\Delta t}{3600}
$$

相邻时间间隔偏离期望值超过 20% 时算子失败。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `expected_interval_seconds` | `900` | 期望采样间隔，必须为正。 |

## 结果解释与限制

负的 `system_input_flow` 或输入流量会被拒绝。未计量项还可能包含计量误差、授权用水口径差异和已知损失估计误差；它只能作为 DMA 级筛查证据，不能定位漏点。

## 参考资料

本算子为平台确定性水量平衡规则，无单独外部论文基准。
