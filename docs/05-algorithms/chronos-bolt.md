---
id: operator.chronos-bolt
title: Chronos-Bolt Small 预训练预测
document_type: algorithm
document_version: 0.1.1
status: draft
locale: zh-CN
audience: [algorithm_user, platform_user, developer]
related_modules: [M03, M04]
related_operators: [chronos_bolt]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-09-11
summary: 说明Chronos-Bolt Small 预训练预测新增版本的输入、模型、参数、适用范围与验证边界。
---

# Chronos-Bolt Small 预训练预测

## 标准结果版本

算子1.1.0新增标准结果输出，算法Provider及旧算子版本保持原状。result端口使用sw.result1.0协议。字段、缺失值及显示规则见[标准结果契约](../06-development/standard-results.md)。历史运行仍按原版本读取，不重算或覆盖。

本文说明新增版本的实现约束，不代表真实管网业务效果验收。

## 用途与适用范围

算法 `chronos_bolt@0.1.0`、算子 `chronos_bolt@1.0.0` 使用预先训练的 Amazon Chronos-Bolt Small 做单通道零样本预测。无需本地训练，但必须先有可信且已绑定的模型包；没有模型不等于可用。

## 输入与输出

输入 `series` 为唯一递增、规则采样的 `time/value` 时序；不接受缺失和非有限值。输出 `result` JSON 包含 P50 预测 `values`、P10/P90 的 `lower/upper` 和 `quantiles`。这些是预训练分位数，不是针对当前管网校准后的覆盖率承诺。

## 原理与关键公式

通过实际 `ChronosBoltPipeline` 读取本地模型，调用分位数预测头获得 0.1、0.5、0.9 分位数。加载设置只允许本地文件，不下载权重、不执行远程代码，也不会用随机权重作为替代结果。适配器验证 Small 配置，并按模型摘要缓存加载结果。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `horizon` | `32` | 1–64 个未来点。 |
| `context_length` | `512` | 8–2048 个历史点，输入至少达到此长度。 |

本版仅提供推理，不能在训练向导中选择它进行本地训练。

## 结果解释与限制

由具有模型导入与工作流运行权限的用户提供经授权的本地模型 ZIP。包根目录须包含 `manifest.json`、`config.json` 和 `model.safetensors`。平台封装 manifest 的必填标记为：

```json
{"kind":"chronos_bolt","training_version":"0.1.0","source_model":"amazon/chronos-bolt-small"}
```

这里的 `training_version` 表示平台适配器封装契约版本，不表示用户训练过基础模型。配置必须匹配 Small（`d_model=512`、`num_layers=6` 及 Chronos 配置）。运行依赖 PyTorch、Transformers 与 chronos-forecasting，当前 CPU 推理。模型缺失、包不符、数据不足或分位数非有限／交叉时失败。

本轮已用官方 Small 真实权重完成 288 点输入、16 点预测的数值检查，输出有限且分位数不交叉，并核验约 191 MB 模型 ZIP 的解析路径。预训练权重检查独立于依赖导入或随机模型冒烟检查；不能由其中一项替代另一项。

官方相对其他 Chronos 版本的加速结果不能直接换成本平台总耗时，也不能外推为相对现有 Chronos-2 的速度。当前仍没有真实管网业务留出集的精度、覆盖率或生产性能承诺。

## 参考资料

[Chronos-Bolt Small 模型卡](https://huggingface.co/amazon/chronos-bolt-small)、[Amazon Chronos 官方仓库](https://github.com/amazon-science/chronos-forecasting)。适配器遵循官方 Apache-2.0 实现；下载、保存或分发权重时仍须核对对应模型卡许可。平台事实来自本版 manifest 与推理实现。
