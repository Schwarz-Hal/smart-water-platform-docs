---
id: operator.outlier-repair
title: 异常值检测与处理算子
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [algorithm_user, platform_user]
related_modules: [M03, M04]
related_operators: [outlier_repair_dataset_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 算子 outlier_repair_dataset_v1 的过滤策略、剔除与置空参数说明。
---

# 异常值检测与处理算子 (`outlier_repair_dataset_v1`)

---

## 1. 端口与参数

- **输入**：`timeseries` (原始时序流)
- **输出**：`timeseries` (剔除/修复异常点后的时序流)

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :---: | :--- |
| `method` | 字符串 | `hampel` | 异常检测算法（可选 `hampel`、`zscore`） |
| `window` | 整数 | `9` | 滑动窗口大小 |
| `threshold` | 浮点数 | `4.5` | 偏差倍数阈值 |
| `action` | 字符串 | `nullify` | `nullify` (置为缺失值)、`clip` (截断至上下限)、`interpolate` (就地插值) |
