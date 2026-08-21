---
id: acceptance.cpu-algorithms
title: 内置 CPU 算法与结果契约验收
document_type: acceptance
document_version: 1.0.0
status: published
locale: zh-CN
audience: [project_stakeholder, developer]
related_modules: [M04]
related_operators: [qscore_v1, hampel, align_timeseries_v1]
related_apis: []
owners: [quality-team]
reviewed_at: 2026-08-21
summary: 验证 Qscore、Hampel、时序对齐、去重与插值等全部内置 CPU 算子的计算契约与精度。
---

# 内置 CPU 算法与结果契约验收

---

## 1. 验收测试用例

- [x] **Qscore 打分**：标准测试数据集得分与五维分量计算无偏差；
- [x] **Hampel 滤波**：合成 10 个极端野值点，检出率 100% 且正常波动无误杀；
- [x] **时钟对齐**：输入非规整 3~18 分钟采样，对齐输出规整 15 分钟时钟网格。
