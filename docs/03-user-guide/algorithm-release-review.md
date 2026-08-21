---
id: user.algorithm-release-review
title: 算法发布、审核、激活和回滚
document_type: user_guide
document_version: 1.0.0
status: published
locale: zh-CN
audience: [developer, admin]
related_modules: [M04]
related_operators: []
related_apis: ["/api/v1/operators/{code}/versions/{version}/publish"]
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明算子新版本提交发布申请、管理员安全审核、生产环境激活与故障版本一键回滚流程。
---

# 算法发布、审核、激活和回滚

为保障生产环境工作流运行稳定性，平台对算法与算子的升级实行严格的**“研发提交 $\rightarrow$ 管理员审核 $\rightarrow$ 生产激活”**四眼原则管控。

---

## 1. 算法发布审批全流程

```mermaid
sequenceDiagram
    autonumber
    actor Dev as 算法工程师
    participant UI as 算子中心
    actor Admin as 管理员
    participant Core as 算子版本注册引擎

    Dev->>UI: 1. 提交新版本算子 (含代码包 & Schema)
    UI->>Core: 记录为 PENDING_REVIEW 审核态
    Admin->>UI: 2. 查验接口契约、安全扫描报告与测试用例
    alt 审核通过
        Admin->>UI: 3. 批准发布
        UI->>Core: 状态标记为 ACTIVE 激活可用
    else 驳回修改
        Admin->>UI: 填写驳回意见
        UI->>Core: 状态标记为 REJECTED
    end
```

---

## 2. 生产版本激活与紧急回滚

- **多版本并存**：新版本激活后，历史版本仍保持可用，避免破坏依赖旧版本的历史工作流；
- **紧急停用与回滚**：若新版本在生产运行中出现非预期缺陷，管理员可一键将其标记为 `DEPRECATED`（弃用），工作流将自动回退调用最近的稳定版。
