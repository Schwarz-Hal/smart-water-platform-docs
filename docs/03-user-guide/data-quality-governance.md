---
id: user.data-quality-governance
title: 质量报告、治理方案与模拟扩展
document_type: user_guide
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, operator, developer]
related_modules: [M03]
related_operators: [data_quality_profile_v1, qscore_v1, synthetic_extend_dataset_v1]
related_apis: ["/api/v1/datasets/{id}/quality"]
owners: [product-team]
reviewed_at: 2026-08-21
summary: 说明五维数据质量评估雷达模型、Qscore 评分标准、治理策略配置与时序模拟扩展功能。
---

# 质量报告、治理方案与模拟扩展

低质量的管网时序数据会导致漏损评估假阳性或时序预测失真。平台内置了五维数据质量评估体系与一键治理模拟能力。

---

## 1. 五维数据质量评估体系 (Qscore)

平台对每一份导入的数据资产从五个核心维度进行量化诊断（总分 0~100 分）：

| 质量维度 | 评估要点 | 典型问题示例 |
| :--- | :--- | :--- |
| **完整性 (Completeness)** | 采样点覆盖率、连续缺失与离散缺失比例 | 传感器断电或通信中断造成的长时间无数据 |
| **时间一致性 (Consistency)** | 采样步长是否恒定、是否存在时钟回退或乱序 | 本应 15 分钟上报一次的数据出现 3 分钟、28 分钟波动 |
| **唯一性 (Uniqueness)** | 同一时间戳下是否存在重复记录 | 通信重发导致同一时间点存在多条冲突数据 |
| **有效性 (Validity)** | 数值是否在物理合理区间（如流量非负、压力范围） | 传感器超量程出现负数或极大野值 |
| **稳定性 (Stability)** | 异常突变率、方差分布与阶跃毛刺 | 瞬时强干扰导致的单点毛刺跳变 |

---

## 2. 质量雷达与诊断报告

在数据资产详情页切换至【质量评估】选项卡：
- **质量雷达图**：直观对比五维得分与综合 Qscore 等级（优秀 A > 90，良好 B > 75，需治理 C &lt; 75）；
- **问题诊断明细**：表格精准列出异常时间区间、异常类型与受影响的通道；
- **一键推荐治理方案**：系统基于诊断结果推荐治理算子组合（如 `时钟对齐` + `Hampel 去噪` + `线性插补`）。

---

## 3. 时序模拟扩展 (Synthetic Extension)

针对历史样本不足（如新建管网只有 3 天数据）的场景，可使用【模拟扩展】功能：
- 提取现有数据的日周期与周周期特性；
- 叠加高斯噪声与趋势漂移，生成长周期的逼真时序数据，用于验证算法长程鲁棒性。
