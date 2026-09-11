---
id: operator.saits-repair
title: SAITS 单通道缺失修复
document_type: algorithm
document_version: 0.1.0
status: draft
locale: zh-CN
audience: [algorithm_user, platform_user, developer]
related_modules: [M03, M04]
related_operators: [saits_imputation]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-09-10
summary: 说明SAITS 单通道缺失修复新增版本的输入、模型、参数、适用范围与验证边界。
---

# SAITS 单通道缺失修复

本文说明新增版本的实现约束，不代表真实管网业务效果验收。

## 用途与适用范围

算法 `saits_imputation@0.1.0`、算子 `saits_imputation@1.0.0` 用学习到的时序关系进行离线缺失修复。本版是独立实现的紧凑单通道 SAITS 架构；不宣称多传感器联合建模或复现论文基准。支持工作流，尚未接入数据文件治理的模型绑定，因此不会作为数据文件治理算子列出。

## 输入与输出

输入端口 `series` 为一条规则 `time/value` 时序，显式允许数值缺失，但无效文本和无穷值不被当成可修复空值。输出 `series` 修复时序、`issue_mask` 表格和 `report` 摘要；未修复处仍为 `null`。掩码包含位置 `row_id`、`MISSING_VALUE` 及 `repaired/unchanged`。推理只改原本缺失的位置。

## 原理与关键公式

两个对角掩蔽自注意力块分别估计完整窗口，再根据缺失标记与注意力图学习组合权重。训练联合使用三组重构输出的观测重构损失（ORT）和人为遮蔽已知值后的插补损失（MIT）。缩放器只读取训练前段；后段独立窗口以固定人为遮蔽选权重。它是验证损失，不是独立测试成绩。推理重叠窗口估计取平均，并应用完整缺口的点数与时长限制。

## 参数说明

| 阶段 / 参数 | 默认值 | 约束 |
| --- | --- | --- |
| 训练 `window_length` | `96` | 8–256 点。 |
| 训练 `hidden_size` | `32` | 8–128，须为 4 的倍数。 |
| 训练 `epochs` / `batch_size` | `10` / `32` | 最多 50 轮、每批最多 128 个窗口；CPU。 |
| 训练 `learning_rate` / `mask_rate` | `0.001` / `0.2` | 学习率大于 0 且不超过 0.1；掩蔽比例 0.05–0.5。 |
| 训练 `train_validation_ratio` / `seed` | `0.2` / `42` | 后段验证比例 0.05–0.4。 |
| 推理 `max_gap_points` / `max_gap_seconds` | `8` / `7200` | 同时限制整段缺失点数和两侧已知观测总时间跨度。 |

## 结果解释与限制

先在训练工作台映射时间和数值列、明确训练范围并保存模型，之后绑定模型运行；或在支持的工作流模型绑定中明确选择 `fit_on_run`。普通推理从不自动训练。模型 ZIP 必须含 `manifest.json` 和 `weights.pt`，标识 `kind=saits_imputation`、`training_version=0.1.0`；导入权重是数据，不作为用户代码执行。

训练和推理每次最多 200000 点；训练与验证段各需完整窗口和足够观测。推理至少需要模型窗口长度且采样间隔与模型一致。首尾缺失、整段超限及缺少上下文的点保持为空。结果使用未来上下文，不可直接用于在线监测效果评价；不输出经校准的不确定性区间。PyTorch 依赖、模型或输入不满足条件时失败，不使用简化填充替代 SAITS。

## 参考资料

[SAITS 论文](https://arxiv.org/abs/2202.08516)、[作者参考实现](https://github.com/WenjieDu/SAITS)。参考仓库为 MIT 许可；本版独立架构实现未复制上游源码或权重。平台事实来自 `saits_imputation/versions/0.1.0` 与对应算子 manifest。
