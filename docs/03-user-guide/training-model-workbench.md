---
id: user.training-model-workbench
title: 训练与模型工作台
document_type: user_guide
document_version: 0.2.0
status: published
locale: zh-CN
audience: [algorithm_user, operator]
related_modules: [M04, M05, M07]
related_operators: [water_adaptive_anomaly]
related_apis: ["/api/v1/operators/{code}/versions/{version}/training-workspace", "/api/v1/operators/{code}/versions/{version}/models", "/api/v1/training-runs", "/api/v1/model-versions/{model_id}/workbench"]
owners: [product-team, algorithm-team]
reviewed_at: 2026-11-02
summary: 创建训练、查看模型并将可用模型用于工作流。
---

# 训练与模型工作台

## 用途

为支持训练的算法准备模型，查看训练记录和模型信息，并将可用模型用于分析流程。

## 前置条件与角色

在【算法中心】选择算法及版本，打开【训练与模型】，点击【打开训练与模型】。新建训练和导入模型需要相应权限。

## 操作步骤

1. 在【模型库】查看已有模型，按名称搜索，并打开详情核对来源、状态和适用版本。
2. 需要新模型时点击【新建训练】，按【选择数据】【配置训练】【确认提交】【训练与结果】依次操作。
3. 选择训练资料并核对读取设置，填写训练名称和参数，再确认提交。
4. 在【训练记录】查看当前阶段、进度和结果；打开记录可继续查看训练信息。
5. 模型准备完成后，在模型库点击【用于工作流】，进入流程并核对对应节点的模型设置。
6. 已有模型包时，点击【导入模型包】，选择文件并按页面要求补全信息，待检查完成后使用。

## 结果与失败处理

未显示新建训练入口，或入口不可用时，检查所选算法版本是否支持训练。训练失败时先查看记录提示，核对数据与参数后重新提交。

新训练产生独立模型记录。更换模型后，应重新确认分析流程，再执行新的运行。已完成的分析保留原来使用的模型。
