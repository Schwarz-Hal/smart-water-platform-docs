---
id: algorithm.water-c1-adaptive-anomaly
title: C1 深度分布漂移自适应异常检测
document_type: algorithm
document_version: 0.1.0
status: draft
locale: zh-CN
audience: [algorithm_user, operator]
related_modules: [M04]
related_operators: [water_adaptive_anomaly]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 C1 按设备对流量和压力进行深度表征、正常记忆评分、阈值校准和异常评估的方法边界。
---

# C1 深度分布漂移自适应异常检测

## 用途与定位

C1 为每个设备独立学习流量/压力的正常表征，并为时间窗口末端生成异常分数。分数融合重构误差、一步预测误差、潜在边界误差和窗口前后分布漂移；正常参考记忆用于形成局部基线。

模型训练阶段不读取异常标签，但当前完整流程在验证集上用传感器有效性标签搜索 Best-F1 阈值。因此不能把它称为完全无标签的端到端流程，也不能将输出直接解释为漏损检测或根因结论。

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

窗口若包含原始缺失观测，输入网络前使用因果前向填补，但保留缺失掩码；该窗口的分数改用训练参考分数上界加 10 倍训练分数离散度的固定值。

### 阈值与评估调整

每台设备在验证集上按联合标签搜索使 F1 最大的阈值 $\tau$，测试时以 $s_t\ge\tau$ 判为异常。联合标签为：

$$
label_t=flow\_label_t\lor pressure\_label_t
$$

传感器有效性标签表示读数是否有效，不表示漏损。Point Adjustment 会在评估时把一个真实异常事件中已有任意命中的预测扩展到整个事件；它只用于指标对比，不改变原始分数或线上预测。

## 输入与输出

训练集每设备提供修复后的 `flow`、`pressure` 和时间序列，不使用标签；验证集和测试集提供原始 `flow`、`pressure`、`flow_label`、`pressure_label`，标签用于阈值选择或最终评估。输入以 96 点窗口构造。

输出包括每个窗口末端的 `anomaly_score`、设备专属阈值、阈值归一化分数、异常预测、缺失观测标记和证据分量；评估文件还包含 Point Adjustment 前后的分类与事件指标。

## 训练与模型

模型按设备独立训练，使用带噪输入重构干净目标，并以正常训练窗口尾部作为无标签 holdout 做早停。默认 GRU hidden size 为 64、latent size 为 32、训练最多 30 轮、patience 为 5。训练后为每个设备保存模型权重、标准化参数和 Top-K 正常记忆。

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
| `train_validation_ratio` | `0.15` | 训练数据尾部 holdout 比例。 |
| `reference_size` | `1024` | 正常参考记忆最大样本数。 |
| `top_k` | `32` | 每个窗口使用的最近正常参考数，必须小于 `reference_size`。 |

## 结果解释

异常分数越高，表示相对该设备训练正常记忆的重构/预测/边界/漂移证据越偏离；阈值是每设备验证集校准结果，不能跨设备直接比较。输出中的缺失标记说明原始观测中存在缺失，不应与模型识别出的过程异常混为一谈。

## 适用范围

适用于设备级流量和压力时序的正常表征、异常筛查和离线评估，前提是训练集可作为该设备的正常参考。适合分析点级异常分数及事件级指标。

## 限制与注意事项

- 模型参数训练不使用标签，但 Best-F1 阈值选择使用验证集传感器有效性标签；完整管线并非完全无标签。
- `flow_label`、`pressure_label` 表示传感器读数有效性，不是漏损标签；该实验不能据此输出漏损结论。
- Point Adjustment 仅为评估后处理，不能当作运行时自动补齐事件或提高原始检测分数。
- 因果前向填补只服务于网络输入，缺失分数采用固定训练参考值；它不恢复真实测量值。
- 训练参考库、标准化参数和阈值均为设备专属，换设备、采样周期或数据分布后需要重新评估。

## 评估指标

验证/测试评估报告包含 Point Adjustment 前后两套指标：Precision、Recall、F1、AUROC，以及按设备事件计算后宏平均的 Affiliation-Precision、Affiliation-Recall、Affiliation-F1。整体点级指标把设备测试点拼接后计算；事件级 Affiliation 指标保持设备序列边界，避免跨设备连接事件。

## 参考资料

本文依据 C1 实验模型、阈值、指标、数据切分和评估输出整理；本页面不引入未经验证的生产效果或漏损结论。
