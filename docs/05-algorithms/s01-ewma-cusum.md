---
id: algorithm.s01-ewma-cusum
title: EWMA / CUSUM 持续变化检测
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M04, M06]
related_operators: [s01_ewma_cusum_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 S01 EWMA 与双侧 CUSUM 的递推、标记和事件输出。
---

# EWMA / CUSUM 持续变化检测 (`s01_ewma_cusum_v1`)

## 用途与适用范围

检测季节残差中的持续正向或负向变化，输出点标记、变化分数和连续事件。它是统计变化筛查，不直接证明爆管、暗漏或其他根因。

## 输入与输出

输入为至少 10 行、按时间升序且唯一的 `time`、`residual`。输出 `ewma`、正负 CUSUM、`change_score`、整数 `labels` 和满足最小连续点数的 `events`。

## 原理与关键公式

先以残差中位数 $c$ 和稳健尺度 $\sigma=\max(1.4826\times\mathrm{MAD},10^{-9})$ 标准化 $z_t=(r_t-c)/\sigma$。递推为：

$$
E_0=z_0,\quad E_t=\alpha z_t+(1-\alpha)E_{t-1}
$$

$$
C_t^+=\max(0,C_{t-1}^++z_t-k),\qquad
C_t^- =\min(0,C_{t-1}^-+z_t+k)
$$

当 $|E_t|\ge L$、$C_t^+\ge h$ 或 $C_t^-\le-h$ 时标记。分数为 $\max(|E_t|/L,C_t^+/h,-C_t^-/h)$。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `ewma_alpha` | `0.2` | EWMA 权重，`(0,1]`。 |
| `ewma_limit` | `3.0` | EWMA 标记界限。 |
| `cusum_k` | `0.5` | CUSUM 允许偏移。 |
| `cusum_h` | `5.0` | CUSUM 标记界限。 |
| `min_consecutive_points` | `4` | 事件最少连续点数。 |

## 结果解释与限制

事件由相邻标记点组成；单点标记不会形成事件。阈值和稳健尺度决定敏感度，不能直接映射为漏损概率或维修优先级。

## 参考资料

本算子为平台确定性 EWMA/CUSUM 规则，无单独外部论文基准。
