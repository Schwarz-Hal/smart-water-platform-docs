---
id: platform.algorithm-workflow-lifecycle
title: 算法发布版本、模型与工作流复现关系
document_type: platform
document_version: 1.1.0
status: published
locale: zh-CN
audience: [developer, algorithm_user]
related_modules: [M04, M05]
related_operators: []
related_apis: ["/api/v1/algorithms/{algorithm_code}/releases", "/api/v1/workflow-versions/{version_id}/runs"]
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明算法发布、训练模型、工作流版本和运行快照如何保持可追溯。
---

# 算法发布版本、模型与工作流复现关系

平台通过不可变版本和运行快照保存“当时使用了什么”。这支持审计和比较，但不表示所有历史计算都能在任意环境中自动重算，也不提供未经业务验证的准确率承诺。

## 1. 算法和模型版本

- 算法身份、实现版本、算子版本、训练运行和模型版本分别登记。
- 训练模型由 `seasonal_robust_anomaly` 生成安全 JSON 模型；Chronos-2 是预训练 GPU 推理算法，当前不支持平台内训练。
- 模型状态为 `training → ready → review_pending → published|retired|blocked`。私有模型默认仅创建者和管理员可见。
- 发布版本把实现版本、默认模型、默认参数、训练参数、验证快照、变更说明和文档引用组合为不可变快照。

## 2. 发布审核与激活

发布状态为 `draft → validating → review_pending → approved → active → superseded|retired|blocked`。创建者或提交者不能审核自己的发布版本。激活只切换活动指针，不覆盖历史内容；回滚是把历史发布版本重新设为活动版本，不修改已完成任务的快照。

## 3. 工作流与运行快照

工作流发布版本冻结 Graph、节点版本、端口连接和参数。创建运行时再保存数据版本、点位、指标、值来源、时间范围和参数覆盖。工作流运行会保留这些快照、节点状态和 Artifact 摘要，因此后续激活新算法不会改变已创建运行的引用。

## 4. 可追溯范围与边界

通过工作流运行详情、节点和 Artifact 接口，可以追溯数据版本、工作流版本、算子/算法版本、模型摘要、参数和任务 `trace_id`。大对象由 API 代理 MinIO 读取并带 SHA256 摘要。恢复依赖仍可访问的对象、兼容的运行时和保存的版本；平台不宣称跨任意未来环境的自动重演。
