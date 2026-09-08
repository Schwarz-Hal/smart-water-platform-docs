---
id: algorithm.water-c1-adaptive-anomaly
title: C1 深度分布漂移自适应异常检测
document_type: algorithm
document_version: 0.3.0
status: draft
locale: zh-CN
audience: [algorithm_user, operator]
related_modules: [M04]
related_operators: [water_adaptive_anomaly]
related_apis: ["/api/v1/algorithms/{algorithm_code}/training-runs", "/api/v1/training-runs/{training_run_id}"]
owners: [algorithm-team]
reviewed_at: 2026-09-07
summary: 说明 C1 0.3.0 单点流压训练、无标签校准、可选已核验标签校准和模型包推理的实现边界。
---

# C1 深度分布漂移自适应异常检测

## 用途与定位

C1 为每个设备独立学习流量/压力的正常表征，并为时间窗口末端生成异常分数。分数融合重构误差、一步预测误差、潜在边界误差和窗口前后分布漂移；正常参考记忆用于形成局部基线。

本页对应算法实现 `water_adaptive_anomaly@0.3.0` 的训练与推理，以及引用它的工作流推理算子 `water_adaptive_anomaly@1.2.0`。C1 是单测点流量/压力模型，不是图模型；即使输入来自管网数据包，也不会自动利用全网拓扑。异常输出不能直接解释为漏损检测、根因或水力仿真结论。

默认不使用标签，以校准段分位数确定阈值；只有显式提供已核验标签时才搜索校准段 Best-F1。训练得到的模型版本与算法、算子版本分别记录，推理必须使用真实模型包。

## 方法原理

### 窗口表征与三类证据

对长度为 96 的二维流压窗口，GRU 生成隐藏状态和潜在向量 $z_t$。重构头复原当前序列；预测头使用倒数第二个隐藏状态预测当前点。边界 MLP 根据历史状态产生潜在中心 $\mu_t$ 和对角对数方差 $\ell_t$，边界误差为：

$$
e_{boundary,t}=\sqrt{\sum_j(z_{t,j}-\mu_{t,j})^2e^{-\ell_{t,j}}}
$$

漂移证据是潜在漂移表征前半段和后半段均值的线性核 MMD 风格距离：

$$
e_{shift,t}=\left\|\operatorname{mean}(d_{recent})-\operatorname{mean}(d_{first})\right\|_2
$$

三个窗口证据分量为：

$$
c_t=[e_{reconstruction,t}+0.25e_{boundary,t},\;e_{prediction,t},\;e_{shift,t}]
$$

权重 MLP 输出 $\alpha_t,\beta_t,\gamma_t$，经 softmax 后满足和为 1。训练损失包含重构 MSE、一步预测 MSE、边界项、漂移项、权重平衡项和正常分数项。

### 正常记忆与异常分数

每个设备从训练正常窗口按位置抽取参考库。对待评分窗口，在潜在空间选择距离最近的 Top-K 参考样本，并用 RBF 相似度归一化为 $a_{tk}$。对每个证据分量计算局部均值和方差：

$$
\tilde{c}_{t,j}=\max\left(\frac{c_{t,j}-\bar{c}_{t,j}}
{\sqrt{s^2_{t,j}+10^{-4}}},0\right),\qquad
s_t=\alpha_t\tilde{c}_{t,1}+\beta_t\tilde{c}_{t,2}+\gamma_t\tilde{c}_{t,3}
$$

平台 0.3.0 不沿用实验中的缺失窗口代分数规则。缺失、重复或不规则观测需先经过显式治理；训练要求有限流压数值，模型不自动填补、重采样或补零。

### 阈值与评估调整

默认方法为 `calibration_quantile`：以校准段异常分数的 `threshold_quantile` 分位数作为阈值，不产生 F1、Precision 或 Recall。

普通表格可指定 `label_column` 且明确设置 `labels_verified=true`。校准窗口末端的标签须同时含 0（正常）和 1（异常）；平台仅在该校准段搜索 Best-F1 阈值，方法为 `verified_label_calibration_best_f1`。`calibration_f1`、`calibration_precision` 和 `calibration_recall` 不是独立测试准确率。SWNet 训练界面不提供标签列校准。

传感器有效性标签不自动等于漏损标签，标签语义由数据提供者核验。当前平台训练不自动运行旧实验中的 Point Adjustment 或事件级 Affiliation 评估，也不伪造标签。

## 输入与输出

训练选择一个精确文件版本。普通表格映射 `time`、`flow`、`pressure` 三列，并事先整理为单测点表格；SWNet 选择一个实际同时具有 `flow`、`pressure` 的测点，不能把多个测点交错记录混为一条序列。训练读取器最多接收 200000 个对齐点。时间必须唯一、等间隔且与声明的采样间隔一致；默认窗口长度为 96。

推理算子流量端口单位为 `m3/h`、压力为 `MPa`；准备训练数据时确保单位一致，训练本身不执行单位换算。输出包括窗口末端时间、阈值归一化分数、候选区间、证据表和检测摘要；前 `window_length - 1` 个点没有完整窗口，不产生同等数量的预测。

## 训练与模型

