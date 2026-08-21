---
id: development.operator-sdk
title: 内置算子契约与 Operator SDK 开发指南
document_type: development
document_version: 1.1.0
status: published
locale: zh-CN
audience: [developer, algorithm_user]
related_modules: [M04]
related_operators: []
related_apis: ["/api/v1/operators"]
owners: [backend-team]
reviewed_at: 2026-08-21
summary: 说明内置算子需要提供的身份、端口、参数和执行契约。
---

# 内置算子契约与 Operator SDK 开发指南

## 用途与权限

用于开发可登记、可校验的内置算子；发布和启用由算子治理权限控制。

## 请求

算子通过可序列化契约声明身份、端口、参数和执行引用。

## 响应

API 返回算子版本、Schema 和可视化契约供前端使用。

## 错误与重试

契约错误需修改代码和测试后重新发布，不应自动重试错误输入。

内置算子以可序列化 `OperatorSpec` 为契约来源。稳定编码、语义版本、类别、成熟度、运行时、输入输出端口、参数 Schema 和可视化类型必须能被 API 返回；前端根据 Schema 生成控件，不在页面重新计算结果。

## 1. 契约要求

- 端口声明键、方向、`data_type`、`semantic_type`、单位、基数和是否必需。
- 参数使用 Pydantic 模型生成 JSON Schema，并在执行前校验类型和范围。
- 执行引用使用 `builtin_handler`、`operator_runtime` 或受控的 `algorithm_version`。
- 路径绑定只允许字段名或字典键路径，禁止 `eval`、任意导入和脚本执行。

## 2. 验证边界

工作流发布时校验节点/版本、端口类型和单位、单输入基数、必需连接、参数范围、无环以及至少一个最终输出。稳定错误包括 `OPERATOR_INPUT_MISSING`、`OPERATOR_INPUT_TYPE`、`OPERATOR_PARAMETER_INVALID`、`OPERATOR_OUTPUT_INVALID` 和 `OPERATOR_EXECUTION_FAILED`。新增算子需配套单元测试和契约样例。
