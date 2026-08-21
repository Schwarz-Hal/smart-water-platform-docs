---
id: user.workflow-results
title: 节点结果、Artifact 和最终报告查看
document_type: user_guide
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, operator, developer]
related_modules: [M05, M06, M07]
related_operators: []
related_apis: ["/api/v1/workflows/runs/{id}"]
owners: [product-team]
reviewed_at: 2026-08-21
summary: 说明任务运行实例的实时状态追踪、节点日志诊断、图表可视化与结果报告导出方法。
---

# 节点结果、Artifact 和最终报告查看

任务运行详情页提供全链路、沉浸式的可视化结果呈现与排障追溯能力。

---

## 1. 任务实时状态与日志诊断

- **节点执行状态流转**：画布节点实时展示状态徽章：
  - ⏳ `PENDING`（排队等待）
  - 🔄 `RUNNING`（正在计算）
  - ✅ `SUCCESS`（计算完成）
  - ❌ `FAILED`（异常中断）
- **节点日志查看**：点击任一节点，展开【标准运行日志】抽屉，查阅该算子的输入数据行数、耗时、核心指标与诊断输出。

---

## 2. 可视化结果工件 (Artifacts)

平台根据算子产出的不同数据类型，自适应呈现专业的交互式可视化组件：
1. **时序预测曲线 (Forecast Charts)**：
   - 叠加热力展示历史真实时序、中位数预测值（P50）以及 80%/90% 预测置信区间（P10~P90）；
2. **DMA 漏损候选风险表 (Candidate Table)**：
   - 结构化表格按 `risk_score` 降序呈现异常风险时段、平均漏损量估算与各维度证据贡献度；
3. **数据治理前后对比图 (Governance Comparison)**：
   - 直观对比原始脏数据与插补清洗后时序的平滑度与连续性。

---

## 3. 报告导出与审计追溯

- **报告导出**：支持将综合分析结果一键导出为包含图表与指标摘要的 PDF/HTML 报告；
- **全链路溯源**：在页面底部随时可查阅本次运行所依赖的原始数据资产哈希、各节点算子确切版本与执行参数快照。
