---
id: algorithm.s01-minimum-night-flow
title: 最小夜间流量 (MNF) 分析
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [algorithm_user, operator]
related_modules: [M04, M06]
related_operators: [s01_minimum_night_flow_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 基于深夜 02:00~04:00 窗口的管网背景漏损与突发暗漏评估算法。
---

# 最小夜间流量分析 (`s01_minimum_night_flow_v1`)

在凌晨 02:00 ~ 04:00 用户合法用水量达到全天最低谷期间，提取流量极小值序列作为管网基础漏损的敏感观测指标。
