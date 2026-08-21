---
id: user.dataset-assets
title: 数据资产详情、通道和版本管理
document_type: user_guide
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, operator, developer]
related_modules: [M02, M03]
related_operators: [dataset_asset_v1]
related_apis: ["/api/v1/datasets"]
owners: [product-team]
reviewed_at: 2026-08-21
summary: 说明数据资产目录、多通道时序指标、不可变版本切换与元数据查看方法。
---

# 数据资产详情、通道和版本管理

数据资产是平台中所有时序分析与算法运行的输入源。本篇介绍如何在资产中心检索、查阅通道规格及切换只读版本。

---

## 1. 数据资产中心

进入【数据管理】→【数据资产】，界面以卡片和表格形式列出当前工作空间内的全部时序数据资产：
- **资产基础信息**：资产名称、唯一编码、创建者、当前可用最新版本、总记录数、时间跨度；
- **快捷筛选**：支持按资产名称模糊搜索、按测区标签筛选及按创建时间排序。

---

## 2. 资产详情与通道视图

点击任一数据资产进入详情页：
1. **多通道规格 (Channels)**：
   - 列表展示资产包含的所有时序通道（如 `inflow`, `pressure`, `night_flow`）；
   - 展示每个通道的计量单位、采样周期（如 `15min`）、最大值、最小值、均值与缺失率；
2. **时序曲线预览**：
   - 可视化交互图表支持多通道叠加热力折线，支持时间轴缩放（DataZoom）查看局部毛刺与断点；
3. **版本切换 (Version Switcher)**：
   - 顶部下拉框可自由切换查看原始版本（`v1`）及所有经过清洗治理的派生版本（`v2`, `v3` 等）。
