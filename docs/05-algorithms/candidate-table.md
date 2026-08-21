---
id: operator.candidate-table
title: 漏损候选表生成算子
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [algorithm_user, operator]
related_modules: [M04, M06]
related_operators: [candidate_table_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 算子 candidate_table_v1 格式化并输出结构化漏损风险事件候选清单。
---

# 漏损候选表生成算子 (`candidate_table_v1`)

将连续多点高置信度漏损风险聚合为结构化表格（包含事件开始时间、持续时间、峰值风险评分与估算漏失水量）。
