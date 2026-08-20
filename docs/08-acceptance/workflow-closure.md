---
id: acceptance.workflow-closure
title: 工作流闭环验收步骤与证据清单
document_type: acceptance
document_version: 1.0.0
status: published
locale: zh-CN
audience: [project_stakeholder, operator]
related_modules: [M02, M05, M06, M07]
related_operators: []
related_apis: []
owners: [quality-team]
reviewed_at: 2026-08-20
summary: 验证数据资产、工作流、运行记录和结果追溯形成完整闭环。
---

# 工作流闭环验收步骤与证据清单

## 验收步骤

1. 上传一份可公开用于验收的 CSV，并完成字段映射和导入。
2. 确认数据资产显示当前可用版本、通道和质量评估状态。
3. 创建或打开一个工作流，完成数据绑定、校验和发布。
4. 创建运行，确认任务状态、节点日志与 artifact 可查询。
5. 查看最终结果与报告，确认候选、图表或质量统计能够解释。
6. 刷新页面后重新打开运行，确认数据、算子、参数和结果关系仍可追溯。

## 建议留存证据

| 项目 | 证据 |
| --- | --- |
| 数据接入 | 资产名称、版本、通道和导入任务记录。 |
| 流程发布 | 发布版本、图校验结果和节点参数。 |
| 运行结果 | 运行 ID、节点状态、结果摘要和 `trace_id`。 |
| 追溯性 | 数据版本、算子版本、模型版本（如适用）和发布时间。 |
