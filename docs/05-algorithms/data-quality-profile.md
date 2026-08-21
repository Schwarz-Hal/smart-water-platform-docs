---
id: operator.data-quality-profile
title: 整体数据质量分析算子
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [algorithm_user, platform_user]
related_modules: [M03, M04]
related_operators: [data_quality_profile_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 算子 data_quality_profile_v1 端口规格、配置参数与输出 Artifact 说明。
---

# 整体数据质量分析算子 (`data_quality_profile_v1`)

---

## 1. 端口契约

- **输入端口**：
  - `dataset` (`timeseries` 或 `dataframe`，必填)：待分析的时序数据流。
- **输出端口**：
  - `quality_report` (`table`，格式为 Qscore 综合指标汇总表)；
  - `quality_radar` (`json`，格式为五维雷达图可视化对象)。

---

## 2. 参数规格

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :---: | :--- |
| `expected_interval_seconds` | 整数 | `900` | 预期采样周期（秒），默认 15 分钟 |
| `valid_min` | 浮点数 | `null` | 合法数值下限（低于此值判定为物理无效） |
| `valid_max` | 浮点数 | `null` | 合法数值上限（高于此值判定为物理无效） |
| `jump_z` | 浮点数 | `8.0` | 阶跃突变判定阈值 |
