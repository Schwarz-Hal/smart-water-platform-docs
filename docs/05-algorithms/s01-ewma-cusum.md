---
id: algorithm.s01-ewma-cusum
title: EWMA / CUSUM 持续变化检测
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M04, M06]
related_operators: [s01_ewma_cusum_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 利用指数加权移动平均与累积和算法检测管网流量的持续阶跃异常。
---

# EWMA / CUSUM 持续变化检测 (`s01_ewma_cusum_v1`)

结合 EWMA 平滑滤波与 CUSUM 累积和检验，精准捕捉管网突发爆管或缓慢恶化的持续微小阶跃。
