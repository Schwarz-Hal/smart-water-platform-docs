---
id: operator.dataset-channel
title: 数据通道绑定算子
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [platform_user, developer]
related_modules: [M02, M04]
related_operators: [dataset_channel_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 dataset_channel_v1 从数据集版本绑定单个时序通道的输入、参数和失败边界。
---

# 数据通道绑定算子 (`dataset_channel_v1`)

## 用途与适用范围

从一次工作流运行提供的数据集绑定中读取一个点位和指标通道，转换为下游时序算子的 `series` 输入。它只负责选择和时间范围过滤，不做质量修复、单位换算或重采样。

## 输入与输出

该节点没有图内输入端口；它通过运行时 `input_bindings` 读取数据。绑定至少需要 `dataset_version_id` 和 `metric_code`；可选 `monitor_point_id`、`value_source`、`start`、`end`、`semantic_type`。输出端口为 `series`，类型为时序，行包含 `time` 和 `value`，按时间升序返回。

## 原理与关键公式

按 `(dataset_version_id, metric_code, monitor_point_id)` 读取通道，并选择值来源：

- `raw` 读取原始值；
- `processed` 读取处理值。

若绑定未提供 `value_source`，使用 `processed`。当节点参数或绑定提供 `start`、`end` 时，保留满足包含边界的时间范围：

$$
start\le t\le end
$$

时间过滤后没有行则不产生空时序，而是使节点失败。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `binding_key` | 节点 ID | 从运行时绑定对象中取值；若未设置，按节点 ID 查找。 |

绑定对象中的 `value_source` 可选 `raw` 或 `processed`；`start`、`end` 和 `semantic_type` 用于本次读取和输出描述。节点参数中的同名 `start`、`end` 优先于绑定值。

## 结果解释与限制

绑定缺失或缺少 `dataset_version_id`/`metric_code` 时失败；时间范围过滤后为空时返回空输入错误。该节点不会把 processed 缺失自动回退到 raw，也不会对多个点位或指标做聚合；需要多通道表时应分别绑定后再连接或使用数据集级治理节点。

## 参考资料

本算子为平台确定性数据通道选择规则，无单独外部论文基准。
