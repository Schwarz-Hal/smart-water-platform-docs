---
id: algorithm.water-b2-probabilistic-forecast
title: B2 外生驱动轻量概率预测
document_type: algorithm
document_version: 0.1.0
status: draft
locale: zh-CN
audience: [algorithm_user, operator]
related_modules: [M04]
related_operators: [water_probabilistic_forecast]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 B2 按设备输出流量与压力 P10/P50/P90、区间校准和超阈风险分级的方法与限制。
---

# B2 外生驱动轻量概率预测

## 用途与定位

B2 对每个设备的流量和压力进行联合概率预测，在过去 96 个采样点基础上输出未来 12 个采样点的 P10、P50、P90。模型可接收时间周期和可选外生变量，并通过验证集校准预测区间；同时从设备训练集分位数构造超阈概率和风险等级。

本文描述实验模型和评估口径。超阈概率是由三个分位数近似得到的统计量，不是故障、漏损或控制动作结论。

## 方法原理

### 外生交互与分位数头

历史目标为二维流量/压力序列 $h_t$，外生输入为 $e_t$。外生编码器先线性投影、GELU、LayerNorm 和 dropout，再加入正弦位置编码。历史投影与外生投影通过门控交互：

$$
g_t=\operatorname{sigmoid}(W[h_t;e_t]+b),\qquad
u_t=g_t\odot h_t+(1-g_t)\odot e_t
$$

$u_t$ 经过 GRU 和单层 Transformer，最后状态与设备嵌入拼接，送入单调分位数头。设原始头输出为 $a_{10},a_{50},a_{90}$，实现用 softplus 保证区间有序：

$$
\hat{q}_{50}=a_{50},\quad
\hat{q}_{10}=\hat{q}_{50}-\operatorname{softplus}(a_{10}),\quad
\hat{q}_{90}=\hat{q}_{50}+\operatorname{softplus}(a_{90})
$$

训练使用三个分位数的联合 Pinball Loss：

$$
L_q=\max(q(y-\hat{q}_q),(q-1)(y-\hat{q}_q)),\qquad
L=\operatorname{mean}(L_{0.1}+L_{0.5}+L_{0.9})
$$

### Conformal 区间校准

在校准数据上计算：

$$
r=\max(\hat{q}_{10}-y,\;y-\hat{q}_{90})
$$

按实现的有限样本分位点取得非负修正量 $c$，再执行：

$$
\hat{q}_{10}'=\hat{q}_{10}-c,\qquad
\hat{q}_{90}'=\hat{q}_{90}+c
$$

校准只扩张区间，不改变 P50 或分位数顺序。校准器默认目标覆盖率为 `0.8`，修正量按预测步和目标变量保存。

### 超阈概率与风险等级

每个设备和目标从训练集目标值的 `0.95` 分位数得到阈值，并转换到标准化空间。对阈值与 P10/P50/P90 的相对位置，使用分段线性 CDF 近似超阈概率；流量或压力任一超过阈值时取两个目标概率的最大值：

$$
p_{joint}=\max(1-F_{flow}(z_{flow}),1-F_{pressure}(z_{pressure}))
$$

等级由联合概率分箱得到：`low` 为 `<0.2`，`medium` 为 `0.2–<0.5`，`high` 为 `0.5–<0.8`，`extreme` 为 `≥0.8`。

## 输入与输出

输入按设备和时间提供 `device_id`、`record_time`、`flow`、`pressure`。历史目标窗口为 96 点、目标为未来 12 点。外生输入至少包含由时间生成的日、周、年周期正余弦及周末特征；数据中存在时，还可读取 `rainfall`、`precipitation`、`temperature`、`weather_index`、`pump_state`、`valve_state`、`upstream_level`、`upstream_inflow`、`holiday`、`schedule_index` 等数值列，并要求训练、验证、测试列保持一致。

输出为 `[12, 2, 3]` 的流量/压力分位数，最后一维依次为 P10、P50、P90；还可输出校准后的区间、每一步联合超阈概率和 `low`/`medium`/`high`/`extreme` 风险等级。实验文件同时保存分位数校准量、设备阈值和分设备/分预测步指标。

## 训练与模型

训练集、验证集和测试集使用按设备时间顺序切分的修复后流量/压力序列。目标变量按设备标准化，外生变量按训练数据标准化；预测输出可逆变换回目标空间。模型使用 AdamW、梯度裁剪和验证损失早停，并使用设备嵌入区分设备。

模型默认隐藏宽度 64、外生嵌入宽度 32、GRU 层数 1、注意力头数 4、最多 50 个 epoch、早停耐心 8。概率头固定为三个分位数，不能通过配置替换为其他分位数集合。

## 参数

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `input_length` | `96` | 历史上下文点数。 |
| `horizon` | `12` | 预测未来点数。 |
| `batch_size` | `512` | 训练批大小。 |
| `hidden_size` | `64` | 交互编码器和预测头隐藏宽度。 |
| `exogenous_embedding_size` | `32` | 外生编码宽度。 |
| `num_layers` | `1` | GRU 层数。 |
| `attention_heads` | `4` | Transformer 注意力头数。 |
| `device_embedding_dim` | `8` | 设备嵌入维度。 |
| `dropout` | `0.1` | Dropout 比例，取值范围为 `[0,1)`。 |
| `learning_rate` | `0.001` | AdamW 学习率。 |
| `weight_decay` | `0.00001` | AdamW 权重衰减。 |
| `epochs` | `50` | 最大训练轮数。 |
| `patience` | `8` | 验证损失早停耐心轮数。 |
| `quantiles` | `[0.1, 0.5, 0.9]` | 固定的分位数集合。 |
| `risk_threshold_quantile` | `0.95` | 训练集风险阈值分位数，必须在 `(0,1)`。 |

## 结果解释

P50 是中心预测，P10–P90 表示模型输出的区间；区间越宽表示模型在该步的预测不确定性表达越宽。Conformal 修正量只扩张区间。风险等级描述目标超过训练集设备阈值的近似概率分箱，不等于告警等级或故障等级。

## 适用范围

适用于具有按设备排序的流量、压力历史，且可以提供一致时间/外生特征的短期概率预测实验。适合同时查看点预测、区间覆盖和阈值超越概率。

## 限制与注意事项

- 区间校准依赖校准数据分布；修正量不是所有设备、季节或未来工况下的覆盖保证。
- 超阈概率由 P10/P50/P90 分段近似，并用两个目标概率的最大值表示联合事件，不能当作精确概率或因果判断。
- 可选外生列缺失、列集合在数据划分间不一致或尺度发生变化时，输入契约不成立。
- 预测结果、风险等级和设备阈值不构成漏损、故障或现场处置结论。

## 评估指标

实验在每设备标准化流量/压力空间报告整体、设备和预测步指标：

- Pinball Loss：三个分位数的平均分位数损失；
- P50 的 MAE、RMSE 和 $R^2$；
- P10–P90 覆盖率与平均区间宽度；
- 真实值落在 P10、P50、P90 以下的经验 CDF 比例。

指标用于评估该实验划分上的概率预测，不代表校准在其他数据上的效果。

## 参考资料

本文依据 B2 实验模型、配置、校准、风险、指标实现及其评估输出整理；本页面不引入未经验证的外部性能结论。
