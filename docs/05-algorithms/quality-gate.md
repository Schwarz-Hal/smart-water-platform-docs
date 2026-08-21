---
id: operator.quality-gate
title: 数据质量门算子
document_type: algorithm
document_version: 1.1.0
status: published
locale: zh-CN
audience: [platform_user, developer]
related_modules: [M03, M04]
related_operators: [quality_gate_v1, qscore_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明 quality_gate_v1 对质量分的阈值判断、输入输出和失败边界。
---

# 数据质量门算子 (`quality_gate_v1`)

## 用途与适用范围

`quality_gate_v1` 在工作流中检查上游质量分，决定分支是否可以继续。它只做阈值判断，不重新计算 Qscore，也不修复输入数据。

## 输入与输出

输入端口 `quality` 是 0–100 的质量分（通常来自 `qscore_v1`）。参数 `minimum` 在 0–100 范围内。通过时输出 `passed=true`，并保留实际分数和门槛；受控 S01 算子适配器在未通过时返回 `S01_QUALITY_GATE_FAILED`，使该工作流节点失败。

## 原理与关键公式

令输入分数为 $q$、门槛为 $q_{min}$：

$$
passed=(q\ge q_{min})
$$

比较包含等号。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | ---: | --- |
| `minimum` | `60` | 最低质量分，范围 `0–100`。 |

S01 固定管线使用同样的判断，但公开参数名为 `quality_gate_min`，默认 `60`。

## 结果解释与限制

通过质量门只表示分数达到当前门槛，不代表数据没有异常或可直接用于所有模型。未通过时应查看 Qscore 五维分项和数据画像，再决定是否进行显式治理；质量门本身不执行插值、异常替换或告警工单。

## 参考资料

本算子为平台确定性阈值规则，无单独外部论文基准。
