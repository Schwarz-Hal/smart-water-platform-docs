---
id: user.dataset-assets
title: 数据资产详情、通道和版本管理
document_type: user_guide
document_version: 1.1.0
status: published
locale: zh-CN
audience: [platform_user, operator, developer]
related_modules: [M02, M03]
related_operators: [dataset_asset_v1]
related_apis: ["/api/v1/datasets", "/api/v1/datasets/{dataset_id}/versions", "/api/v1/datasets/{dataset_id}/lineage", "/api/v1/dataset-versions/{version_id}/channels", "/api/v1/dataset-versions/{version_id}/quality-reports"]
owners: [product-team]
reviewed_at: 2026-08-21
summary: 从数据源与导入页面进入资产详情，查看当前版本、血缘、通道和质量报告，并创建治理工作流。
---

# 数据资产详情、通道和版本管理

## 用途

数据资产详情用于确认可用版本、查看版本来源和通道内容，并检查质量报告。治理操作从同一详情页进入，不会在页面上改写父版本。

## 前置条件与角色

需要具有数据源读取权限，并能访问目标数据资产。只有已经生成可用版本的资产才适合继续查看通道、质量报告或创建治理工作流；治理工作流还需要相应的工作流编辑权限。

## 操作步骤

1. 打开【数据源与导入】，在【可用数据资产】中找到目标资产，点击资产卡片上的【详情与治理】。
2. 在详情页先查看资产概览，包括状态、版本数量、通道数量和最新质量信息。页面同时显示【当前可用版本】及版本说明。
3. 需要核对其他版本时，点击【版本列表 / 高级选项】展开版本列表并选择版本。血缘区域以树展示版本关系；如果需要逐个版本核对，可使用版本列表作为回退入口。
4. 查看【数据血缘】、【通道】和【质量报告】。选择树节点或版本列表中的版本后，通道和质量报告会随所选版本更新。血缘信息还会显示来源和创建任务标识；需要查看任务状态时，到【任务中心】按该标识查找。
5. 需要生成治理后的新版本时，点击【创建治理工作流】。页面会把当前版本带入新建流程，并预选 `timeseries_governance_basic`，随后按工作流页面继续配置、发布和运行。

## 结果与失败处理

详情页显示的当前版本、血缘、通道和质量报告是该资产当前可查看的信息。治理完成后，新的派生版本会出现在版本列表，原版本仍可查看。资产不存在、版本尚未准备好、血缘或报告加载失败时，先刷新详情并检查【任务中心】中的创建任务；不要把处理中版本当成可运行输入。