模型按单测点独立训练，默认按时间划分训练 70%、留出 15%、校准 15%，三段分别构造窗口，不跨越切分边界。每段至少容纳一个完整窗口。标准化器和正常记忆只拟合训练段，留出段用于早停，校准段不参与梯度训练。默认 hidden size 为 64、latent size 为 32、最多 30 轮、patience 为 5。

模型包包含 `weights.pt`、`scaler.npz`、`normal_memory.npz` 和 `manifest.json`。清单保存输入顺序、窗口、采样间隔、阈值、网络配置、训练参数、来源版本与摘要、测点/字段映射、切分时间范围和指标；来自 SWNet 的序列与来源 provenance 一并保留。推理加载同一包的权重、标准化器、记忆和阈值，窗口及采样间隔必须与模型匹配。

### 平台操作与角色

1. 账户需要 `algorithm:train`，并选择服务端允许训练的已准备文件版本。在算子中心 C1 详情打开【单点流量与压力训练】，或选择已有训练记录。
2. 选择精确版本。普通文件确认时间、流量、压力映射；SWNet 选择一个兼具两项指标的测点。
3. 核对窗口、采样间隔、轮数、批大小、学习率与校准分位数。只有可信标签时展开标签配置并确认已经核验。
4. 提交后查看任务状态、逐轮训练/留出损失、阈值方法和模型版本。取消申请等待执行检查点和服务端终态；关闭页面不等于任务停止。
5. 后续推理选择兼容模型版本。模型可见性和默认模型仍遵循平台权限与发布流程；训练完成不等于自动发布或部署。

## 参数

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `window_length` | `96` | 历史窗口长度。 |
| `batch_size` | `256` | 训练批大小。 |
| `hidden_size` | `64` | GRU 隐藏宽度。 |
| `latent_size` | `32` | 潜在表征宽度。 |
| `num_layers` | `1` | GRU 层数。 |
| `dropout` | `0.1` | Dropout 比例。 |
| `learning_rate` | `0.001` | AdamW 学习率。 |
| `weight_decay` | `0.00001` | AdamW 权重衰减。 |
| `epochs` | `30` | 最大训练轮数。 |
| `patience` | `5` | holdout 早停耐心轮数。 |
| `noise_std` | `0.03` | 训练时注入的高斯噪声标准差。 |
| `train_validation_ratio` | `0.15` | 按时间分离的留出段比例。 |
| `calibration_ratio` | `0.15` | 独立校准段比例。 |
| `threshold_quantile` | `0.99` | 无标签校准分位数，须在 0 与 1 之间。 |
| `expected_interval_seconds` | `900` | 正采样间隔，单位秒；不触发重采样。 |
| `gradient_clip` | `1.0` | 梯度裁剪。 |
| `seed` / `device` | `42` / `auto` | 随机种子与设备；设备可为 `auto`、`cpu`、`cuda`。 |
| `reference_size` | `1024` | 正常参考记忆最大样本数。 |
| `top_k` | `32` | 每个窗口使用的最近正常参考数，实际使用数不超过已存参考数。 |

实现上限为窗口 2048、批大小 2048、hidden size 512、latent size 256、GRU 层数 4、训练轮数 100、参考库 4096。这些是资源边界，不是性能保证。推理另有 `threshold_multiplier`（默认 1）和 `minimum_consecutive_points`（默认 1）；后者只筛选候选区间，不修改原始分数。

## 结果解释

分数越高，表示相对本测点正常记忆的偏离越大。推理分数为原始分数除以模型阈值与 `threshold_multiplier` 的乘积，达到 1 表示超过当前阈值；不是异常概率。阈值不能跨设备直接比较，候选也不能替代业务核验。

## 适用范围

适用于设备级流量和压力时序的正常表征、异常筛查和离线评估，前提是训练集可作为该设备的正常参考。适合分析点级异常分数及候选异常区间。

## 限制与注意事项

- 无标签时不显示 F1；启用已核验标签时，Best-F1 仅说明用于选阈值的同一校准段。
- 标签语义、正常参考数据的代表性与单位需人工确认。合成、估计或拓扑代理数据不能冒充实测流压。
- 时间重复、间隔不符、缺失值或历史不足会阻止运行；应修正输入或创建显式治理版本，而不是绕过校验。
- 指定 CUDA 但不可用时需选择可用运行环境；模型文件、窗口或阈值不匹配时需使用兼容模型包。
- 训练参考库、标准化参数和阈值均为设备专属，换设备、采样周期或数据分布后需要重新评估。

## 评估指标

平台返回逐轮损失、最佳留出损失、实际轮数、阈值及方法、运行设备、训练行数和采样间隔；已核验标签校准时另有校准 Precision、Recall、F1。本文不提供独立测试 F1、吞吐量、训练时长或生产检测效果结论，也不宣称服务器部署验收已完成。

## 参考资料

本文依据平台 `water_adaptive_anomaly@0.3.0` 的 Provider、训练、模型与推理实现及推理算子 `1.2.0` 的契约整理。输入准备见[管网数据集](../../03-user-guide/network-datasets.md)，缺失与不规则数据处理见[质量报告与治理](../../03-user-guide/data-quality-governance.md)。
