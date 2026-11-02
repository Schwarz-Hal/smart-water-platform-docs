---
id: user.operator-center
title: 算法中心
document_type: user_guide
document_version: 1.3.1
status: published
locale: zh-CN
audience: [platform_user, developer, admin]
related_modules: [M04]
related_operators: []
related_apis: ["/api/v1/operators", "/api/v1/operator-facets", "/api/v1/operators/{operator_code}/versions/{version}/default-parameters"]
owners: [product-team]
reviewed_at: 2026-11-02
summary: 搜索算法与算子，查看输入输出、参数及版本并用于流程。
---

# 算法中心

## 用途

查找算法与算子，了解输入要求、可调整参数、输出内容和版本，为流程选择合适的处理节点。

## 前置条件与角色

![算法目录和说明页签](../../static/assets/user-manual/operators.png)

从左侧【算法中心】进入。目录中显示当前账户可访问的内容；训练、参数管理等操作按权限开放。

## 操作步骤

1. 输入名称或关键词搜索，按分类筛选数据输入、转换、算法或输出等节点。需要进一步缩小范围时打开【详细筛选】。
2. 在列表中选中一项，先阅读【简介】，了解用途和适用数据。
3. 打开【契约与参数】，检查输入输出和参数要求，确认能够与本次流程的数据连接。
4. 需要训练或已有模型时，打开【训练与模型】；支持的版本可进入训练与模型工作台。
5. 在【版本与评估】中查看可访问版本及其状态。确定使用后，在项目的节点目录中添加对应节点。
6. 如需建立新流程，可点击【新建流程】，在画布中继续组织数据输入、处理和结果输出。

## 结果与失败处理

未找到内容时，清空部分筛选并刷新目录。版本不可用或环境尚未准备完成时，先查看提示，再联系管理员处理。

修改默认参数前应确认操作范围；项目中已经填写的参数仍需在节点属性中核对。具体模型操作参见[训练与模型工作台](training-model-workbench.md)。
