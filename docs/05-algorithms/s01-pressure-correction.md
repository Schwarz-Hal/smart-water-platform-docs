---
id: algorithm.s01-pressure-correction
title: 管网压力修正模型
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M04, M06]
related_operators: [s01_pressure_correction_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 S01 压力修正算子的幂函数归一化、参数和单位边界。
---

# 管网压力修正模型 (`s01_pressure_correction_v1`)

## 用途与适用范围

将观测流量按参考压力做幂函数归一化，使后续季节基线比较减少压力变化的直接影响。该算子不拟合泄漏参数，也不确认漏点。

## 输入与输出

输入为 `time`、`flow`、`pressure`；流量单位为 `m3/h`，压力单位由 `pressure_unit` 声明（默认 `m`）。流量必须非负，压力必须为正。输出观测流量、压力、修正因子和 `corrected_flow`。

## 原理与关键公式

设参考压力为 $P_r$、指数为 $N$：

$$
f_t=\left(\frac{P_r}{P_t}\right)^N,\qquad
Q_{\mathrm{corrected},t}=Q_t f_t
$$

未提供参考压力时使用输入压力的中位数；实现只使用数值，不执行压力单位换算。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `reference_pressure` | 输入压力中位数 | 必须为正。 |
| `pressure_exponent` | `0.5` | 范围 `(0, 2]`。 |
| `pressure_unit` | `m` | 结果元数据中的单位声明，不触发换算。 |

## 结果解释与限制

修正结果依赖压力测量、参考值和指数配置；指数不是由算子从数据估计的。缺压力通道时，S01 固定管线跳过此节点并继续使用净入流。修正后的序列仍只是分析输入，不是漏损量。

## 参考资料

本算子为平台确定性压力归一化规则，无单独外部论文基准。
