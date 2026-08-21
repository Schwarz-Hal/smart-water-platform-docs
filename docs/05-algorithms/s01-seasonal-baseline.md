---
id: algorithm.s01-seasonal-baseline
title: 季节基线与残差算子
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M04, M06]
related_operators: [s01_seasonal_baseline_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 S01 一阶季节滞后基线、稳健残差和预热窗口。
---

# 季节基线与残差算子 (`s01_seasonal_baseline_v1`)

## 用途与适用范围

用一个季节滞后值构造对齐基线，并生成供 EWMA/CUSUM 使用的残差和稳健标准化残差。它不做趋势拟合或自动异常修复。

## 输入与输出

输入为 `time`、`value`，值必须为有限数值。输出 `observed_value`、`baseline`、`residual`、`residual_z` 和元数据。至少需要两个完整季节；第一季没有历史滞后，基线和残差为空。

## 原理与关键公式

季节长度为 $m$ 时：

$$
b_t= y_{t-m},\qquad r_t=y_t-b_t
$$

在有限残差上计算中位数 $c$ 和 $\sigma=\max(1.4826\times\mathrm{MAD}(r),10^{-9})$：

$$
z_t=\frac{r_t-c}{\sigma}
$$

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `season_length` | `96` | 季节点数，必须不小于 `2`。 |

## 结果解释与限制

该实现是固定滞后基线，不是日/周多槽位模型。第一季是预热区间；独立节点保留空值，S01 固定管线在调用 EWMA/CUSUM 前过滤这些点。季节长度应与采样间隔和业务周期一致。

## 参考资料

本算子为平台确定性季节滞后规则，无单独外部论文基准。
