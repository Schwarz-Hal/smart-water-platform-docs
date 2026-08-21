---
id: acceptance.gpu-chronos
title: GPU Worker 与 Chronos-2 预测验收
document_type: acceptance
document_version: 1.0.1
status: published
locale: zh-CN
audience: [project_stakeholder, operator, developer]
related_modules: [M04, M07]
related_operators: [chronos2_flow_forecast]
related_apis: ["/api/v1/workflows"]
owners: [quality-team]
reviewed_at: 2026-08-21
summary: 验证 GPU Worker 路由、Chronos-2 推理输出和资源检查步骤，并记录证据。
---

# GPU Worker 与 Chronos-2 预测验收

## 1. 验收步骤

- [ ] 执行环境探针，记录 GPU Worker 队列、驱动和 CUDA 检查结果。
- [ ] 使用已批准的数据和参数编排 Chronos-2 预测工作流，记录工作流版本。
- [ ] 触发运行并记录任务状态、队列路由、run_id 和资源观察结果。
- [ ] 核验预测输出字段、分位数和图表；记录数据范围与结果报告。

## 2. 预期结果

任务路由、资源检查和输出字段应与适用契约一致。性能、趋势或显存结论必须引用具体测试报告，不能由本页预设。

## 3. 证据记录

| 步骤 ID | 证据标识/链接 | 审阅人 | 日期 | 结论 |
| --- | --- | --- | --- | --- |
| GC-01 | 待执行：填写环境检查报告或链接 | 待指定 | 待填写 | [ ] 通过 |
| GC-02 | 待执行：填写工作流版本、参数或链接 | 待指定 | 待填写 | [ ] 通过 |
| GC-03 | 待执行：填写任务 run_id、trace_id 或链接 | 待指定 | 待填写 | [ ] 通过 |
| GC-04 | 待执行：填写输出报告、模型版本或链接 | 待指定 | 待填写 | [ ] 通过 |
