---
id: quickstart.train-anomaly-model
title: 训练并使用季节稳健异常检测模型
document_type: quick_start
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, developer]
related_modules: [M04, M05]
related_operators: [seasonal_robust_anomaly]
related_apis: [/api/v1/algorithms/training-jobs]
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明如何利用历史正常时序训练季节稳健异常检测模型，并将其部署于工作流中进行异常核验。
---

# 训练并使用季节稳健异常检测模型

针对具备典型日/周周期模式的管网测区，通过训练专属季节基线模型，可大幅降低异常误报率。

---

## 操作步骤

1. **创建模型训练任务**：
   - 进入【算法与模型】→【训练任务】，点击【新建训练任务】；
   - 算法选择 `季节稳健基线模型`，选择 30 天无爆管的正常历史流量数据作为训练集；
   - 设置基线分解参数（`season_length: 96`，`robust_alpha: 0.1`）；
2. **查看训练结果与模型评估**：
   - 训练完成后，查看周期基线拟合优度（$R^2$ 与残差分布直方图）；
   - 将合格模型保存至【我的私有模型库】；
3. **在工作流中加载私有模型**：
   - 在工作流画布中拖入 `季节稳健异常检测` 算子，在属性面板绑定刚刚训练的模型权重；
   - 运行后即可实时对新增监测数据进行高精度异常筛查。
