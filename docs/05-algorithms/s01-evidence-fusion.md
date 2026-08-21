---
id: algorithm.s01-evidence-fusion
title: 漏损证据多源融合算子
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M04, M06]
related_operators: [s01_evidence_fusion_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 S01 归一化证据的加权、质量门槛和 DMA 候选输出。
---

# 漏损证据多源融合算子 (`s01_evidence_fusion_v1`)

## 用途与适用范围

融合归一化的夜间流量、水量平衡、季节残差和持续变化证据，输出风险时序与连续候选片段。候选是 DMA 级筛查结果，必须现场核验。

## 输入与输出

输入表必须有 `time`、`quality_score`、`night_flow_score`、`balance_score`、`residual_score`、`persistence_score`，每个分数都在 `[0,1]`。输出 `risk_score` 时序、整数 `labels` 和 `candidates`；候选含起止时间、最大/平均风险、点数和证据名称。

## 原理与关键公式

四类非质量证据按权重线性组合：

$$
r_t=0.30n_t+0.30b_t+0.25d_t+0.15p_t
$$

实际代码允许通过 `weights` 覆盖四项权重，但总和必须为 1。质量分会进一步调制风险：

$$
R_t=r_t\times q_t
$$

仅当 $q_t\ge0.6$ 且 $R_t\ge0.65$ 时标记候选点；连续点数至少为 `4` 才形成候选。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `weights` | `0.30/0.30/0.25/0.15` | 顺序为夜间、平衡、残差、持续变化，必须覆盖四项且和为 1。 |
| `quality_floor` | `0.6` | 质量分最低门槛。 |
| `candidate_threshold` | `0.65` | 调制后风险阈值。 |
| `min_consecutive_points` | `4` | 候选最少连续点数。 |

## 结果解释与限制

`risk_score` 范围为 `[0,1]`，不是百分制概率。融合只对输入证据做数学组合，不校准权重、不定位管段、不确认物理漏损，也不自动派发告警或工单。

## 参考资料

本算子为平台确定性证据融合规则，无单独外部论文基准。
