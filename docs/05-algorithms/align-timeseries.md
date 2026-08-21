---
id: operator.align-timeseries
title: 时序对齐算子
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M03, M04]
related_operators: [align_timeseries_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 align_timeseries_v1 按时间戳连接两个时序并输出对齐表的规则。
---

# 时序对齐算子 (`align_timeseries_v1`)

## 用途与适用范围

将两个已存在的时序按相同时间戳连接成表，供需要多列输入的后续节点使用。它执行连接，不创建时钟网格、不重采样、不插值，也不修改输入序列。

## 输入与输出

输入端口为必填 `left` 时序和可选 `right` 时序。每个时序应包含可解析的 `time` 与 `value`；输入会按时间排序，但不会自动去重。输出端口为 `table`，语义类型为 `aligned_timeseries`；有右序列时列名为 `time`、`value_left`、`value_right`，无右序列时保留 `time`、`value`。

## 原理与关键公式

设左时间集合为 $T_L$，右时间集合为 $T_R$：

- `join=inner` 输出 $T_L\cap T_R$ 的行；
- `join=outer` 输出 $T_L\cup T_R$ 的行，缺少一侧的值保留为空。

连接只比较相等时间戳。时间戳格式、采样间隔或单位不一致不会被算子自动纠正。

## 参数说明

| 参数 | 默认值 | 可选值与说明 |
| --- | --- | --- |
| `join` | `inner` | `inner` 或 `outer`。 |

## 结果解释与限制

`inner` 可能丢弃任一序列独有的时间点；`outer` 可能产生空值。输入缺失或无效的时间和值会被输入校验拒绝；乱序输入会先排序，但重复时间键不会自动去重，两侧存在重复键时连接可能产生多对多行扩增，应先运行去重处理。未知连接方式由底层连接操作报错。需要统一时间网格时，应先使用专门的重采样流程。

## 参考资料

本算子为平台确定性时间戳连接规则，无单独外部论文基准。
