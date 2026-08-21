---
id: operator.align-timeseries
title: 时序时钟对齐算子
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M03, M04]
related_operators: [align_timeseries_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 算子 align_timeseries_v1 将多通道不齐整时间戳规整对齐至统一步长。
---

# 时序时钟对齐算子 (`align_timeseries_v1`)

将不同采样时间戳的时序对齐到标准时钟网格（如整点 00, 15, 30, 45 分），支持聚合（`mean`, `sum`, `max`）与插值对齐。
