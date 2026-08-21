---
id: user.algorithm-release-review
title: 算法发布、审核、激活和回滚
document_type: user_guide
document_version: 1.3.0
status: published
locale: zh-CN
audience: [developer, admin]
related_modules: [M04]
related_operators: []
related_apis: ["/api/v1/algorithms/{algorithm_code}/releases", "/api/v1/algorithm-releases/{release_id}/approve", "/api/v1/algorithm-releases/{release_id}/rollback"]
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 查看算子版本与活动发布状态，并了解发布生命周期管理的当前入口边界。
---

# 算法发布、审核、激活和回滚

## 用途

把实现版本、默认参数、模型、验证信息和算法文档组合成可审计的发布版本。

## 前置条件与角色

算法作者或发布人员负责准备版本；具备审核权限的管理员负责独立审核。审核者不能是该版本的创建者或提交者。

## 当前页面能力

1. 打开【算子中心】，选择目标算子并进入【版本与评估】。
2. 查看已登记的算子版本、版本状态/成熟度/可用性，以及页面显示的【活动发布版本】。
3. 当前页面没有创建发布草稿、校验、提交审核、批准、激活、退役或回滚的完整管理控件。需要执行这些生命周期操作时，由具备相应权限的维护人员按 API 和开发文档操作；普通用户不应在页面上寻找不存在的按钮。

## 结果与失败处理

版本与活动发布信息以【版本与评估】页实际显示为准。若需要创建或变更发布，先确认维护人员具备对应权限，并保留 API 返回的状态和错误信息；算法发布的审核规则要求创建者/提交者不能自行审核。生命周期操作只改变发布状态或活动指针，不覆盖历史版本，也不承诺自动回退或零停机。
