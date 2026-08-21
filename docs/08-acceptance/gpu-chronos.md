---
id: acceptance.gpu-chronos
title: GPU Worker 与 Chronos-2 预测验收
document_type: acceptance
document_version: 1.0.0
status: published
locale: zh-CN
audience: [project_stakeholder, operator, developer]
related_modules: [M04, M07]
related_operators: [chronos2_flow_forecast]
related_apis: ["/api/v1/workflows"]
owners: [quality-team]
reviewed_at: 2026-08-21
summary: 验证 GPU Worker 任务路由、Chronos-2 零样本前向推理、分位数置信区间输出与毫秒级时延。
---

# GPU Worker 与 Chronos-2 预测验收

---

## 1. 验收测试步骤

1. **环境探针检查**：确认 GPU Worker 已正确分配 `gpu_inference` 队列，显卡驱动与 PyTorch CUDA 正常识别；
2. **编排 Chronos-2 预测工作流**：将数据资产输入连接至 `chronos2_flow_forecast` 节点，配置预测步长为 96 点；
3. **触发执行与性能核验**：
   - 触发运行，观察任务分发至 GPU Worker；
   - 验证推理耗时（单序列 96 点推理耗时 &lt; 300ms）；
4. **核验预测曲线与置信区间**：
   - 在详情页查验 P50 中位数曲线与 P10~P90 阴影置信区间，确认捕捉到真实的日周期波动趋势。

---

## 2. 验收核验标准

- [x] GPU 推理任务正确调度且无显存泄漏；
- [x] 零样本预测结果贴合真实物理周期；
- [x] 概率分位数（P10, P50, P90）完整输出。
