---
id: user.data-quality-governance
title: 数据质量检查与治理
document_type: user_guide
document_version: 1.9.1
status: published
locale: zh-CN
audience: [platform_user, operator]
related_modules: [M02, M03, M07]
related_operators: [timeseries_quality_profile, timeseries_governance_basic, timeseries_synthetic_extension]
related_apis: ["/api/v1/dataset-versions/{version_id}/quality-profiles", "/api/v1/dataset-versions/{version_id}/quality-reports", "/api/v1/data-governance/catalog", "/api/v1/data-governance/runs", "/api/v1/data-files/{file_id}/governance-runs", "/api/v1/data-governance/runs/{run_id}/timeseries"]
owners: [product-team]
reviewed_at: 2026-11-15
summary: 检查文件质量、配置治理步骤并查看处理结果。
---

# 数据质量检查与治理

## 用途

检查数据中的缺失、异常和时间问题，按需要生成质量报告或处理后的数据，供后续分析使用。

## 前置条件与角色

来源文件应已完成解析。从【数据中心】打开数据集或【无归属文件】，在文件行点击【检查与治理】。Excel 需先选好工作表并按提示确认表头；如提示确认时间列，按资料实际含义选择。

## 操作步骤

1. 核对待检查的文件和版本，先等待检查报告。检查只生成报告，不修改原文件；如只需了解质量，读完报告即可关闭。
2. 需要处理时，点击报告中的【查看治理方案】，核对适用的处理步骤。推荐方案在时序资料适用时包含排序、完全重复记录清理及质量复查，不默认补零、插值、替换异常值或重采样。
3. 进入【配置规则】，核对处理列、时间列和各项参数。使用自定义处理时，在【选择操作】中添加所需步骤，不把检查结果视为自动同意修改数据。
4. 默认将处理结果另存为新文件；核对名称和保存位置。只有满足下述条件时，才可选择更新当前文件。仅包含检查的方案只生成报告。
5. 在【确认执行】中检查来源、步骤、参数及保存方式，点击【开始治理】。
6. 完成后查看质量报告、处理摘要和处理前后曲线，按需要下载结果，或点击【查看处理后的数据】。生成的数据可继续作为分析输入。

### 保存方式与更新限制

从检查报告进入治理时，更新当前文件要求：来源是有写权限的非内置 CSV 或 Parquet 文件，使用的版本仍是文件当前版本，已有成功且匹配该版本的检查报告，并且所选处理步骤支持此保存方式。更新会生成并设定新的当前版本，原始版本仍保留。Excel 工作表的处理结果须另存，不能更新原工作簿；INP 在此入口仅支持结构检查。

如果检查后文件版本或工作表选择发生变化，服务端会拒绝失效报告，需重新检查。执行期间若原文件的当前版本已变化，结果可能保存为新版本但不切换当前版本；以结果区的保存提示和运行警告为准。

## 回看检查与复用配置

重新从同一文件的【检查与治理】进入时，窗口会尝试恢复匹配当前版本及工作表选择的运行中任务或成功检查报告，并非打开完整历史列表。结果窗口提供【按原配置重跑】；需要调整时可用【使用当前数据配置】，再核对步骤、字段和保存方式。相关操作按权限开放。

## 结果与失败处理

关闭运行窗口后，任务可在后台继续。重新进入同一文件的【检查与治理】可尝试接续仍在运行的任务；失败时按提示检查文件、字段和参数。原始文件保留，处理结果按所选输出方式保存。
