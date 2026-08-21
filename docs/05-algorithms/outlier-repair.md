---
id: operator.outlier-repair
title: 数据集异常值检测与处理算子
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [algorithm_user, platform_user]
related_modules: [M03, M04]
related_operators: [outlier_repair_dataset_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 outlier_repair_dataset_v1 对数据集包按通道检测并处理 Hampel 异常值的参数和派生 stage 边界。
---

# 数据集异常值检测与处理算子 (`outlier_repair_dataset_v1`)

## 用途与适用范围

对 `dataset_bundle` 中的每个时序通道独立计算 Hampel 异常标记，并按所选动作保留或处理异常值。算子面向数据集级治理；它不接收单条 `timeseries` 端口，也不宣称异常点就是设备故障。

## 输入与输出

输入端口为 `dataset`，类型为 `dataset_bundle`。算子对包内各通道的 `time`、`value` 数据逐一处理，输出端口仍为 `dataset`，类型为 `dataset_bundle`，写入新的治理 stage。输出通道增加 `outlier` 布尔标记；`value` 是否改变取决于 `action`。stage 仍是处理中间结果，只有后续发布节点成功后才形成新的派生数据版本，父版本不被修改。

## 原理与关键公式

对时间排序后的通道值 $v_t$，以中心窗口计算局部中位数：

$$
m_t = \operatorname{median}\{v_i: i\in W_t\}
$$

其中 $W_t$ 是长度为 `window` 的中心窗口，边界处使用实际可用值（实现允许窗口内至少一个值）。再计算局部中位绝对偏差：

$$
MAD_t = \operatorname{median}\{|v_i-m_i|: i\in W_t\}
$$

当且仅当下式严格成立时，`outlier` 为 `true`：

$$
|v_t-m_t| > threshold\times 1.4826\times\max(MAD_t, 10^{-12})
$$

`1.4826` 是实现中的 MAD 缩放常数；阈值相等不标记。窗口边界不因缺少完整窗口而自动丢弃，缺失值能否产生有效标记取决于滚动统计结果。

## 参数说明

| 参数 | 类型 | 默认值 | 约束与说明 |
| --- | --- | ---: | --- |
| `window` | integer | `7` | 必须为不小于 `3` 的奇数，当前 Schema 上限为 `101`。 |
| `threshold` | number | `3.0` | 必须大于 `0`，作为上式的偏差倍数。 |
| `action` | enum | `flag_only` | `flag_only` 只写入标记；`median` 用局部中位数替换标记值；`interpolate` 先将标记值置为空，再对内部空缺做线性插值。 |

算子没有 `method`、`zscore`、`nullify` 或 `clip` 参数；检测方法固定为这里描述的 Hampel 规则。

## 结果解释与限制

- `flag_only` 不改变 `value`，适合先复核标记；`median` 和 `interpolate` 会改变输出 stage 中的值。
- `interpolate` 只填补序列内部的标记空缺，序列端点等没有两侧值的位置可能保留为空；其结果仍需重新进行质量画像。
- MAD 为零或极小时使用 $10^{-12}$ 下限，因此平坦窗口中的微小偏差也可能被标记；这不是故障判定或精确修复证明。
- `window` 为偶数、小于 `3`，或 `threshold` 不为正时节点失败；未知动作或输入不是 `dataset_bundle` 时也不会生成输出 stage。

## 参考资料

本算子为平台确定性的 Hampel 异常检测与数据集治理规则，无单独外部论文基准。
