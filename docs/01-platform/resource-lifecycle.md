---
id: platform.resource-lifecycle
title: 数据、工作流、任务和账户生命周期
document_type: platform
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, developer, operator]
related_modules: [M01, M02, M05, M07]
related_operators: []
related_apis: []
owners: [platform-team]
reviewed_at: 2026-08-21
summary: 阐述平台核心实体（数据资产、工作流、执行任务与用户账户）的生命周期状态流转与清理机制。
---

# 数据、工作流、任务和账户生命周期

---

## 1. 数据资产生命周期

```mermaid
stateDiagram-v2
    [*] --> 导入中: 上传 CSV / 配置 MySQL
    导入中 --> 初始版本v1: 异步导入成功 & Qscore 评级
    导入中 --> 失败: 数据解析异常
    初始版本v1 --> 治理中: 绑定清洗工作流
    治理中 --> 派生版本v2: 治理算子发布新版本
    初始版本v1 --> 回收站: 软删除
    派生版本v2 --> 回收站: 软删除
    回收站 --> 初始版本v1: 管理员恢复
    回收站 --> [*]: 物理彻底清除
```

- **不可变原则**：已生成的版本数据只读锁定，任何变更均产生新版本（如 `v2`）；
- **软删除与保护**：被已发布工作流引用的数据版本禁止物理删除，删除操作统一进入回收站。

---

## 2. 任务执行状态机 (Task Execution Lifecycle)

- `PENDING`：任务已入队，等待可用 Worker 资源；
- `RUNNING`：Worker 正在执行节点算子计算；
- `SUCCESS`：全节点成功完成并归档 Artifacts；
- `FAILED`：由于输入类型错误、数据缺失超限或算子异常导致任务终止；
- `CANCELLED`：用户或管理员主动中断执行。

---

## 3. 用户账户生命周期

- `REGISTERED`（待审批/活跃） $\rightarrow$ `ACTIVE`（正常登录操作） $\rightarrow$ `SUSPENDED`（管理员冻结） $\rightarrow$ `DELETED`（软注销并解除资源归属）。
