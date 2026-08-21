---
id: operator.s01-assessment-report
title: S01 漏损评估报告算子
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [platform_user, operator]
related_modules: [M04, M06]
related_operators: [s01_assessment_report_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 S01 报告算子如何汇总候选、风险时序和证据表。
---

# S01 漏损评估报告算子 (`s01_assessment_report_v1`)

## 用途与适用范围

将证据融合候选、风险时序和归一化证据表组装成可追溯的 DMA 筛查报告。它整理已有输出，不重新计算漏损或判断现场真值。

## 输入与输出

输入为 `candidates`、`risk_score` 时序和 `scores` 表。输出包含 `scope`、`candidate_count`、风险最大值/均值/时间范围、质量分摘要、候选列表、风险时间线和证据统计摘要。

## 原理与关键公式

报告从输入风险时序直接计算：

$$
R_{max}=\max_tR_t,\qquad R_{mean}=\frac{1}{N}\sum_tR_t
$$

质量分为 `scores.quality_score` 的非空均值。报告中的 `quality_gate.passed` 是报告适配器的固定通过标记；实际质量门判断应查看上游 `quality_gate_v1` 或 S01 运行状态。

## 参数说明

该报告适配器没有额外业务参数；候选阈值、权重和连续点数在 `s01_evidence_fusion_v1` 中配置。

## 结果解释与限制

报告中的候选继承融合算子的 DMA 范围和不确定性。`risk_summary` 是输入时序摘要，不是准确率、漏损量或工单优先级。候选应结合计量、阀门、施工记录和现场巡检核验。

## 参考资料

本算子为平台确定性报告汇总规则，无单独外部论文基准。
