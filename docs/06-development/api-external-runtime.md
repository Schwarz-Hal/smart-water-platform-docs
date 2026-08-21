---
id: api.external-runtime
title: 外部算法包与 Runtime Profile API
document_type: development
document_version: 1.1.0
status: published
locale: zh-CN
audience: [developer]
related_modules: [M04]
related_operators: []
related_apis: ["/api/v1/runtime-profiles", "/api/v1/algorithm-packages", "/api/v1/algorithm-environments/{environment_id}"]
owners: [backend-team]
reviewed_at: 2026-08-21
summary: 外部 ZIP 静态检查、不可变环境制备、契约试运行和审核接口。
---

# 外部算法包与 Runtime Profile API

## 用途与权限

提供外部 ZIP 的静态接入和受控运行环境制备；上传需要 `algorithm:publish`，批准需要 `algorithm:approve`。

## 请求

上传和模型绑定使用 multipart；草稿和审核决定使用 JSON。

## 响应

返回版本、环境和任务摘要，不返回内部路径、凭据或对象存储地址。

## 错误与重试

锁依赖、环境、契约和试运行错误须修正后重新处理；主进程不执行上传代码。

## 1. 稳定接口

| 方法与路径 | 权限 | 说明 |
| --- | --- | --- |
| `GET /api/v1/runtime-profiles` | `algorithm:publish` | 查询批准的运行时配置 |
| `GET /api/v1/runtime-workers` | `algorithm:read` | 查询 GPU Worker 摘要，不返回凭据 |
| `POST /api/v1/algorithm-packages` | `algorithm:publish` | multipart 上传身份、版本、Profile 和 ZIP |
| `GET /api/v1/algorithm-packages/versions/{version_id}` | `algorithm:publish` | 查询版本接入状态 |
| `POST /api/v1/algorithm-packages/versions/{version_id}/provision` | `algorithm:publish` | 异步制备不可变环境 |
| `GET /api/v1/algorithm-environments/{environment_id}` | `algorithm:publish` | 查询环境摘要 |

上传字段为 `algorithm_code`、`algorithm_name`、`version`、`runtime_profile_code`、可选 `description` 和 `package_file`。ZIP 必须包含 `manifest.yaml`、`src/`、`schemas/` 及 `pylock.toml` 或完全锁定的 `requirements.lock`。

## 2. 契约和审核

契约草稿使用 `PUT /api/v1/algorithm-operator-drafts/{draft_id}`，校验使用 `/validate`，标准输入试运行使用 `/smoke-tests`。模型槽位用 `POST /api/v1/algorithm-packages/versions/{version_id}/models` 绑定；`/submit`、`/approve`、`/reject`、`/retire` 完成审核生命周期。批准前必须静态检查通过、环境为 `ready`、草稿校验通过、模型槽位齐全且至少一次试运行成功。

主进程不会导入上传代码。外部版本仍是兼容保留入口，未制备或未批准时不得作为默认运行入口。
