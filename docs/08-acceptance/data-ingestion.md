---
id: acceptance.data-ingestion
title: CSV 与只读 MySQL 数据接入验收
document_type: acceptance
document_version: 1.0.0
status: published
locale: zh-CN
audience: [project_stakeholder, operator, developer]
related_modules: [M02]
related_operators: [dataset_asset_v1]
related_apis: ["/api/v1/datasets/upload", "/api/v1/datasets/import"]
owners: [quality-team]
reviewed_at: 2026-08-21
summary: 验证标准 CSV 导入、采样预览、字段映射、时间戳解析及只读 MySQL 接入的验收步骤。
---

# CSV 与只读 MySQL 数据接入验收

---

## 1. 验收测试步骤

1. **准备测试数据集**：准备包含时间戳、`inflow` ($m^3/h$)、`pressure` ($MPa$) 的标准管网测试 CSV；
2. **执行上传预检**：在前端上传文件，确认 10 行采样数据正确解析，列名无乱码；
3. **完成字段映射**：正确映射时间列与各指标通道，提交异步导入；
4. **验证资产生成与只读性**：进入资产列表，确认生成初始版本 `v1`，通道统计数据完整，且原始数据不可就地修改。

---

## 2. 验收核验标准

- [x] CSV 格式自动识别与编码自适应正常；
- [x] 导入任务异步执行并实时推送完成通知；
- [x] 数据资产元数据、时间跨度与各通道均值/极值计算准确。
