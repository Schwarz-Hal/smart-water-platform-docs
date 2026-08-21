---
id: operator.quality-gate
title: 数据质量门算子
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, developer]
related_modules: [M03, M04]
related_operators: [quality_gate_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 算子 quality_gate_v1 拦截低质量时序，保障下游高精度模型输入可靠性。
---

# 数据质量门算子 (`quality_gate_v1`)

根据配置的最低质量门槛（如 Qscore ≥ 70），若输入数据未达标则熔断下游计算并输出诊断警报。
