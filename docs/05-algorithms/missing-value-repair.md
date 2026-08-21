---
id: operator.missing-value-repair
title: 缺失值修复算子
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [algorithm_user, platform_user]
related_modules: [M03, M04]
related_operators: [missing_value_repair_dataset_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 算子 missing_value_repair_dataset_v1 修复策略、插值算法与参数配置。
---

# 缺失值修复算子 (`missing_value_repair_dataset_v1`)

---

## 1. 端口与参数

- **输入**：`timeseries` (带缺失值的时序流)
- **输出**：`timeseries` (插补修复后的完整时序流)

| 参数名 | 类型 | 默认值 | 可选值 / 说明 |
| :--- | :--- | :---: | :--- |
| `method` | 字符串 | `linear` | `linear` (线性插值)、`ffill` (前向填充)、`bfill` (后向填充)、`spline` (样条插值) |
| `max_gap` | 整数 | `8` | 允许插补的最大连续缺失点数（超出则保留空值避免失真） |
