---
id: acceptance.algorithm-lifecycle
title: 训练、模型、审核、激活与回滚验收
document_type: acceptance
document_version: 1.0.0
status: published
locale: zh-CN
audience: [project_stakeholder, developer]
related_modules: [M04]
related_operators: []
related_apis: []
owners: [quality-team]
reviewed_at: 2026-08-21
summary: 验证模型离线训练、注册入库、算子多版本发布审核与紧急回滚全生命周期闭环。
---

# 训练、模型、审核、激活与回滚验收

---

## 1. 验收步骤与指标

1. **训练与注册**：训练季节稳健模型并成功注册版本 `v1.0.0`；
2. **发布申请与审核**：模拟算法工程师提交发布，管理员审核通过后激活；
3. **回滚验证**：将异常版本标记弃用，确认工作流自动切回历史基线版本。
