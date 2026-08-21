---
id: algorithm.s01-minimum-night-flow
title: 最小夜间流量（MNF）分析
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [algorithm_user, operator]
related_modules: [M04, M06]
related_operators: [s01_minimum_night_flow_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 S01 最小夜间流量算子的本地时间窗口、日汇总和限制。
---

# 最小夜间流量分析 (`s01_minimum_night_flow_v1`)

## 用途与适用范围

按 DMA 本地时间汇总夜间净入流和合法夜间用水，计算每日夜间流量超额，作为 DMA 级筛查证据。它不直接测量或确认漏损。

## 输入与输出

必填输入为 `time`、`net_inflow`；`legitimate_night_use` 可选，缺失时按零。单位为 `m3/h`，时间戳需有效、升序、唯一，流量需非负。输出按本地日期列出 `observed_night_flow`、`legitimate_night_use`、`night_flow_excess`、样本数和中位/最大超额摘要。

## 原理与关键公式

将 UTC 时间转换为 `timezone`，选择 `[night_start_hour, night_end_hour)` 的小时。默认窗口为本地 `02:00` 至 `04:00`。对每天窗口内的观测取中位数：

$$
E_d=\max\left(0,\operatorname{median}(Q_{\mathrm{net},d})-\operatorname{median}(Q_{\mathrm{legitimate},d})\right)
$$

至少得到 `min_nights` 个日期后才输出；实现检查的是日期数量，不额外判定每个窗口是否完整。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `night_start_hour` / `night_end_hour` | `2` / `4` | 本地小时；两者必须不同，跨午夜窗口也支持。 |
| `min_nights` | `7` | 最少日数。 |
| `timezone` | `UTC` | 用于日界线和夜间窗口的 IANA 时区；S01 固定管线使用 DMA 时区。 |

## 结果解释与限制

超额可能来自合法用水估计、计量误差、时区或窗口配置，而非漏损。少于最小日数时失败；结果必须与其他证据和现场核验结合。

## 参考资料

本算子为平台确定性最小夜间流量规则，无单独外部论文基准。
