---
id: operator.dataset-channel
title: 数据通道绑定算子
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, developer]
related_modules: [M02, M04]
related_operators: [dataset_channel_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 算子 dataset_channel_v1 将数据资产的指定通道解构为工作流时序流输入。
---

# 数据通道绑定算子 (`dataset_channel_v1`)

用于从数据资产中提取单一通道（如仅提取 `inflow`），作为下游单变量算子的独立输入。
