---
id: user.algorithm-training-models
title: 算法训练任务与私有模型管理
document_type: user_guide
document_version: 1.0.0
status: published
locale: zh-CN
audience: [developer, algorithm_user]
related_modules: [M04]
related_operators: []
related_apis: ["/api/v1/algorithms/training-jobs", "/api/v1/algorithms/models"]
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 指导算法工程师发起离线模型训练任务、监控收敛曲线、管理私有模型版本与注册权重。
---

# 算法训练任务与私有模型管理

除了开箱即用的预置大模型（如 Chronos-2），平台支持算法工程师针对特定供水分区训练专用的机器学习与统计模型。

---

## 1. 创建与监控训练任务

1. **新建训练任务**：
   - 进入【算法与模型】→【训练任务】，选择基础算法（如 `季节稳健基线分解`、`LSTM 流量预测`）；
   - 绑定训练数据集版本与时间窗口，配置学习率、迭代轮数、周期长度等超参数；
2. **实时监控训练日志与损失曲线**：
   - 训练任务提交至 `training` 队列；
   - 界面实时绘制 Loss 衰减曲线与验证集指标（$R^2$、MAE、RMSE）。

---

## 2. 模型库与权重版本注册

- 训练完成后，点击【注册为模型】，填写模型名称（如 `城南主干管-2026秋季基线模型`）与版本号（`v1.0.0`）；
- 模型权重文件安全持久化至 MinIO，并生成唯一不可变的 `model_id`，供工作流节点直接挂载引用。
