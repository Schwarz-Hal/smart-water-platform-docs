---
id: operator.kalman-repair
title: Kalman 状态空间缺失修复
document_type: algorithm
document_version: 0.1.0
status: draft
locale: zh-CN
audience: [algorithm_user, platform_user, developer]
related_modules: [M03, M04]
related_operators: [kalman_repair_dataset_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-09-10
summary: 说明Kalman 状态空间缺失修复新增版本的输入、模型、参数、适用范围与验证边界。
---

# Kalman 状态空间缺失修复

本文说明新增版本的实现约束，不代表真实管网业务效果验收。

## 用途与适用范围

算子 `kalman_repair_dataset_v1@1.0.0` 使用局部水平状态空间模型修复短缺口。当前是使用前后观测的离线平滑，不是在线滤波，也不是带周期项的自动拟合模型。已有观测峰值原样保留。

## 输入与输出

数据文件治理支持时序表的显式数值列、时间列和分组列，生成派生文件或版本、变更集与缺失问题掩码。工作流通过 `dataset` 数据集包逐通道产生治理 stage，保留源版本血缘，不额外新增掩码端口。两种路径都不改写源观测。

## 原理与关键公式

局部水平模型把观测分为隐藏水平和测量噪声；隐藏水平每步由上一水平加过程噪声得到。statsmodels `UnobservedComponents(level="local level")` 在缺测时跳过测量更新，再用平滑状态提供估计。当前测量方差和过程方差由参数固定，不运行优化器拟合，未输出可信区间。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `columns` / `time_column` / `group_columns` | `null` / `time` / `null` | 数值、时间与分组列；通用表须显式指定数值列。 |
| `max_gap_points` | `8` | 连续缺失 1–1024 点的整段上限。 |
| `max_gap_seconds` | `7200` | 缺口两侧观测总时间跨度上限，单位秒。 |
| `observation_variance` | `1.0` | 测量噪声方差，大于 0，单位为数值列物理单位的平方。 |
| `process_variance` | `0.01` | 每步过程噪声方差，大于 0，单位同上。 |

## 结果解释与限制

先确认各组时间轴规则，再选方差及缺口上限。不同单位的列不应机械共用同一方差设置。仅内部、整段未超点数和时长限制的缺口可填；首尾和长缺口保留为空。缺口需要计算而采样不规则时返回 `GOVERNANCE_REGULAR_CADENCE_REQUIRED`，应先按业务语义重采样。时间重复、无效时间或非数值输入应先治理。运行环境须有 statsmodels；没有依赖时明确失败。没有训练时间不等于零运行成本，参数仍须用已知观测遮蔽验证。

## 参考资料

[statsmodels 状态空间模型](https://www.statsmodels.org/stable/generated/statsmodels.tsa.statespace.structural.UnobservedComponents.html)。statsmodels 为 BSD 许可依赖。平台事实来自算子 `1.0.0` manifest 和 `governance_operations/advanced_repair.py`。
