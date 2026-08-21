---
id: user.data-quality-governance
title: 质量报告、治理方案与派生版本
document_type: user_guide
document_version: 1.3.0
status: published
locale: zh-CN
audience: [platform_user, operator]
related_modules: [M03]
related_operators: [timeseries_quality_profile, timeseries_governance_basic, timeseries_synthetic_extension]
related_apis: ["/api/v1/dataset-versions/{version_id}/quality-profiles", "/api/v1/dataset-versions/{version_id}/quality-reports"]
owners: [product-team]
reviewed_at: 2026-08-21
summary: 在数据资产页面查看质量报告，并从治理工作流生成派生版本。
---

# 质量报告、治理方案与派生版本

## 用途

质量报告帮助用户判断数据是否适合分析；治理流程生成新的派生版本，不改写原始版本。

## 前置条件与角色

需要查看数据质量的权限；生成派生版本还需要数据治理权限。要处理的数据版本必须已经准备完成。

## 操作步骤

1. 在【数据源与导入】的【可用数据资产】中打开【详情与治理】，选择要查看的资产版本。
2. 在资产详情查看当前版本、版本血缘树、指标通道和【质量报告】列表。页面没有单独的 Quality/【质量评估】页签，也没有手动重新评估按钮。
3. 需要生成治理后的派生版本时，点击【创建治理工作流】；入口会带入当前资产版本，并预选 `timeseries_governance_basic`，然后按工作流页面的实际配置继续。

## 结果与失败处理

质量报告和派生版本状态以资产详情实际显示为准。治理完成后，资产详情会出现新的派生版本，父版本仍可查看。版本未准备好、报告缺失或治理任务失败时，先检查资产状态和任务详情，再按工作流页面提示修正输入并重新运行；质量报告不是业务结论。
