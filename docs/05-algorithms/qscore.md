---
id: algorithm.qscore
title: 数据质量评分 Qscore 模型
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [algorithm_user, platform_user, developer]
related_modules: [M03, M04]
related_operators: [data_quality_profile_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 介绍管网时序数据五维质量打分模型、数学公式与量化权重配置。
---

# 数据质量评分 Qscore 模型

Qscore（Quality Score）是平台针对水务物联网时序数据设计的综合质量量化模型。它在不改变原始观测值的前提下，输出 0~100 分的标准化质量评分及五维雷达诊断向量。

---

## 1. 数学定义与评估维度

设时序数据序列为 $\{(t_i, v_i)\}_{i=1}^N$，Qscore 通过五个归一化维度指标加权计算：

$$
\text{Qscore} = 100     imes \sum_{k \in \mathcal{K}} w_k \cdot S_k, \quad \sum_{k} w_k = 1.0
$$

其中 $\mathcal{K} = \{\text{completeness}, \text{timeliness}, \text{uniqueness}, \text{validity}, \text{stability}\}$。

### (1) 完整性 ($S_{\text{completeness}}$)
衡量非空、有效有限数值所占比例：
$$
S_{\text{completeness}} = \frac{1}{N} \sum_{i=1}^N \mathbb{I}(v_i \in \mathbb{R})
$$

### (2) 时间一致性 ($S_{\text{timeliness}}$)
衡量相邻采样时间差 $\Delta t_i = t_i - t_{i-1}$ 与预期采样步长 $T_{\text{exp}}$（如 900s）的吻合程度：
$$
S_{\text{timeliness}} = \frac{1}{N-1} \sum_{i=2}^N \mathbb{I}(|\Delta t_i - T_{\text{exp}}| \le 0.2 \cdot T_{\text{exp}})
$$

### (3) 唯一性 ($S_{\text{uniqueness}}$)
衡量时间戳重复率：
$$
S_{\text{uniqueness}} = 1.0 - \frac{\text{重复时间戳行数}}{N}
$$

### (4) 物理有效性 ($S_{\text{validity}}$)
根据物理量上下界约束 $[V_{\min}, V_{\max}]$ 进行过滤：
$$
S_{\text{validity}} = \frac{1}{N} \sum_{i=1}^N \mathbb{I}(V_{\min} \le v_i \le V_{\max})
$$

### (5) 稳定性 ($S_{\text{stability}}$)
结合**数值冻结率 (Frozen Ratio)** 与**局部阶跃突变率 (Jump Ratio)**：
$$
S_{\text{stability}} = \max(0, 1.0 - r_{\text{frozen}} - r_{\text{jump}})
$$
其中阶跃突变通过一阶差分的中位数绝对偏差（MAD Robust Z-score）判定。

---

## 2. 默认权重配置与等级划分

| 维度 | 默认权重 $w_k$ | 质量等级与建议 |
| :--- | :---: | :--- |
| **完整性** | `0.35` | **A 级 (≥90 分)**：数据优质，可直接用于高精度算法预测与漏损评估； |
| **时间一致性** | `0.20` | **B 级 (75~89 分)**：数据基本可用，建议进行轻量线性插补或对齐； |
| **有效性** | `0.20` | **C 级 (&lt;75 分)**：存在严重缺失或野值，必须经过数据治理流程方可流向下游。 |
| **唯一性** | `0.15` | - |
| **稳定性** | `0.10` | - |
