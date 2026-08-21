---
id: scenario.anomaly-detection
title: 时序异常检测、模型训练与候选核验
document_type: scenario
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, operator, developer]
related_modules: [M04, M05]
related_operators: [seasonal_robust_anomaly, hampel]
related_apis: [/api/v1/workflows]
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 介绍管网多维异常检测全链路，涵盖瞬时野值毛刺、持续阶跃突变与私有模型训练。
---

# 时序异常检测、模型训练与候选核验场景

---

## 1. 异常分类与应对策略

| 异常类型 | 物理成因 | 检测算子 | 处置策略 |
| :--- | :--- | :--- | :--- |
| **单点野值脉冲** | 传感器电磁干扰或通信毛刺 | `Hampel 滤波器` | 判定为瞬时噪声，自动插值平滑 |
| **持续阶跃上升** | 管网突发爆管或暗漏加剧 | `季节稳健基线 + EWMA/CUSUM` | 提取为高风险漏损事件，派发工单 |
| **周期性形状畸变** | 工商户违规用水或阀门状态异常 | `私有基线比对` | 标记可疑时间段并人工核验 |
