---
id: api.workflows
title: 工作流编排、发布、运行与 Artifact API
document_type: development
document_version: 1.0.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M05, M06, M07]
related_operators: []
related_apis: ["/api/v1/workflows", "/api/v1/workflows/{id}/validate", "/api/v1/workflows/{id}/publish", "/api/v1/workflows/{id}/runs", "/api/v1/workflows/runs/{run_id}"]
owners: [backend-team]
reviewed_at: 2026-08-21
summary: 工作流 CRUD、DAG 拓扑校验、版本发布、异步执行调度与 Artifact 获取 API。
---

# 工作流编排、发布、运行与 Artifact API

---

## 1. 校验工作流拓扑结构 (DAG Validation)

- **接口**：`POST /api/v1/workflows/{workflow_id}/validate`
- **响应**：

```json
{
  "code": "SUCCESS",
  "data": {
    "valid": true,
    "cycle_detected": false,
    "errors": []
  }
}
```

---

## 2. 发布工作流版本

- **接口**：`POST /api/v1/workflows/{workflow_id}/publish`
- **请求体**：`{"version": "1.0.0", "description": "DMA 漏损分析基线版本"}`
- **机制**：发布后冻结当前拓扑节点、连线与参数快照，生成只读发布 ID。

---

## 3. 触发工作流执行与获取结果

- **触发运行**：`POST /api/v1/workflows/{workflow_id}/runs`
  - **请求体**：`{"release_id": "rel_098a", "dataset_bindings": {"node_1": "ds_48710f:v1"}}`
  - **响应**：返回 `run_id` 与 `trace_id`。
- **查询运行状态与结果**：`GET /api/v1/workflows/runs/{run_id}`
- **获取节点 Artifact**：`GET /api/v1/workflows/runs/{run_id}/artifacts/{artifact_id}`
