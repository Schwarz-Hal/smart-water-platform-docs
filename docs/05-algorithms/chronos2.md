---
id: algorithm.chronos2.overview
title: Chronos-2 时序预测
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [algorithm_user, platform_user]
related_modules: [M04]
related_operators: [chronos2_flow_forecast]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-20
summary: Chronos-2 时序基础模型的原理、输入输出、关键参数、适用范围和结果解释。
---

# Chronos-2 时序预测

## 算法概览

Chronos-2 是 Amazon 提出的 **120M 参数、encoder-only** 时序基础模型。它以统一架构处理单变量、多变量和带协变量的概率预测，并能够在不针对目标数据集重新训练的情况下进行零样本预测。

给定长度为 $T$ 的历史目标序列 $\mathbf{Y}_{1:T}$、可选协变量 $\mathbf{X}_{1:T+H}$ 和预测长度 $H$，概率预测的目标是估计：

$$
\mathcal{P}\!\left(\mathbf{Y}_{T+1:T+H}\mid\mathbf{Y}_{1:T},\mathbf{X}_{1:T+H}\right)
$$

点预测通常取中位数分位数 $Q_{0.5}$，同时使用较低和较高分位数描述预测不确定性。

## 模型架构

![Chronos-2 架构示意图](../../static/assets/chronos2-architecture.svg)

*图：根据 Ansari 等（2025）论文 Figure 1 重绘。原始时序经过稳健缩放、元特征构造和分块嵌入后，进入交替的时间注意力与组注意力层，最后由分位数预测头一次性生成多个未来时间步。*

### 稳健缩放

模型先对每个变量按历史均值 $\mu_d$ 和标准差 $\sigma_d$ 标准化，再使用反双曲正弦变换减弱极端值影响：

$$
\widetilde{v}_{t,d}=\operatorname{asinh}\!\left(\frac{v_{t,d}-\mu_d}{\sigma_d}\right)
$$

该变换在零附近近似线性，在绝对值较大时具有类似对数变换的压缩效果，同时允许负值。

### 分块与嵌入

数值、相对时间索引和观测掩码被切分为长度为 $P$ 的非重叠 patch，并经残差网络映射到 Transformer 隐空间：

$$
\mathbf{h}_{p}=f_{\phi}^{\mathrm{in}}\!\left([\overline{\mathbf{u}}_{p},\overline{\mathbf{j}}_{p},\overline{\mathbf{m}}_{p}]\right)
$$

其中 $\overline{\mathbf{u}}_{p}$ 是数值 patch，$\overline{\mathbf{j}}_{p}$ 是时间索引，$\overline{\mathbf{m}}_{p}$ 指示观测值和缺失值。

### 时间注意力与组注意力

- **时间注意力**在同一变量的 patch 序列内聚合时间依赖；
- **组注意力**在同一组相关序列之间交换信息，可表达多个目标变量、相关序列及协变量之间的关系。

组注意力可以写成带分组掩码 $M_g$ 的缩放点积注意力：

$$
\operatorname{Attention}(Q,K,V)=\operatorname{softmax}\!\left(\frac{QK^{\mathsf{T}}}{\sqrt{d_k}}+M_g\right)V
$$

### 多分位数预测头

未来 patch 的隐藏表示经残差预测头直接输出多个未来时间步和多个分位数。训练使用 pinball（quantile）loss：

$$
\mathcal{L}_{q}(z,\widehat{z}^{q})=q\max(z-\widehat{z}^{q},0)+(1-q)\max(\widehat{z}^{q}-z,0)
$$

Chronos-2 原始模型预测 21 个分位数；常用的 P10、P50、P90 可分别表示偏低情形、中位预测和偏高情形。

## 输入与输出

| 项目 | 说明 |
| --- | --- |
| 输入 | 按时间排序的目标时序；模型也支持相关目标序列、历史协变量和未来已知协变量。 |
| 预测长度 | 由 `prediction_length`（界面中对应 `horizon`）给出。15 分钟数据预测一天时，$H=96$。 |
| 上下文长度 | `context_length` 决定参与预测的历史窗口；较长窗口有助于表达日、周等长周期模式。 |
| 输出 | 未来时间戳、点预测以及 P10/P50/P90 等分位数预测。 |

## 关键参数

- `horizon`：需要预测的未来点数。
- `context_length`：送入模型的历史点数。
- `quantile_levels`：需要返回的分位数集合，常用 `[0.1, 0.5, 0.9]`。
- `cross_learning`：是否允许一组相关时序通过组注意力共享上下文信息。

## 适用场景

- 流量、压力、需水量等具有明显时间结构的连续数值预测；
- 缺少专用训练样本，希望先建立可比较零样本基线的场景；
- 需要同时给出点预测和预测区间的风险敏感分析；
- 多变量或已知未来协变量能够提供额外信息的预测任务。

## 局限与结果解释

- 零样本模型并不保证在每个水务数据集上优于季节朴素、指数平滑等专用基线，应使用相同留出区间比较 MAE、RMSE、sMAPE 和区间覆盖率；
- P10–P90 是模型估计的概率区间，不是“真实值必然落入其中”的保证；
- 长缺失、采样间隔变化、突发工况和明显分布漂移会削弱预测可靠性；
- 协变量只有在时间对齐、未来可获得且与目标具有稳定关系时才可能带来收益；
- 论文中的公开基准结果不能直接替代具体 DMA 或供水区域上的业务验证。

## 参考资料

- Ansari, A. F. et al. (2025). [Chronos-2: From Univariate to Universal Forecasting](https://arxiv.org/abs/2510.15821).
- [Chronos 官方实现与使用示例](https://github.com/amazon-science/chronos-forecasting).
- [amazon/chronos-2 模型说明](https://huggingface.co/amazon/chronos-2)，Apache-2.0 License.
