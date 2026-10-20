---
id: operator.table-preparation
title: 表格预处理算子
document_type: algorithm
document_version: 0.1.0
status: draft
locale: zh-CN
audience: [algorithm_user, platform_user]
related_modules: [M04, M05]
related_operators: [table_prepare_quality_v1, table_prepare_time_v1, table_prepare_sort_v1, table_prepare_repair_v1, table_prepare_resample_v1, table_prepare_series_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-10-16
summary: 说明工作台表格预处理的六个内置节点、端口、参数约束和适用边界。
---

# 表格预处理算子

## 用途与适用范围

这些节点供工作台将表格检查或转换步骤编入工作流。节点按工作流执行，不在配置窗口打开或预览时执行；输入源文件保持原样，处理结果作为工作流制品及报告输出，不覆盖上传文件。当前仅覆盖表格输入和可选的单点位时序输出，不提供完整批量、多点位预处理，也不改变既有 `dataset_bundle` 节点。

六个节点包均为精确版本 `1.0.0`，输入端口为必需的 `table`（`table` 类型）。其中质量检查、时间轴检查、排序、修复和重采样均输出 `table` 与 `report`；表格转时序仅输出 `series`（`timeseries` 类型）。节点包在 manifest 中标记为 `experimental`。

## 输入与输出

| 节点编码（版本） | 输出端口 | 参数要点 |
| --- | --- | --- |
| `table_prepare_quality_v1@1.0.0` | `table`、`report` | 可选 `time_column`；`expected_interval_seconds` 整数，最小 0，默认 0。 |
| `table_prepare_time_v1@1.0.0` | `table`、`report` | 必填 `time_column` 与正整数 `expected_interval_seconds`；可选 `timezone`。 |
| `table_prepare_sort_v1@1.0.0` | `table`、`report` | 必填单列 `columns`；`ascending` 默认 `true`；`na_position` 为 `first` 或 `last`，默认 `last`。 |
| `table_prepare_repair_v1@1.0.0` | `table`、`report` | 必填唯一列名列表 `columns` 和正整数 `max_gap_points`（默认 8）；`method` 为 `linear`、`forward_fill`、`backward_fill` 或 `seasonal_naive`；`seasonal_period` 默认 96，最小 2。 |
| `table_prepare_resample_v1@1.0.0` | `table`、`report` | 必填 `time_column`、`interval` 和 `aggregations`；每个非时间列选择 `mean`、`sum`、`min`、`max`、`median`、`first` 或 `last`。 |
| `table_prepare_series_v1@1.0.0` | `series` | 必填 `time_column`、`value_column`；`point_column` 可选。 |

## 原理与关键约束

- **检查**：质量检查和时间轴检查将表格及检查报告沿工作流传递。检查节点不以另一个数据文件替换原文件。
- **时间解析与排序**：排序和重采样按 UTC 解析时间以确定先后或时间桶。排序输出保留原始字段表示；时间列缺失或含空值、时间无法解析时，处理会显式失败，不静默丢弃这些记录。
- **缺失值修复**：仅处理 `columns` 明确列出的字段。连续缺失长度超过 `max_gap_points` 时整段仍为空；不会删除这些行。选择目标列时应排除时间列、点位列及非数值列。
- **语义重采样**：对时间列按指定 `interval` 分桶，并逐个应用 `aggregations` 中指定的聚合方式。每个非时间列都必须显式指定聚合方式；若某桶的 `sum` 输入全为空，输出仍为空，不将其变为零。
- **转为时序**：时间列、数值列须存在且时间不能空；时间按 UTC 解析，数值列必须可转为数值且不能含无穷值。指定点位列时，空点位或不同于单一值的多点位会明确报错。该节点不会把多个点位合并成一条时序；请先筛选到一个点位，或保留表格输出。

处理输出保留行来源与处理来源信息，便于报告追踪输入行与生成结果的关系。失败时应检查所选列、时间值、缺口长度和聚合映射，再从工作流配置中修正；不要把预览当成已经运行的处理结果。

## 参数说明

上述参数名称、类型、必填项及枚举以各节点 `1.0.0` 的参数 Schema 为准。工作台的“时序整理”默认不启用排序、修复或重采样；选择起始方案不会替代人工确认必要的列映射、采样间隔及聚合方式。工作台重采样框接受正整数加 `ms`、`s`、`min`、`h` 或 `D` 后缀（如 `15min`）；节点参数 Schema 将 `interval` 定义为字符串，底层继续使用现有执行器支持的 Pandas 合法频率表达式。启用重采样后，工作台生成的处理后质量检查使用重采样间隔；现有质量评估契约以整秒表示，非整秒间隔传 `0`，不沿用原采样间隔，也不做四舍五入。

## 结果解释与限制

处理结果是本次工作流运行产生的节点输出，不会覆盖输入源文件，也不会自动改写其他数据集或历史运行结果。六个节点当前在工作台方案中按检查、时间轴、可选转换及可选时序转换的固定次序编排；需要不同流程时，可在画布上自行调整或删除节点。

## 参考资料

- Neo 内置算子包 `table_prepare_{quality,time,sort,repair,resample,series}_v1` 的 `1.0.0` manifest 与参数 Schema。
- Neo `app/platform/data_assets/table_preparation.py` 及 `tests/data_assets/test_table_preparation.py`。
- 工作台数据准备方案、配置窗口、偏好服务与数据插入服务实现。
