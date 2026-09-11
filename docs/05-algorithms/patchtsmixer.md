---
id: operator.patchtsmixer
title: PatchTSMixer 时序预测
document_type: algorithm
document_version: 0.1.0
status: draft
locale: zh-CN
audience: [algorithm_user, platform_user, developer]
related_modules: [M03, M04]
related_operators: [patchtsmixer]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-09-10
summary: 说明PatchTSMixer 时序预测新增版本的输入、模型、参数、适用范围与验证边界。
---

# PatchTSMixer 时序预测

本文说明新增版本的实现约束，不代表真实管网业务效果验收。

## 用途与适用范围

算法 `patchtsmixer@0.1.0`、算子 `patchtsmixer@1.0.0` 用于单通道规则时序预测。可作为较复杂预测模型候选，与轻量基线在相同数据与预算下比较。算法名称不代表已在当前水务数据上优于其他模型。

## 输入与输出

输入 `series` 是具有规则间隔、唯一递增时间的 `time/value` 时序；缺失和非有限值不被丢弃或静默插补。输出 `result` JSON，`values` 为预测值；`lower`、`upper` 和 `quantiles` 为空，不展示未经校准的区间。元数据记录预测起点、采样间隔、窗口、模型摘要和 CPU 推理设备。

## 原理与关键公式

使用 Transformers 官方 PatchTSMixerForPrediction，以 8 点分片、4 点步长、32 维表示、两层混合结构建模；当前为单通道预测适配。

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

运行依赖 PyTorch 和 Transformers。推理固定使用 CPU，模型加载缓存按路径及模型摘要区分。以上是实现边界，不是耗时保证；需要另测首次加载和已加载推理时间。当前没有外生变量、跨点位关系或本地校准概率区间。

## 参考资料

[Transformers PatchTSMixer 官方文档](https://huggingface.co/docs/transformers/model_doc/patchtsmixer)。使用 Apache-2.0 的 Transformers 实现，未宣称复现公共基准。 平台依据 `patchtsmixer/versions/0.1.0` 模型、训练/推理实现和对应 manifest。
