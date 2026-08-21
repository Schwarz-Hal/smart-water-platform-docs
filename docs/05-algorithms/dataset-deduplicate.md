---
id: operator.dataset-deduplicate
title: 数据集去重算子
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, developer]
related_modules: [M03, M04]
related_operators: [deduplicate_dataset_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 算子 deduplicate_dataset_v1 的时间戳冲突检测与重复数据清洗策略。
---

# 数据集去重算子 (`deduplicate_dataset_v1`)

---

## 端口与参数

- **输入**：`timeseries` (含重复时间戳时序)
- **输出**：`timeseries` (严格唯一且升序排列时序)

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :---: | :--- |
| `keep` | 字符串 | `last` | 重复时间戳保留策略：`first` (保留首条)、`last` (保留最新条)、`mean` (计算均值) |
