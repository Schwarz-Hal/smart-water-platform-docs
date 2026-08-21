---
id: algorithm.hampel
title: Hampel 滑动窗口异常检测
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M04]
related_operators: [outlier_repair_dataset_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明基于中位数与绝对中位差（MAD）的 Hampel 强鲁棒局部异常滤波算法。
---

# Hampel 滑动窗口异常检测

Hampel 滤波器是一种基于**局部中位数 (Median)** 与**中位数绝对偏差 (MAD，Median Absolute Deviation)** 的稳健异常值检测算法。相比传统的 3-Sigma 准则，它对极端野值和突发毛刺具有极高的容忍度。

---

## 1. 算法原理

对于时序序列中的每个点 $v_t$，取以其为中心、半宽为 $K$（窗口大小 $W = 2K + 1$）的局部滑动窗口：

1. 计算窗口内的局部中位数：
   $$
   m_t = \operatorname{median}(v_{t-K}, \dots, v_{t}, \dots, v_{t+K})
   $$
2. 计算局部绝对中位差 (MAD)：
   $$
   \operatorname{MAD}_t = \operatorname{median}(|v_{t-K} - m_t|, \dots, |v_{t+K} - m_t|)
   $$
3. 计算稳健尺度估计量 $\sigma_t = 1.4826     imes \operatorname{MAD}_t$，并求取离群得分：
   $$
   \text{Score}_t = \frac{|v_t - m_t|}{\max(\sigma_t, 10^{-12})}
   $$
4. 若 $\text{Score}_t \ge \text{threshold}$（默认 4.5），则标记该点为局部异常离群点。

---

## 2. 核心参数

| 参数名 | 类型 | 默认值 | 说明 |
| :--- | :--- | :---: | :--- |
| `window` | 整数 | `9` | 滑动窗口大小（采样点数），建议取奇数 |
| `threshold` | 浮点数 | `4.5` | 异常偏离倍数阈值，数值越小越敏感 |
