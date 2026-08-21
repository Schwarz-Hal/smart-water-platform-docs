---
id: algorithm.seasonal-robust-anomaly
title: 季节稳健基线异常检测
document_type: algorithm
document_version: 1.0.0
status: published
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M04]
related_operators: []
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明利用日/周强周期分解与鲁棒残差估计识别管网缓慢漂移与持续异常的算法原理。
---

# 季节稳健基线异常检测

城市供水管网流量与压力具有显著的**24 小时日周期 (Daily Profile)** 和**7 天周周期 (Weekly Profile)**。季节稳健基线算法通过周期模式分解提取正常用水基线，并利用残差序列识别非典型异常。

---

## 1. 算法链路

1. **周期性基线估计**：
   - 提取历史同周期（如前 $M$ 天同一时刻）的时序中位数构成期望基线 $\hat{y}_t$；
2. **残差计算与去噪**：
   - 计算实测值与基线的偏差残差 $e_t = y_t - \hat{y}_t$；
3. **稳健 Z 分数判定**：
   - 采用分位数尺度估计残差方差，计算残差偏离度；
4. **持续性判定**：
   - 区分单点瞬时突变与持续性阶跃（如爆管引起的持续流量升高）。
