---
id: api.workflows
title: 工作流编排、发布、运行与 Artifact API
document_type: development
document_version: 1.1.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M05, M06, M07]
related_operators: []
related_apis: ["/api/v1/workflows", "/api/v1/workflows/{workflow_id}/validate", "/api/v1/workflow-versions/{version_id}/runs"]
owners: [backend-team]
reviewed_at: 2026-08-21
summary: 工作流草稿、校验、不可变版本、运行和 Artifact 查询接口。
---

# 工作流编排、发布、运行与 Artifact API

## 用途与权限

提供工作流草稿、发布、运行和结果访问；校验/保存需要 `workflow:edit`，发布需要 `workflow:publish`，运行需要 `workflow:run`。

## 请求

草稿保存提交 `expected_revision`；运行绑定提交数据版本、点位、指标、值来源和时间范围。

## 响应

运行接口返回运行摘要；Artifact 接口返回预览或由 API 代理流式返回内容。

## 错误与重试

草稿冲突为 `409`；越权资源按 `404`；运行失败应查询任务和日志后再人工重运行。

## 1. 草稿和发布

`POST /api/v1/workflows` 创建 Graph；`PUT /api/v1/workflows/{workflow_id}/draft` 保存草稿并提交 `expected_revision`；`POST /api/v1/workflows/{workflow_id}/validate` 校验节点、端口、参数和最终输出；`POST /api/v1/workflows/{workflow_id}/publish` 发布不可变版本；`GET /api/v1/workflows/{workflow_id}/versions` 查询版本。

草稿冲突返回 `409 WORKFLOW_DRAFT_CONFLICT`。发布版本不能修改；可以从历史版本派生草稿。草稿 Graph 的节点实例 ID 是运行时输入绑定的键，不是算子编码。

## 2. 创建运行

```http
POST /api/v1/workflow-versions/{version_id}/runs
```

请求体的 `input_bindings` 按输入节点实例 ID 绑定 `dataset_version_id`、`monitor_point_id`、`metric_code`、`value_source`、`start`、`end`；可选 `parameter_overrides`。需要 `workflow:run`。创建后通过任务接口和运行接口查询，不把返回成功解释为执行成功。

## 3. 运行和 Artifact

| 方法与路径 | 说明 |
| --- | --- |
| `GET /api/v1/workflow-runs` | 分页查询运行 |
| `GET /api/v1/workflow-runs/{run_id}` | 运行和快照 |
| `GET /api/v1/workflow-runs/{run_id}/nodes` | 节点状态、耗时和摘要 |
| `GET /api/v1/workflow-runs/{run_id}/artifacts` | Artifact 摘要 |
| `GET /api/v1/workflow-runs/{run_id}/result` | Graph 声明的最终输出 |
| `GET /api/v1/workflow-artifacts/{artifact_id}` | Artifact 元数据和预览 |
| `GET /api/v1/workflow-artifacts/{artifact_id}/content` | 由 API 流式返回完整内容 |
| `POST /api/v1/workflow-runs/{run_id}/cancel` | 协作式取消 |

API 不返回 MinIO 地址、对象键或凭据；未知 Artifact 类型应回退为安全 JSON/下载视图。
