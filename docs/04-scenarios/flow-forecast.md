---
id: scenario.flow-forecast
title: 15 分钟管网流量预测场景与结果解释
document_type: scenario
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, operator, developer]
related_modules: [M04, M05]
related_operators: [chronos2_flow_forecast, seasonal_naive]
related_apis: [/api/v1/workflows]
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 介绍基于 15 分钟高频时序的未来 24 小时供水量预测场景编排、置信区间评估与泵站调度联动。
---

# 15 分钟管网流量预测场景与结果解释

高精度的未来流量预测是水厂精准加压、节能降耗与泵房优化调度的核心基础。

---

## 1. 业务流程拓扑

```mermaid
flowchart LR
    A[历史管网 15min 流量资产] --> B[时钟规整与对齐]
    B --> C[Hampel 滤波去噪]
    C --> D[Chronos-2 零样本大模型推理]
    D --> E[生成未来 96 步预测曲线 & P10~P90 区间]
```

---

## 2. 预测结果解读

- **点预测 (P50 期望曲线)**：代表最可能的真实用水走势，用于指导次日各时段总供水调度计划；
- **不确定性区间 (P10 与 P90 上下界)**：反映早高峰、晚高峰与极端天气下的用水波动范围，若实测流量向上击穿 P90，可即时触发突发用水或暗漏预警。
