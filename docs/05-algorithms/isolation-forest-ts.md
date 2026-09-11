---
id: operator.isolation-forest-ts
title: Isolation Forest 时序异常检测
document_type: algorithm
document_version: 0.1.0
status: draft
locale: zh-CN
audience: [algorithm_user, platform_user, developer]
related_modules: [M03, M04]
related_operators: [isolation_forest_ts]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-09-10
summary: 说明Isolation Forest 时序异常检测新增版本的输入、模型、参数、适用范围与验证边界。
---

# Isolation Forest 时序异常检测

本文说明新增版本的实现约束，不代表真实管网业务效果验收。

## 用途与适用范围

算法 `isolation_forest_ts@0.1.0`、算子 `isolation_forest_ts@1.0.0`。适合作为单通道异常检测的轻量模型对照；既检查当前读数，也利用尾随窗口变化。它不是不需要历史数据的规则阈值。

## 输入与输出

输入端口 `series` 为单通道、唯一递增、规则采样的 `time/value` 时序；不接受缺失或无穷值，必须显式先治理。输出 `result` JSON 含 `scores`、`labels`、`threshold`、`times`、`validity_mask` 和元数据。分数与完整输入逐点对齐；前 `window_length−1` 点尚无完整窗口，分数和标签为 `null`、有效性为 `false`，不是正常值 0。

## 原理与关键公式

使用 scikit-learn 的 IsolationForest 训练，输入六项固定时序特征：当前值、一阶差分、尾随均值、标准差、最小值、最大值。树被导出为数组，推理按隔离路径长度产生原始异常分数；不用 Pickle/Joblib 执行模型对象。

训练与后段校准窗口不跨分段边界。阈值来自后段原始分数分位数；标签表示超过该阈值。该分数不是异常概率，也不与其他算法分数直接等价。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `window_length` | `32` | 完整尾随窗口 4–256 点。 |
| `calibration_ratio` | `0.2` | 后段校准比例，0.05–0.4。 |
| `threshold_quantile` | `0.99` | 大于 0.5、小于 1 的校准分位数。 |
| `seed` | `42` | 训练随机种子。 |
| `n_estimators` | `100` | 10–300 棵树；树越多通常计算越多。 |
| `max_training_rows` | `20000` | 超限失败，不自动截断；参数最大 100000。 |

以上为训练参数，模型保存后冻结窗口与阈值。无需手填模型内部参数来重现推理。

## 结果解释与限制

具备相应数据读取、训练和工作流运行权限后，先选明确历史范围训练，保存模型并绑定推理，或明确启用运行内训练。普通推理不拟合模型，也不修改原始数据。

训练须安装 scikit-learn；数组模型推理使用 NumPy。模型 ZIP 包含 `manifest.json`、`state.npz`。不学习跨传感器关系。

训练数据可能混有异常，校准也不是独立测试。对训练或校准时段回算时查看 `training_period_overlap_points`、`not_future_of_model_points` 和 `causal_evaluation`；只有使用评估时刻之前已冻结的模型，才可讨论在线检出能力。按尾随窗口计算并不使回算自动成为无泄漏评价。当前未承诺真实业务精度、每秒吞吐或全年全网耗时。

## 参考资料

[scikit-learn IsolationForest 官方 API](https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html)。scikit-learn 是 BSD-3-Clause 依赖，没有复制其实现。 平台细节以 `isolation_forest_ts/versions/0.1.0/SOURCES.md`、实现和 manifest 为准。
