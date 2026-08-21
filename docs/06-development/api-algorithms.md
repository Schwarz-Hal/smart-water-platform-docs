---
id: api.algorithms
title: 算子目录、模型训练、参数调整与发布 API
document_type: development
document_version: 1.0.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M04]
related_operators: []
related_apis: ["/api/v1/operators", "/api/v1/operators/{code}/versions/{version}", "/api/v1/operators/{code}/versions/{version}/default-parameters"]
owners: [backend-team]
reviewed_at: 2026-08-21
summary: 算子规格查询、契约验证、管理员在线修改默认参数及模型训练管理 API 规范。
---

# 算子目录、模型训练、参数调整与发布 API

---

## 1. 检索算子目录与规格

- **接口**：`GET /api/v1/operators`
- **查询参数**：`category` (可选), `keyword` (可选)
- **响应示例**：

```json
{
  "code": "SUCCESS",
  "data": [
    {
      "operator_code": "chronos2_flow_forecast",
      "name": "Chronos-2 流量预测",
      "category": "forecast",
      "latest_version": "1.1.0",
      "versions": ["1.0.0", "1.1.0"]
    }
  ]
}
```

---

## 2. 查询算子版本完整契约 (Contract)

- **接口**：`GET /api/v1/operators/{operator_code}/versions/{version}`
- **响应内容**：返回 `input_ports`、`output_ports`、`parameter_schema` 及当前的 `default_parameters`。

---

## 3. 管理员在线更新默认参数

- **接口**：`PATCH /api/v1/operators/{operator_code}/versions/{version}/default-parameters`
- **鉴权要求**：`admin` 角色 Bearer Token
- **请求体**：

```json
{
  "default_parameters": {
    "prediction_length": 96,
    "num_samples": 20,
    "temperature": 0.7
  }
}
```
