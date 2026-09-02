---
id: api.algorithms
title: 算子目录、模型训练、参数调整与发布 API
document_type: development
document_version: 1.2.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M04]
related_operators: []
related_apis: ["/api/v1/operators", "/api/v1/operators/{operator_code}/versions/{version}", "/api/v1/algorithms/{algorithm_code}/training-runs"]
owners: [backend-team]
reviewed_at: 2026-08-21
summary: 记录算子精确版本解析、默认参数、训练模型和算法发布生命周期接口。
---

# 算子目录、模型训练、参数调整与发布 API

## 用途与权限

用于算子、训练模型和发布版本的生命周期管理；权限按接口表中的代码校验。

## 请求

使用 JSON 请求；上传模型或算法包的接口另有 multipart 要求。

## 响应

成功响应使用 `{code, message, data, trace_id}` 包络。

## 错误与重试

客户端按 HTTP 状态和错误码处理；参数、权限和业务校验错误不自动重试。

除登录和健康检查外，接口使用 `Authorization: Bearer <access_token>`。成功响应读取 `data` 并保留 `trace_id`；错误需兼容 `detail` 和统一错误包络。

## 1. 算子目录与默认参数

| 方法与路径 | 权限 | 用途 |
| --- | --- | --- |
| `GET /api/v1/operators` | `operator:read` | 分页查询可见算子；支持 `kind`、`status`、`runtime_type`、`executor_type`、`maturity`、`query` 等筛选；返回默认版本及版本可用性 |
| `GET /api/v1/operators/{operator_code}` | `operator:read` | 查询端口、参数、可视化契约和版本历史 |
| `GET /api/v1/operators/{operator_code}/versions/{version}` | `operator:read` | 查询不可变算子版本 |
| `POST /api/v1/operators/resolve-versions` | `workflow:read` 或管理员 | 批量解析工作流引用的精确版本；请求 `{ "versions": [{"code":"...", "version":"..."}] }`，返回可解析 `items` 与缺失引用 |
| `PATCH /api/v1/operators/{operator_code}/versions/{version}/default-parameters` | `operator:manage` | 修改默认参数并执行契约校验 |
| `PUT /api/v1/operators/{operator_code}/versions/{version}/default-release` | `operator:manage` | 为该算子版本绑定或清除默认审核发布包 |
| `PATCH /api/v1/operators/{operator_code}/versions/{version}/lifecycle` | `operator:manage` | 设置 `current`、`deprecated` 或 `blocked` 生命周期 |

目录响应包含 `default_version`、`installed`、`lifecycle`、`runtime_ready`、`runnable_with_defaults`、`unavailable_reasons`、`default_parameters`、`default_release_id` 和 `default_model_version_id` 等字段；`active_version` 仅是兼容别名。默认参数请求只提交契约允许的字段。已发布工作流的参数快照不会因默认值变化而改变。

## 2. 训练与模型

当前可训练入口为 `POST /api/v1/algorithms/{algorithm_code}/training-runs`，需要 `algorithm:train`。请求可显式提供 `algorithm_version`；省略时解析最高默认版本并在任务快照中保存精确版本。训练请求包含数据版本、指标、点位、值来源和训练参数；用 `GET /api/v1/training-runs/{training_run_id}` 查询。模型通过 `GET /api/v1/model-versions` 和 `/model-versions/{model_version_id}` 查询，发布者可用 `POST /api/v1/algorithms/{algorithm_code}/default-model` 绑定就绪模型。

## 3. 发布生命周期

创建草稿：`POST /api/v1/algorithms/{algorithm_code}/releases`；修改、验证、提交和审核分别使用 `/algorithm-releases/{release_id}` 下的 `PATCH`、`/validate`、`/submit` 和 `/approve`。版本以 `current`、`deprecated`、`blocked` 表示生命周期；deprecated 仍可显式/历史使用，blocked 不可运行。旧的 `/activate`、`/retire`、`/rollback` 兼容路径返回 HTTP 410 `VERSION_ACTIVATION_REMOVED`，并指向版本级生命周期接口。审核权限为 `algorithm:approve`，创建者/提交者不能自审。

算法直跑 `POST /api/v1/algorithms/runs` 可显式提供 `algorithm_version` 和 `model_version_id`；省略算法版本时使用最高默认版本，任务创建后不再动态跟随默认值。
