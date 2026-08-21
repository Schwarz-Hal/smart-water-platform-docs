---
id: user.operator-center
title: 算子中心、契约规范与参数调整
document_type: user_guide
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, developer, admin]
related_modules: [M04]
related_operators: []
related_apis: ["/api/v1/operators"]
owners: [product-team]
reviewed_at: 2026-08-21
summary: 指导用户在算子中心查阅输入输出契约、检索算法算子，并指导管理员在线调整全局默认参数。
---

# 算子中心、契约规范与参数调整

算子中心（Operator Center）是平台的算法资产库，集中管理所有用于数据治理、特征工程、时序预测与漏损评估的标准算子。

---

## 1. 算子目录与分类筛选

进入【算子中心】，支持多维检索：
- **分类导航**：
  - `输入与数据源`（数据绑定、通道筛选）
  - `预处理与清洗`（去重、时钟对齐、缺失值插补、异常值剔除）
  - `时序预测模型`（Chronos-2 大模型、季节朴素预测）
  - `DMA 漏损分析`（水量平衡、MNF 最小夜间流量、EWMA 变化检测、证据融合）
  - `评估与报告`（Qscore 质量报告、S01 漏损评估报告）
- **标签与关键词检索**：支持按算子编码（如 `chronos2_flow_forecast`）或中文名称快速定位。

---

## 2. 算子契约详情 (Contract Details)

点击算子卡片查看其完整规格：
1. **端口契约 (Ports)**：
   - 输入端口名、数据类型约束（如 `timeseries`, `dataframe`, `model`）及必填说明；
   - 输出端口名及产出的 Artifact 结构；
2. **参数规格 (Parameters)**：
   - 友好呈现每个参数的字段名、类型（整数、浮点数、枚举、布尔）、取值范围与中文说明。

---

## 3. 管理员在线参数调整

具备管理员权限（`admin`）的用户可在线维护算子的出厂默认参数：
1. 在算子详情页点击【调整默认参数】；
2. 界面动态渲染 Formly 交互式表单（包含数值滑块、下拉选择器与即时类型校验）；
3. 修改参数后点击【保存生效】，后端通过 `Draft202012Validator` 执行 JSON Schema 强校验，确保参数合法后实时更新全局默认配置；
4. 如需恢复出厂配置，可随时点击【重置为出厂预设】。
