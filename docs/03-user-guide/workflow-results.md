---
id: user.workflow-results
title: 节点结果、Artifact 和最终输出查看
document_type: user_guide
document_version: 1.3.0
status: published
locale: zh-CN
audience: [platform_user, operator]
related_modules: [M05, M06, M07]
related_operators: []
related_apis: ["/api/v1/workflow-runs/{run_id}", "/api/v1/workflow-runs/{run_id}/nodes", "/api/v1/workflow-runs/{run_id}/artifacts"]
owners: [product-team]
reviewed_at: 2026-08-21
summary: 在任务和运行详情页面查看状态、节点结果、结果附件和最终输出。
---

# 节点结果、Artifact 和最终输出查看

## 用途

查看一次工作流运行是否完成、哪个节点失败，以及最终输出和结果附件。平台通过页面提供结果，不要求用户接触对象存储。

## 前置条件与角色

只有运行创建者或管理员可以查看运行、节点和结果；没有单独的通用 viewer 例外。可见范围仍以页面实际显示为准。

## 操作步骤

1. 打开【任务中心】或工作流运行列表，进入目标运行详情，先查看总体状态、输入版本和参数快照。
2. 打开【节点】区域，按节点查看处理中、已完成或失败状态；失败节点先展开日志和错误说明。
3. 打开【结果】或【Artifact】区域，先查看摘要和预览，再按需要打开完整内容。结果类型不同，页面可能显示曲线、表格、候选列表、报告或 JSON。
4. 在【最终输出】区域查看工作流声明的结果。对于页面不认识的类型，使用安全预览或下载入口。

## 结果与失败处理

实时状态短暂中断时刷新运行详情；最终状态以任务详情为准。运行失败、输出缺失或附件无法读取时，保留页面显示的错误信息和追踪标识并联系运维。不同算法的结果字段可能不同，不要把某一种曲线或报告当成所有运行必有的结果。
