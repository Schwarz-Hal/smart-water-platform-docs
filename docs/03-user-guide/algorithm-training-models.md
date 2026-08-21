---
id: user.algorithm-training-models
title: 算法训练与模型管理
document_type: user_guide
document_version: 1.3.0
status: published
locale: zh-CN
audience: [developer, algorithm_user]
related_modules: [M04]
related_operators: []
related_apis: ["/api/v1/algorithms/{algorithm_code}/training-runs", "/api/v1/training-runs", "/api/v1/model-versions"]
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 在算子中心的训练与模型页创建季节稳健基线异常检测任务并管理模型。
---

# 算法训练与模型管理

## 用途

使用历史数据训练可供工作流使用的私有模型。当前可训练的内置算法是季节稳健异常检测；Chronos-2 只支持预训练推理，不支持平台内训练。

## 前置条件与角色

需要算法训练权限和已经准备完成的数据版本。模型创建者可以管理自己的模型可见性；将模型设为活动算法的默认模型需要发布权限。

## 操作步骤

1. 打开【算子中心】，选择【季节稳健基线异常检测】，进入【训练与模型】。
2. 在训练卡片的数据选择器中选择资产版本、点位、指标和值来源；确认所选时间范围包含足够的日或周周期。
3. 设置【季节性】（自动判断、日周期或周周期）、【最少周期】和【MAD 下限】，点击【开始在线训练】。
4. 提交后，在训练卡片的【查看训练任务记录】或【任务中心】查看生成的任务记录及其状态；任务中心用于查看记录，不是单独的训练创建页面。
5. 训练完成后回到【训练与模型】的模型资产列表，确认模型为【就绪】。需要共享时使用模型卡片的公开性操作；需要用于发布或工作流时选择已就绪模型。

## 结果与失败处理

相同的幂等请求不会重复生成模型。训练取消、数据范围不足或参数错误时，任务记录会显示失败原因；修正数据或参数后重新发起训练。训练完成不等于算法已发布，模型仍需满足状态和可见性要求。
