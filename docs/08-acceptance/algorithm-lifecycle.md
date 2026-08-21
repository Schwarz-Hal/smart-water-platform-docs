---
id: acceptance.algorithm-lifecycle
title: 训练、模型、审核、激活与回滚验收
document_type: acceptance
document_version: 1.0.1
status: published
locale: zh-CN
audience: [project_stakeholder, developer]
related_modules: [M04]
related_operators: []
related_apis: []
owners: [quality-team]
reviewed_at: 2026-08-21
summary: 验证模型训练、注册、发布审核、激活与回滚步骤，并记录可复核证据。
---

# 训练、模型、审核、激活与回滚验收

## 1. 验收步骤

- [ ] 使用已批准的训练数据和参数创建训练任务，记录生成的模型版本。
- [ ] 以算法工程师身份提交发布申请，并以管理员身份完成审核；记录权限结果。
- [ ] 激活已审核版本，运行一个绑定该版本的工作流并记录任务结果。
- [ ] 将测试版本标记为弃用或执行回滚，确认后续运行使用指定的历史版本。

## 2. 预期结果

每一步都能在任务、模型、审核或运行记录中找到对应状态，并能根据版本标识复现核验路径。未执行或失败的步骤不得标记为通过。

## 3. 证据记录

| 步骤 ID | 证据标识/链接 | 审阅人 | 日期 | 结论 |
| --- | --- | --- | --- | --- |
| AL-01 | 待执行：填写 run_id、模型版本或报告链接 | 待指定 | 待填写 | [ ] 通过 |
| AL-02 | 待执行：填写发布申请、审核记录或报告链接 | 待指定 | 待填写 | [ ] 通过 |
| AL-03 | 待执行：填写工作流 run_id 或报告链接 | 待指定 | 待填写 | [ ] 通过 |
| AL-04 | 待执行：填写回滚记录、trace_id 或报告链接 | 待指定 | 待填写 | [ ] 通过 |
