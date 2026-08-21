---
id: operator.dataset-resample
title: 数据集重采样算子
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, developer]
related_modules: [M03, M04]
related_operators: [resample_dataset_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 算子 resample_dataset_v1 降采样与升采样策略、聚合函数与插值配置。
---

# 数据集重采样算子 (`resample_dataset_v1`)

支持将高频秒级/分钟级时序降采样（如 1 分钟 $\rightarrow$ 15 分钟），或将稀疏时序升采样。

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :---: | :--- |
| `target_interval_seconds` | 整数 | `900` | 目标重采样周期（秒），如 900 代表 15 分钟 |
| `aggregation` | 字符串 | `mean` | 降采样聚合函数：`mean` (均值)、`sum` (求和，适用于累计量)、`max`、`min` |
