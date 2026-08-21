---
id: api.data-assets
title: 数据源、CSV 导入、数据资产与质量 API
document_type: development
document_version: 1.0.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M02, M03]
related_operators: []
related_apis: ["/api/v1/datasets/upload", "/api/v1/datasets/import", "/api/v1/datasets", "/api/v1/datasets/{id}", "/api/v1/datasets/{id}/quality"]
owners: [backend-team]
reviewed_at: 2026-08-21
summary: 数据源接入、文件上传预检、异步导入、资产元数据及 Qscore 质量报告查询 RESTful API 规范。
---

# 数据源、CSV 导入、数据资产与质量 API

---

## 1. CSV 文件上传预检

- **接口**：`POST /api/v1/datasets/upload`
- **请求头**：`Content-Type: multipart/form-data`, `Authorization: Bearer <TOKEN>`
- **响应示例**：

```json
{
  "code": "SUCCESS",
  "data": {
    "upload_id": "upl_98a72b",
    "filename": "dma_sensors_202608.csv",
    "total_rows_estimate": 2880,
    "columns": ["timestamp", "inflow", "pressure", "night_flow"],
    "preview_rows": [
      {"timestamp": "2026-08-01 00:00:00", "inflow": "125.4", "pressure": "0.38"}
    ]
  },
  "trace_id": "tr_190a2c"
}
```

---

## 2. 提交异步导入与通道映射

- **接口**：`POST /api/v1/datasets/import`
- **请求体 (JSON)**：

```json
{
  "upload_id": "upl_98a72b",
  "asset_name": "城东DMA-202608监测数据",
  "time_column": "timestamp",
  "time_format": "%Y-%m-%d %H:%M:%S",
  "channel_mappings": {
    "inflow": {"column": "inflow", "unit": "m3/h"},
    "pressure": {"column": "pressure", "unit": "MPa"}
  }
}
```

- **响应**：返回 `task_id`，后台 Celery 队列异步解析并触发 Qscore 评估。

---

## 3. 查询数据资产详情与质量报告

- **接口**：`GET /api/v1/datasets/{dataset_id}`
- **质量接口**：`GET /api/v1/datasets/{dataset_id}/quality`
- **响应示例**：

```json
{
  "code": "SUCCESS",
  "data": {
    "dataset_id": "ds_48710f",
    "version": "v1",
    "qscore": 92.4,
    "grade": "A",
    "radar": {
      "completeness": 0.98,
      "timeliness": 0.95,
      "uniqueness": 1.00,
      "validity": 0.96,
      "stability": 0.91
    }
  }
}
```
