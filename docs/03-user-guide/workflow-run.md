---
id: user.workflow-run
title: 数据绑定、校验、发布与运行工作流
document_type: user_guide
document_version: 1.2.0
status: published
locale: zh-CN
audience: [platform_user, operator]
related_modules: [M05, M07]
related_operators: []
related_apis: ["/api/v1/workflows/{workflow_id}/validate", "/api/v1/workflows/{workflow_id}/publish", "/api/v1/workflow-versions/{version_id}/runs"]
owners: [product-team]
reviewed_at: 2026-08-21
summary: 在工作流编辑器中保存、校验、发布版本并运行数据分析。
---

# 数据绑定、校验、发布与运行工作流

## 用途

把算子连接成可追溯的工作流版本，并用选定的数据资产运行分析。

## 前置条件与角色

需要工作流编辑、发布和运行权限，以及已经准备完成的数据资产和可用算子。草稿以服务器保存的版本为准；浏览器本地内容只用于异常恢复。

## 操作步骤

1. 打开【工作流】编辑器，拖入算子并连线；在数据输入节点选择资产、版本、点位、指标、值来源和分析时间范围。
2. 点击页面上的【校验】入口，按提示修复缺少输入、端口不匹配、参数错误或没有最终输出的问题。
3. 点击【发布版本】，确认版本说明后完成发布。已发布版本不能直接修改；需要调整时从历史版本创建新的草稿。
4. 在已发布版本页面点击运行，复核数据绑定和参数覆盖后提交。随后转到任务中心查看进度。

## 结果与失败处理

页面提示草稿已被其他标签页修改时，先重新加载并比较变更，不要覆盖服务器草稿。运行提交成功只表示任务已创建；如果任务失败，打开任务详情查看原因，修正数据、参数或运行环境后再使用重运行入口。
