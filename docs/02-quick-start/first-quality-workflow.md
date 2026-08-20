---
id: quickstart.first-quality-workflow
title: 从上传 CSV 到运行第一个质量分析工作流
document_type: quick_start
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user]
related_modules: [M02, M03, M05]
related_operators: [dataset_asset_v1, data_quality_profile_v1]
related_apis: []
owners: [product-team]
reviewed_at: 2026-08-20
summary: 使用 CSV 数据资产创建并运行第一个数据质量分析工作流。
---

# 从上传 CSV 到运行第一个质量分析工作流

## 前置条件

- 已登录平台，并具有上传数据和运行自己工作流的权限。
- CSV 至少包含时间列、点位列和一个数值指标列。

## 操作步骤

1. 在“数据源与导入”选择“上传 CSV”，完成预览和字段映射。
2. 等待导入完成；平台会在后台生成质量评估，导入成功不依赖评估完成。
3. 打开“工作流”，新建空白工作流或选择质量分析结构。
4. 添加“整体数据资产”和“数据质量分析”算子，并连接输出端口。
5. 在数据资产节点中选择刚导入的当前可用版本，保存、校验并发布流程。
6. 运行发布版本，在运行详情查看质量等级、问题统计和节点结果。

## 结果与失败处理

质量报告显示完整性、时间间隔一致性、唯一性、有效性和稳定性等统计。字段映射不正确时，可删除未导入的上传草稿后重新上传；工作流校验失败时，根据画布中的端口提示补全连接或参数。
