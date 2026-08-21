---
id: algorithm.seasonal-naive
title: 季节朴素时序预测
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M04]
related_operators: [seasonal_naive]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 seasonal_naive 的周期重复预测、区间输出和参数。
---

# 季节朴素时序预测 (`seasonal_naive`)

## 用途与适用范围

`seasonal_naive` 是无需训练的预测基线。它把输入中最后一个完整季节重复到预测窗口，适合与更复杂的模型在相同时间窗口上比较。

## 输入与输出

输入为包含 `value` 的时序；实现会转为数值并丢弃非有限值。有效值数量至少为 `season_length`。输出 `values`、`lower`、`upper` 和空的 `quantiles`，结果元数据包含 `season_length` 和有效历史长度。

## 原理与关键公式

设季节长度为 $m$，最后一个完整季节为 $(y_{T-m+1},\ldots,y_T)$。预测值是该片段的循环重复：

$$
\hat y_{T+h}=y_{T-m+1+((h-1)\bmod m)},\qquad h=1,\ldots,H
$$

若历史中存在跨季节配对误差，代码计算 $e_t=y_t-y_{t-m}$ 的标准差 $\sigma_e$，并给出随预测步数增长的近似带宽：

$$
w_h=1.96\,\sigma_e\sqrt{\left\lceil\frac{h}{m}\right\rceil},\qquad
[\hat y_{T+h}-w_h,\hat y_{T+h}+w_h]
$$

这不是校准后的概率区间。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `season_length` | `96` | 一个季节包含的点数；15 分钟采样的一天为 96。 |
| `horizon` | `96` | 预测点数；接口范围为 `1–96`。 |

## 结果解释与限制

该方法不学习趋势、节假日或外生变量。历史值不足时失败；非有限值会被丢弃，因此输入时间与值的对应关系应由上游保证。区间宽度来自历史跨季节差异，不代表经验证的覆盖率。复杂模型应与此基线在相同留出数据上比较。

## 参考资料

本算子为平台确定性季节重复规则，无单独外部论文基准；平台算子为 `seasonal_naive`。
