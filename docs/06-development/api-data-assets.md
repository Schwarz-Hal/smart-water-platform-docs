---
id: api.data-assets
title: 数据源、CSV 导入、数据资产与质量 API
document_type: development
document_version: 1.2.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M02, M03]
related_operators: []
related_apis: ["/api/v1/data-sources", "/api/v1/data-sources/csv-uploads", "/api/v1/datasets", "/api/v1/data-quality-reports/{report_id}"]
owners: [backend-team]
reviewed_at: 2026-09-07
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

以下接口针对旧数据资产；数据文件治理接口见下一节。

重新评分：`POST /api/v1/dataset-versions/{version_id}/quality-profiles`；报告列表：`GET /api/v1/dataset-versions/{version_id}/quality-reports`；报告详情：`GET /api/v1/data-quality-reports/{report_id}`；内容：`GET /api/v1/data-quality-reports/{report_id}/content?format=json|html`。等级为 A（≥90）、B（80–89.999）、C（60–79.999）、D（`<60`）。

## 4. 数据中心治理查询和模板

数据文件治理读取需要 `data_file:read`，创建运行及维护个人模板需要 `data_file:write`。共享模板的创建、修订和归档还要求管理员身份。资源范围仍由后端检查。

| 接口 | 用途 |
| --- | --- |
| `GET /api/v1/data-governance/runs` | 跨文件分页摘要；筛选参数含 `query`、`status`、`category`、`collection_id`、`file_id`、`file_role=source|result|either`、`source_version_id`、`created_by`、`from`、`to`、逗号分隔的 `run_ids` |
| `GET /api/v1/data-governance/quality-overview` | 当前版本自动画像质量；支持 `query`、`collection_id`、`grade`、`evaluation=all|evaluated|unevaluated|issues` 与分页 |
| `POST /api/v1/data-governance/version-summaries` | 请求 `version_ids`，批量读取可见版本的治理摘要 |
| `GET/POST /api/v1/data-governance/templates` | 查询可见模板或创建个人/共享模板 |
| `GET /api/v1/data-governance/templates/{id}` | 模板详情；可指定 `revision` |
| `POST /api/v1/data-governance/templates/{id}/revisions` | 新增不可变修订 |
| `POST /api/v1/data-governance/templates/{id}/archive` | 归档模板，不删除历史运行 |

模板创建包含 `name`、`description`、`visibility=private|shared`、`modality`、`steps` 和 `binding_requirements`。每个步骤使用精确 `operator_code`、`operator_version` 和 `parameters`；绑定要求记录步骤位置、参数名、单列/多列类型及来源列的类型要求。模板不是上传可执行代码的入口。

创建治理运行保留现有 `request_id`、`source_version_id`、`steps`、`destination`，可选传入 `template_ref`（`template_id`、`revision`）记录配置来源。实际运行仍冻结提交时的参数，不随模板后续修订变化。

运行详情与任务状态按修订号更新；不要让迟到的查询覆盖较新的终态。预览 `max_rows` 范围为1–50，字段选择应读取Schema而非等待预览成功。网络或日志读取失败不能被客户端转换为算法失败。

质量汇总的 `coverage` 为0–1，未评估时 `average_score` 为null。`issues` 筛选依据最新自动画像报告的实际 findings，`issue_count` 为发现条数，不以分数低于某个阈值代替问题证据。日期筛选`from/to`归一为UTC并包含两端，按整天筛选时客户端应传入当天开始和结束时刻。
