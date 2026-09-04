---
id: operator.data-governance-operations
title: 数据治理操作概览
document_type: algorithm
document_version: 0.1.0
status: published
locale: zh-CN
audience: [algorithm_user, platform_user]
related_modules: [M02, M03, M04, M05]
related_operators: [data_quality_profile_v1, schema_expectation_profile_v1, time_axis_integrity_v1, water_sensor_rule_check_v1, missing_marker_normalize_v1, sort_dataset_v1, deduplicate_dataset_v1, missing_value_repair_dataset_v1, outlier_repair_dataset_v1, schema_cast_rename_v1, semantic_resample_v1, table_reshape_v1, topology_quality_profile_v1]
related_apis: ["/api/v1/data-governance/catalog", "/api/v1/data-governance/runs"]
owners: [algorithm-team]
reviewed_at: 2026-09-04
summary: 汇总内置数据治理操作的类别、效果、标准输出和工作台/工作流可用范围。
---

# 数据治理操作概览

## 用途与适用范围

本页汇总当前内置的数据治理操作。目录会按来源文件的模态、已安装状态和目标模式筛选可用项；页面上的名称和范围不替代运行时的参数、权限和版本校验。

## 操作目录

| 类别 | 操作 | 效果 | 可用位置 |
| --- | --- | --- | --- |
| 质量画像 | `data_quality_profile_v1`（数据质量评估） | 报告 | 工作台、工作流 |
| 规则检查 | `schema_expectation_profile_v1`（字段规则检查） | 报告 | 工作台、工作流 |
| 时间检查 | `time_axis_integrity_v1`（时间轴完整性检查） | 报告 | 工作台、工作流 |
| 水务规则 | `water_sensor_rule_check_v1`（水务传感器规则检查） | 报告 | 工作台、工作流 |
| 清洗 | `missing_marker_normalize_v1`（缺失标记规范化） | 转换 | 工作台、工作流 |
| 清洗 | `sort_dataset_v1`（数据排序） | 转换 | 工作台、工作流 |
| 清洗 | `deduplicate_dataset_v1`（数据去重） | 转换 | 工作台、工作流 |
| 修复 | `missing_value_repair_dataset_v1`（缺失值修复） | 转换 | 工作台、工作流 |
| 修复 | `outlier_repair_dataset_v1`（异常值处理） | 转换 | 工作台、工作流 |
| 结构整理 | `schema_cast_rename_v1`（字段改名与类型转换） | 转换 | 工作台、工作流 |
| 时序增强 | `semantic_resample_v1`（语义重采样） | 转换 | 工作台、工作流 |
| 表格专项 | `table_reshape_v1`（表格宽长转换） | 转换 | 仅工作台 |
| 拓扑专项 | `topology_quality_profile_v1`（拓扑质量检查） | 报告 | 仅工作台 |

“报告”不改变数据；“转换”只会在明确选择生成新版本或新文件时物化结果，绝不原地修改来源内容。报告型步骤可与转换型步骤按顺序组合，但仅报告目标不能包含转换步骤。

## 标准输出与配置

每个操作按实际能力产生 `data`、`reports`、`change_set`、`issue_mask`、`provenance` 中的适用子集。运行详情提供有界摘要和样本；完整报告、变更集、问题掩码或数据内容必须通过鉴权内容接口下载。来源版本、算子版本、规范化参数和摘要会随运行冻结，以便重复查看同一次结果。

一般表格使用 `missing_value_repair_dataset_v1` 或 `outlier_repair_dataset_v1` 时，必须显式指定待修复列；未选列不会被隐式修复。时间画像可为包含 `time_column` 参数的操作预填识别出的时间列；语义重采样的目标间隔和聚合语义仍需按本次数据明确配置。

兼容表格和时序输入的操作保留工作流节点可用性。`table_reshape_v1` 与 `topology_quality_profile_v1` 当前仅面向数据文件工作台；把其他治理结果接入通用工作流 Artifact 的适配器是后续扩展点，并非这些操作已经具备的工作流能力。

## 结果解释与限制

治理运行的整体任务状态以任务记录为准；关闭工作台不会取消已排队或运行中的任务，之后可以从运行历史恢复查看。来源或结果动作应定位到该运行冻结的精确文件版本，不能以当前版本替代。

报告、变更集和问题掩码用于解释处理过程，不替代现场核验、业务审批或数据所有者的判断。
