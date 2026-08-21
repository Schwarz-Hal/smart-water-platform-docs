---
id: api.data-assets
title: 数据源、CSV 导入、数据资产与质量 API
document_type: development
document_version: 1.1.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M02, M03]
related_operators: []
related_apis: ["/api/v1/data-sources", "/api/v1/data-sources/csv-uploads", "/api/v1/datasets", "/api/v1/data-quality-reports/{report_id}"]
owners: [backend-team]
reviewed_at: 2026-08-21
summary: 记录只读 MySQL、CSV 草稿、数据版本、质量报告和派生版本接口。
---

# 数据源、CSV 导入、数据资产与质量 API

## 用途与权限

用于只读数据源、CSV、资产版本和质量报告；权限分别使用 `data_source:*`、`ingestion:create`、`dataset:*`。

## 请求

JSON 接口使用 `application/json`；CSV 上传使用 multipart，不要手动设置边界。

## 响应

异步导入和评分返回 `task_id`；资产与报告返回 `data` 包络。

## 错误与重试

表头、映射和权限错误按 `422`/`404` 处理；队列或对象存储故障先查看任务，再按策略人工重运行。

## 1. 数据源和导入

`POST /api/v1/data-sources` 只接受 `source_type: "mysql"` 且 `is_read_only: true`；`GET /api/v1/data-sources` 返回摘要；`POST /api/v1/data-sources/{source_id}/test` 测试保存连接；`POST /api/v1/ingestions` 提交已有源的异步导入。

CSV 使用 `POST /api/v1/data-sources/csv-uploads` 的 multipart 字段 `source_name`、`csv_file`，响应包含 `batch_code`、表头、样例和映射建议。预览为 `GET /api/v1/csv-uploads/{batch_code}/preview`；提交映射为 `POST /api/v1/csv-uploads/{batch_code}/imports`，至少含 `point_column`、`time_column` 和一个 `metrics` 项。

## 2. 资产、版本和血缘

`GET /api/v1/datasets` 查询资产，`GET /api/v1/datasets/{dataset_id}/versions` 查询版本，`GET /api/v1/dataset-versions/{version_id}/channels` 查询真实通道，`GET /api/v1/dataset-versions/{version_id}/lineage` 查询血缘。导入版本从平台 MySQL 时序表读取；治理形成的派生版本物化为 MinIO Parquet，调用方不直接依赖存储后端。

## 3. 质量报告

重新评分：`POST /api/v1/dataset-versions/{version_id}/quality-profiles`；报告列表：`GET /api/v1/dataset-versions/{version_id}/quality-reports`；报告详情：`GET /api/v1/data-quality-reports/{report_id}`；内容：`GET /api/v1/data-quality-reports/{report_id}/content?format=json|html`。等级为 A（≥90）、B（80–89.999）、C（60–79.999）、D（`<60`）。
