---
id: scenario.anomaly-detection
title: 时序异常检测、模型训练与候选核验
document_type: scenario
document_version: 1.1.0
status: published
locale: zh-CN
audience: [platform_user, operator, developer]
related_modules: [M04, M05]
related_operators: [hampel, outlier_repair_dataset_v1, seasonal_robust_anomaly]
related_apis: [/api/v1/workflows]
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 区分 Hampel 点异常、治理修复动作和季节稳健异常候选的使用边界。
---

# 时序异常检测、模型训练与候选核验场景

## 用途与适用范围

异常场景把数据质量治理、点异常检测和相对季节基线偏离分开处理。检测结果是需要解释的统计信号，不自动等价为故障、漏损或处置工单。

## 算子选择

| 目的 | 算子 | 输出或动作 |
| --- | --- | --- |
| 发现局部点异常 | `hampel` | 输出 `scores` 和 `labels`，保留输入值。 |
| 治理数据中的离群点 | `outlier_repair_dataset_v1` | `flag_only`、`median`、`interpolate` 三选一；默认 `flag_only`。 |
| 检测相对日/周季节基线的连续偏离 | `seasonal_robust_anomaly` | 使用训练模型输出分数、标记和连续候选。 |

## 操作边界

独立 `hampel` 只做检测，不自动插值。治理工作流只有在显式选择 `median` 或 `interpolate` 时才替换离群值；`flag_only` 只增加标记。治理后的数据应作为派生版本重新画像，不能把修复动作隐含在检测结果中。

`seasonal_robust_anomaly` 需要按数据集训练的模型，推理时可覆盖 `threshold` 和 `min_consecutive_points`。连续候选表示相对季节基线的持续偏离，仍需人工核验其物理原因。

## 结果解释与限制

传感器毛刺、真实工况变化、时间不规则和季节模式变化都可能触发标记。平台当前实现不根据这些标记自动生成告警工单或闭环派发；处置由后续业务流程和人工复核决定。

## 参考资料

本场景采用平台确定性的异常检测与治理组合规则，无单独外部论文基准。
