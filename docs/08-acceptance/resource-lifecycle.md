---
id: acceptance.resource-lifecycle
title: 回收站、注销和自动清理验收
document_type: acceptance
document_version: 1.0.1
status: published
locale: zh-CN
audience: [project_stakeholder, admin]
related_modules: [M01, M02, M05, M07]
related_operators: []
related_apis: []
owners: [quality-team]
reviewed_at: 2026-08-21
summary: 验证软删除、恢复、注销和清理步骤，并记录资源与任务证据。
---

# 回收站、注销和自动清理验收

## 1. 验收步骤

- [ ] 删除测试资源并记录资源版本、删除请求和回收站状态。
- [ ] 恢复该资源并记录恢复请求、资源状态和内容核验结果。
- [ ] 对另一测试资源执行永久清理，记录确认步骤和清理任务结果。
- [ ] 在允许的测试环境核验对象与元数据清理边界，记录失败处理。
- [ ] 如包含账户注销流程，记录注销请求及关联资源处理结果。

## 2. 预期结果

删除、恢复和永久清理的状态转换应可复核；破坏性操作必须使用测试资源并保留确认与审计证据。

## 3. 证据记录

| 步骤 ID | 证据标识/链接 | 审阅人 | 日期 | 结论 |
| --- | --- | --- | --- | --- |
| RL-01 | 待执行：填写资源 ID、请求 trace_id 或链接 | 待指定 | 待填写 | [ ] 通过 |
| RL-02 | 待执行：填写恢复记录、资源版本或链接 | 待指定 | 待填写 | [ ] 通过 |
| RL-03 | 待执行：填写清理任务 run_id 或链接 | 待指定 | 待填写 | [ ] 通过 |
| RL-04 | 待执行：填写对象清理报告或链接 | 待指定 | 待填写 | [ ] 通过 |
| RL-05 | 待执行：填写注销记录、trace_id 或链接 | 待指定 | 待填写 | [ ] 通过 |
