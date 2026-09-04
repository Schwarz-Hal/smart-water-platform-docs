---
id: operator.data-quality-profile
title: 整体数据质量分析算子
document_type: algorithm
document_version: 1.2.0
status: published
locale: zh-CN
audience: [algorithm_user, platform_user]
related_modules: [M03, M04]
related_operators: [data_quality_profile_v1]
related_apis: ["/api/v1/data-governance/catalog", "/api/v1/data-governance/runs"]
owners: [algorithm-team]
reviewed_at: 2026-09-04
summary: 说明 data_quality_profile_v1 对单个表格或时序文件执行的确定性五维质量计算、等级与报告输出。
---

# 整体数据质量分析算子 (`data_quality_profile_v1`)

## 用途与适用范围

`data_quality_profile_v1` 是报告型数据治理算子，直接对一个表格或时序数据框执行确定性质量画像。它不调用 `qscore_v1`，不修改输入数据，也不创建治理后版本。工作台可以把它放在转换步骤之前或之后，以便对同一精确来源版本或治理结果进行比较。

## 输入与输出

输入为表格或时序数据。输出包含：

- 一份 `data_quality_profile` 报告，含行数、列数、重复行数、总分、等级、五维分数和每列概要；
- 由缺失单元形成的问题掩码；
- 运行层记录的来源、算子版本、参数和溯源信息。

报告不等同于业务数据已通过验收，也不对传感器物理正确性作保证。

## 原理与关键公式

设表格有 $R$ 行、$C$ 列，五个维度均按 0～100 计分：

- 完整性：$100\times(1-\frac{\text{空单元数}}{\max(1,R\times C)})$；
- 时间及时性：当 `time_column` 存在且 `expected_interval_seconds>0` 时，先计算可解析 UTC 时间的比例，再乘以按时间排序后相邻间隔**恰好**等于期望秒数的比例；未启用此检查时该维度为 100；
- 行唯一性：$100\times(1-\frac{\text{完全重复行数}}{\max(1,R)})$；
- 有效性：数值列中有限值在所有非空数值观测中的比例；没有数值观测时为 100；
- 相邻变化稳定性：对每个数值列的非空相邻值，计算 $100\times(1-\text{相等相邻对的比例})$，再对有至少两个观测的数值列取平均；没有可计算列时为 100。

总分是五个维度的等权平均：

$$
\mathrm{score}=\frac{S_{\mathrm{completeness}}+S_{\mathrm{timeliness}}+S_{\mathrm{uniqueness}}+S_{\mathrm{validity}}+S_{\mathrm{stability}}}{5}
$$

算子在每一步结果中保留到小数点后三位。等级固定为 A（`≥90`）、B（`≥80` 且 `<90`）、C（`≥60` 且 `<80`）和 D（`<60`）。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `expected_interval_seconds` | `900` | 时间及时性检查的期望相邻间隔（秒）。`0` 表示不启用间隔检查。 |
| `time_column` | `time` | 用于时间及时性检查的列名，不能为空。数据文件工作台可依据已完成的时间画像预填该值。 |

除上述两个参数外，算子不接受 `valid_min`、`valid_max` 或 `jump_z` 等阈值参数。

## 结果解释与限制

时间维度检查的是精确秒级间隔，而不是允许误差范围内的近似间隔。相邻变化稳定性是当前实现的统计量，不代表设备在工程意义上的稳定运行。需要字段级范围、枚举、正则或唯一性规则时，应使用 `schema_expectation_profile_v1`；需要水务传感器业务规则时，应使用 `water_sensor_rule_check_v1`。

完整报告或问题掩码由权限受控的结果内容接口读取；运行详情只包含有界摘要和样本。
