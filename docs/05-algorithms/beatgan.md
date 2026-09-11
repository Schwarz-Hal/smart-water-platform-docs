---
id: operator.beatgan
title: BeatGAN 对抗重构异常检测
document_type: algorithm
document_version: 0.1.1
status: draft
locale: zh-CN
audience: [algorithm_user, platform_user, developer]
related_modules: [M03, M04]
related_operators: [beatgan]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-09-11
summary: 说明BeatGAN 对抗重构异常检测新增版本的输入、模型、参数、适用范围与验证边界。
---

# BeatGAN 对抗重构异常检测

## 标准结果版本

算子1.1.0新增标准结果输出，算法Provider及旧算子版本保持原状。result端口使用sw.result1.0协议。字段、缺失值及显示规则见[标准结果契约](../06-development/standard-results.md)。历史运行仍按原版本读取，不重算或覆盖。

本文说明新增版本的实现约束，不代表真实管网业务效果验收。

## 用途与适用范围

算法 `beatgan@0.1.0`、算子 `beatgan@1.0.0`。学习单通道常见时序形态，以重构偏差形成风险候选。GAN 训练需要人工确认范围和训练预算；不把正常启停、节假日变化自动认定为漏损。

## 输入与输出

输入端口 `series` 为单通道、唯一递增、规则采样的 `time/value` 时序；不接受缺失或无穷值，必须显式先治理。输出 `result` JSON 含 `scores`、`labels`、`threshold`、`times`、`validity_mask` 和元数据。分数与完整输入逐点对齐；前 `window_length−1` 点尚无完整窗口，分数和标签为 `null`、有效性为 `false`，不是正常值 0。

## 原理与关键公式

采用作者实现的五级一维卷积编码器／转置卷积解码器和独立判别器；训练判别真伪，生成器联合优化重构与判别器特征匹配损失。窗口末端获得整窗重构均方误差。窗口卷积核按长度调整；不含 ECG 专用预处理、时间扭曲增强和判别器重置启发式，不宣称复现原论文成绩。

训练与后段校准窗口不跨分段边界。阈值来自后段原始分数分位数；标签表示超过该阈值。该分数不是异常概率，也不与其他算法分数直接等价。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `calibration_ratio` | `0.2` | 后段校准比例，0.05–0.4。 |
| `threshold_quantile` | `0.99` | 大于 0.5、小于 1 的校准分位数。 |
| `seed` | `42` | 训练随机种子。 |
| `window_length` | `32` | 32–256 且为 32 的倍数。 |
| `epochs` / `batch_size` | `5` / `64` | 2–30 轮；批大小 2–512。 |
| `learning_rate` / `device` | `0.001` / `cpu` | 可选 `cpu/cuda`，请求 CUDA 时须有对应运行资源。 |
| `hidden_size` / `latent_size` | `4` / `8` | 2–32 / 2–128。 |
| `adversarial_weight` | `1` | 特征匹配项权重，大于 0 且不超过 10。 |
| `max_training_rows` | `20000` | 超限拒绝；参数最大 100000。 |

以上为训练参数，模型保存后冻结窗口与阈值。无需手填模型内部参数来重现推理。

## 结果解释与限制

具备相应数据读取、训练和工作流运行权限后，先选明确历史范围训练，保存模型并绑定推理，或明确启用运行内训练。普通推理不拟合模型，也不修改原始数据。

训练和推理依赖 PyTorch。模型 ZIP 包含 `manifest.json`、`state.npz` 和 `weights.pt`。缩放仅拟合训练段且不截断外部幅值。模型容量、GAN 稳定性及训练污染会影响结果，不能依据重构图宣称真实漏点定位。

训练数据可能混有异常，校准也不是独立测试。对训练或校准时段回算时查看 `training_period_overlap_points`、`not_future_of_model_points` 和 `causal_evaluation`；只有使用评估时刻之前已冻结的模型，才可讨论在线检出能力。按尾随窗口计算并不使回算自动成为无泄漏评价。当前未承诺真实业务精度、每秒吞吐或全年全网耗时。

## 参考资料

[BeatGAN 论文](https://www.ijcai.org/proceedings/2019/0616.pdf)、[本版参考的作者提交](https://github.com/imbingox/BeatGAN/tree/d7b0e8802073558479164a6cf6a2ae43726a371b)。适配保留 MIT 许可说明。 平台细节以 `beatgan/versions/0.1.0/SOURCES.md`、实现和 manifest 为准。
