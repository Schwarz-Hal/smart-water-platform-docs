---
id: operator.pchip-repair
title: PCHIP 保形缺失修复
document_type: algorithm
document_version: 0.1.0
status: draft
locale: zh-CN
audience: [algorithm_user, platform_user, developer]
related_modules: [M03, M04]
related_operators: [pchip_repair_dataset_v1]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-09-10
summary: 说明PCHIP 保形缺失修复新增版本的输入、模型、参数、适用范围与验证边界。
---

# PCHIP 保形缺失修复

本文说明新增版本的实现约束，不代表真实管网业务效果验收。

## 用途与适用范围

算子 `pchip_repair_dataset_v1@1.0.0` 用于离线填补短缺口；没有训练步骤。适合希望按实际时间间距插补、又避免普通高阶插值过冲的场景。已有观测不被视为待修复对象，持续高值和尖峰不会被本算子自动删除。

## 输入与输出

数据文件治理接收具有时间列和数值列的时序表，可显式指定分组列，输出新文件或新版本及变更集、缺失问题掩码。原文件不改写。工作流输入和输出均为 `dataset` 数据集包；每个通道独立处理，输出治理 stage，由后续发布节点形成数据版本。工作流 stage 保存处理参数和血缘，不额外输出完整掩码下载端口。

## 原理与关键公式

使用 SciPy `PchipInterpolator`，依据每组排序后的真实时间轴建立分段三次 Hermite 插值。计算时排序，数据文件结果恢复原行序并保留时间列表示。只有两侧都有观测、连续缺失点数和两端观测间总时长同时未超限的整段缺口才允许填补；超限缺口整段保留，首尾缺失不外推。

## 参数说明

| 参数 | 默认值 | 说明 |
| --- | --- | --- |
| `columns` | `null` | 通用表必须显式选数值列；规范 `time/value` 单通道可自动选 `value`。 |
| `time_column` | `time` | 用于计算的时间列，不能同时作为修复列。 |
| `group_columns` | `null` | 多点位表应选点位等身份列，避免不同对象混合插值。 |
| `max_gap_points` | `8` | 允许 1–1024；按完整连续缺口判断。 |
| `max_gap_seconds` | `7200` | 两侧已知观测之间的总秒数上限，须大于 0。 |

## 结果解释与限制

在具有数据读取及治理权限的账户中，选定精确源版本、选择列与分组、设置双重缺口上限后创建派生输出。检查 `MISSING_VALUE` 掩码中 `repaired/unchanged` 和剩余空值，不把完整率提升当作真实性证明。重复时间、无效时间及非数值标记会失败；先明确去重或规范化，不能自动猜测。运行环境须安装 SciPy；缺少依赖不替代为线性插值。当前没有本地业务数据效果排名或耗时承诺。

## 参考资料

[SciPy PCHIP 官方说明](https://docs.scipy.org/doc/scipy/reference/generated/scipy.interpolate.PchipInterpolator.html)。SciPy 为 BSD 许可依赖，未复制其源码。平台事实以本次版本 manifest 和 `governance_operations/advanced_repair.py` 为依据。
