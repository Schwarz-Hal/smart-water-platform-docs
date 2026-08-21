---
id: user.workflow-library
title: 工作流库、模板与版本管理
document_type: user_guide
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, developer, operator]
related_modules: [M05]
related_operators: []
related_apis: ["/api/v1/workflows"]
owners: [product-team]
reviewed_at: 2026-08-21
summary: 说明工作流库的管理操作，包括新建空白流程、从系统模板克隆、流程版本归档与软删除。
---

# 工作流库、模板与版本管理

工作流库集中管理用户创建的分析流程与系统预置的业务模板，支持流程资产的全生命周期维护。

---

## 1. 工作流库视图

进入【工作流编排】→【工作流库】：
- **系统内置模板**：提供工业级开箱即用的标准流程（如 `S01 DMA 漏损筛查`、`时序数据全套清洗流`、`Chronos-2 流量预测流`）；
- **我的工作流**：展示当前用户创建的所有流程草稿与发布版本；
- **状态标识**：清晰标明 `草稿 (Draft)`、`已发布 (Published)` 与发布版本号（如 `v1.0.0`）。

---

## 2. 常用操作指南

- **从模板新建 / 克隆**：在模板卡片上点击【使用此模板】，一键克隆完整的节点拓扑与出厂参数配置到个人工作区；
- **新建空白工作流**：点击【新建空白工作流】，输入流程名称与描述，开启自由画布编排；
- **流程归档与删除**：
  - 对于废弃的草稿，点击卡片更多菜单中的【移入回收站】；
  - 已发布的流程版本在有历史运行任务关联时受保护，需先解除引用方可归档。
