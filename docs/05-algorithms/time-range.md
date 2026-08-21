---
id: operator.time-range
title: 时间范围筛选算子
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, developer]
related_modules: [M04]
related_operators: [time_range_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 算子 time_range_v1 按绝对起止时间或相对滑动窗口截取时序子区间。
---

# 时间范围筛选算子 (`time_range_v1`)

按指定的 `start_time` 与 `end_time`（ISO 8601 格式）对输入时序进行精确定界裁剪。
