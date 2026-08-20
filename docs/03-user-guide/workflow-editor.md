---
id: user.workflow-editor
title: 工作流编辑、发布、运行和结果查看
document_type: user_guide
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user]
related_modules: [M05, M07]
related_operators: []
related_apis: []
owners: [product-team]
reviewed_at: 2026-08-20
summary: 说明如何通过可视化工作区组装、发布、运行和查看分析流程。
---

# 工作流编辑、发布、运行和结果查看

## 用途

工作流将数据输入、数据处理、分析算子和结果输出连接为一个可复现的流程。草稿可以继续编辑；发布版本不可修改，运行时会冻结所使用的节点版本与参数。

## 编辑流程

1. 从算子目录拖入节点，或点击节点添加到画布。
2. 从输出端口拖线连接到兼容的输入端口。
3. 选择节点，在属性面板中填写参数；数据节点在运行配置中选择数据资产和通道。
4. 使用“保存草稿”保存当前节点、连接、位置和参数。
5. 点击“校验图”，修复缺少输入、错误参数或未声明输出等问题。
6. 发布后选择“运行已发布版本”。

## 查看结果

运行页面展示每个节点的状态、日志、输入摘要和输出 artifact。时序、表格、指标、候选列表和报告会使用相应的可视化方式呈现；原始 JSON 仅作为诊断数据按需展开。
