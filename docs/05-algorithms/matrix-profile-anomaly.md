---
id: operator.matrix-profile-anomaly
title: Matrix Profile 形态异常检测
document_type: algorithm
document_version: 0.1.0
status: draft
locale: zh-CN
audience: [algorithm_user, platform_user, developer]
related_modules: [M03, M04]
related_operators: [matrix_profile_anomaly]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-09-10
summary: 说明Matrix Profile 形态异常检测新增版本的输入、模型、参数、适用范围与验证边界。
---

# Matrix Profile 形态异常检测

本文说明新增版本的实现约束，不代表真实管网业务效果验收。

## 用途与适用范围

算法 `matrix_profile_anomaly@0.1.0`、算子 `matrix_profile_anomaly@1.0.0`。检测当前尾随片段相对冻结历史参考片段的差异。适合形态与水平变化对照；不是实时自更新的参考库。

## 输入与输出

输入端口 `series` 为单通道、唯一递增、规则采样的 `time/value` 时序；不接受缺失或无穷值，必须显式先治理。输出 `result` JSON 含 `scores`、`labels`、`threshold`、`times`、`validity_mask` 和元数据。分数与完整输入逐点对齐；前 `window_length−1` 点尚无完整窗口，分数和标签为 `null`、有效性为 `false`，不是正常值 0。

## 原理与关键公式

实际调用 STUMPY AAMP 的精确 AB-join。仅用训练前段计算全局均值和标准差，再计算非局部归一化的子序列 RMS 距离，以保留持续水平变化。与每个窗口单独进行 z-normalization 的 Matrix Profile 变体不同，本版并不消除各窗口局部水平和尺度。

训练与后段校准窗口不跨分段边界。阈值来自后段原始分数分位数；标签表示超过该阈值。该分数不是异常概率，也不与其他算法分数直接等价。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `window_length` | `32` | 完整尾随窗口 4–256 点。 |
| `calibration_ratio` | `0.2` | 后段校准比例，0.05–0.4。 |
| `threshold_quantile` | `0.99` | 大于 0.5、小于 1 的校准分位数。 |
| `seed` | `42` | 训练随机种子。 |
| `max_training_rows` | `5000` | 训练总行数默认上限；冻结参考段另有 5000 行硬上限。 |

以上为训练参数，模型保存后冻结窗口与阈值。无需手填模型内部参数来重现推理。

## 结果解释与限制

具备相应数据读取、训练和工作流运行权限后，先选明确历史范围训练，保存模型并绑定推理，或明确启用运行内训练。普通推理不拟合模型，也不修改原始数据。

模型 ZIP 包含 `manifest.json` 和 `state.npz`，后者保存冻结参考数据及缩放参数。参考段最多 5000 行，每次校准或推理比较最多 2000 万对子序列；超限报错，不静默采样。STUMPY/Numba 首次编译计入冷启动成本。若参考库已经包含同类异常，异常可能难以识别；使用参考段本身评价不是独立测试。

训练数据可能混有异常，校准也不是独立测试。对训练或校准时段回算时查看 `training_period_overlap_points`、`not_future_of_model_points` 和 `causal_evaluation`；只有使用评估时刻之前已冻结的模型，才可讨论在线检出能力。按尾随窗口计算并不使回算自动成为无泄漏评价。当前未承诺真实业务精度、每秒吞吐或全年全网耗时。

## 参考资料

[STUMPY 官方仓库](https://github.com/stumpy-dev/stumpy)、[AAMP API](https://stumpy.readthedocs.io/en/latest/api.html#stumpy.aamp)。STUMPY 是 BSD-3-Clause 依赖。 平台细节以 `matrix_profile_anomaly/versions/0.1.0/SOURCES.md`、实现和 manifest 为准。
