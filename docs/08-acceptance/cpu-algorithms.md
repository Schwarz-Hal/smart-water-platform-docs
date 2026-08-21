---
id: acceptance.cpu-algorithms
title: 内置 CPU 算法与结果契约验收
document_type: acceptance
document_version: 1.0.1
status: published
locale: zh-CN
audience: [project_stakeholder, developer]
related_modules: [M04]
related_operators: [qscore_v1, hampel, align_timeseries_v1]
related_apis: []
owners: [quality-team]
reviewed_at: 2026-08-21
summary: 验证内置 CPU 算子的输入、输出和结果契约，并记录可复核证据。
---

# 内置 CPU 算法与结果契约验收

## 1. 验收步骤

- [ ] 使用固定测试数据运行 Qscore，记录输入版本、五维分量和输出结果。
- [ ] 使用包含已知异常点的数据运行 Hampel，记录参数、识别结果和误报检查。
- [ ] 使用非规整采样数据运行时序对齐，记录输入时间范围和输出网格。
- [ ] 对照各算子契约检查端口、参数校验、输出字段和错误响应。

## 2. 预期结果

实际输出应与所引用的算子契约和测试数据预期一致。不得把样例输出或未经记录的性能判断当作验收结论。

## 3. 证据记录

| 步骤 ID | 证据标识/链接 | 审阅人 | 日期 | 结论 |
| --- | --- | --- | --- | --- |
| CPU-01 | 待执行：填写 `run_id`、数据版本或报告链接 | 待指定 | 待填写 | [ ] 通过 |
| CPU-02 | 待执行：填写 `run_id`、参数快照或报告链接 | 待指定 | 待填写 | [ ] 通过 |
| CPU-03 | 待执行：填写 `run_id`、输出快照或报告链接 | 待指定 | 待填写 | [ ] 通过 |
| CPU-04 | 待执行：填写契约版本、测试报告或链接 | 待指定 | 待填写 | [ ] 通过 |
