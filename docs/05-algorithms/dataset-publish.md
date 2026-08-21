---
id: operator.dataset-publish
title: 派生数据版本发布算子
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, developer]
related_modules: [M02, M04]
related_operators: [dataset_publish_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 算子 dataset_publish_v1 将工作流清洗处理后的时序流持久化为新一代派生数据资产版本。
---

# 派生数据版本发布算子 (`dataset_publish_v1`)

作为数据治理工作流的终点节点，将治理产物保存为带血缘追踪的派生版本（如 `v2`）。
