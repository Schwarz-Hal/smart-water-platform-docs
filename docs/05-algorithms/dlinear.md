---
id: operator.dlinear
title: DLinear 分解线性预测
document_type: algorithm
document_version: 0.1.0
status: draft
locale: zh-CN
audience: [algorithm_user, platform_user, developer]
related_modules: [M03, M04]
related_operators: [dlinear]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-09-10
summary: 说明DLinear 分解线性预测新增版本的输入、模型、参数、适用范围与验证边界。
---

# DLinear 分解线性预测

本文说明新增版本的实现约束，不代表真实管网业务效果验收。

## 用途与适用范围

算法 `dlinear@0.1.0`、算子 `dlinear@1.0.0` 用于单通道规则时序预测。适合作为需要训练的轻量对照。算法名称不代表已在当前水务数据上优于其他模型。

## 输入与输出

输入 `series` 是具有规则间隔、唯一递增时间的 `time/value` 时序；缺失和非有限值不被丢弃或静默插补。输出 `result` JSON，`values` 为预测值；`lower`、`upper` 和 `quantiles` 为空，不展示未经校准的区间。元数据记录预测起点、采样间隔、窗口、模型摘要和 CPU 推理设备。

## 原理与关键公式

将输入分解为端点延拓的 25 点滑动平均趋势和剩余季节项，使用两个线性预测头，合并为未来预测。它是需要训练的模型，不等同于线性插值。

按时间划分训练前段与后段验证，完整训练和验证窗口不重叠；均值和标准差只来自训练段。优化均方误差，以验证损失选择权重并提前停止。该验证损失参与模型选择，因此不是独立测试成绩。

## 参数说明

| 阶段 / 参数 | 默认值 | 约束 |
| --- | --- | --- |
| 训练 `window_length` | `96` | 8–2048 点。 |
| 训练 `horizon` | `32` | 1–512 点，决定模型输出容量。 |
| 训练 `epochs` / `batch_size` | `10` / `64` | 最多 100 轮；批大小 1–1024。 |
| 训练 `learning_rate` / `patience` | `0.001` / `3` | 学习率大于 0 且不超过 0.1；等待轮数 1–100。 |
| 训练 `train_validation_ratio` / `seed` | `0.2` / `42` | 后段验证比例 0.05–0.4。 |
| 训练 `device` | `cpu` | 可选 `cpu/cuda`；不静默将请求的 CUDA 降为 CPU。 |
| 推理 `horizon` | `32` | 不得大于绑定模型的训练预测长度。 |

## 结果解释与限制

有相应数据读取、训练及工作流运行权限后，映射时间和值列，选定训练范围并保存模型，之后绑定模型预测；支持显式 `fit_on_run`，普通推理不会重新训练。训练与验证段各至少需要 `window_length+horizon` 点。

ZIP 模型含 `manifest.json`、`weights.pt`，冻结算法类型、`training_version=0.1.0`、缩放器、时间间隔及分段范围。推理至少需要一个模型窗口，间隔必须与训练一致；预测起点不能早于训练和验证使用的最后时刻，否则返回 `MODEL_TEMPORAL_LEAKAGE`。训练预测长度不足时应绑定合适模型，不能仅扩大推理参数。

运行依赖 PyTorch。推理固定使用 CPU，模型加载缓存按路径及模型摘要区分。以上是实现边界，不是耗时保证；需要另测首次加载和已加载推理时间。当前没有外生变量、跨点位关系或本地校准概率区间。

## 参考资料

[DLinear 作者仓库](https://github.com/cure-lab/LTSF-Linear)。本版为独立架构实现；作者仓库 Apache-2.0，未复制上游模型权重。 平台依据 `dlinear/versions/0.1.0` 模型、训练/推理实现和对应 manifest。
