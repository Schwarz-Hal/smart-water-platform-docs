---
id: user.data-quality-governance
title: 数据质量检查与治理
document_type: user_guide
document_version: 1.9.0
status: published
locale: zh-CN
audience: [platform_user, operator]
related_modules: [M02, M03, M07]
related_operators: [timeseries_quality_profile, timeseries_governance_basic, timeseries_synthetic_extension]
related_apis: ["/api/v1/dataset-versions/{version_id}/quality-profiles", "/api/v1/dataset-versions/{version_id}/quality-reports", "/api/v1/data-governance/catalog", "/api/v1/data-governance/runs", "/api/v1/data-files/{file_id}/governance-runs", "/api/v1/data-governance/runs/{run_id}/timeseries"]
owners: [product-team]
reviewed_at: 2026-11-02
summary: 检查文件质量、配置治理步骤并查看处理结果。
---

# 数据质量检查与治理

## 用途

检查数据中的缺失、异常和时间问题，按需要生成质量报告或处理后的数据，供后续分析使用。

## 前置条件与角色

来源文件应已完成解析。打开【数据中心】的【质量概览】查看质量情况；需要处理时，从文件操作中进入数据治理工作台。

## 操作步骤

1. 选择待检查的文件和版本，查看预览与已有质量信息。
2. 在【选择操作】中添加适用的检查或处理步骤。只想了解数据情况时选择检查；需要修复或整理时再添加相应操作。
3. 进入【配置规则】，核对处理列、时间列和各项参数。排序、缺失修复和重采样等操作应按本次需要设置。
4. 选择输出方式：仅生成报告、生成新版本或生成新文件。核对名称和保存位置。
5. 在【确认执行】中检查来源、步骤及参数，点击【开始治理】。
6. 完成后查看质量报告、处理摘要和处理前后曲线，按需要下载结果。生成的数据可继续作为分析输入。

## 查看历史与复用

在【治理记录】中查找已提交的处理任务；打开文件治理历史也可查看相关结果。需要反复使用相同配置时，在【治理模板】中保存和管理方案，应用到其他文件前重新核对字段。

## 结果与失败处理

关闭运行窗口后，任务可在后台继续。重新打开记录查看状态；失败时按提示检查文件、字段和参数。原始文件保留，处理结果按所选输出方式保存。
