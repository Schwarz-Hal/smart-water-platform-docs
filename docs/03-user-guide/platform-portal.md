---
id: user.portal
title: 平台概览、快捷入口与工作台
document_type: user_guide
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, operator, developer, admin]
related_modules: [M01, M07]
related_operators: []
related_apis: [/api/v1/auth/me]
owners: [product-team]
reviewed_at: 2026-08-21
summary: 平台首页工作台、核心数据统计卡片、快捷操作入口与近期任务概览。
---

# 平台概览、快捷入口与工作台

登录平台后，用户首先进入控制台工作台首页（Dashboard），集中汇总当前系统的核心运行指标与快捷入口。

---

## 1. 核心指标统计卡片

- **数据资产总数**：当前工作空间内管理的时序资产总数与当前可用总通道数；
- **算子算法库规模**：内置标准算子数量与已注册的私有模型数；
- **今日任务执行数**：统计今日已完成、正在运行及失败的任务数与成功率；
- **系统健康状态**：API 服务、Celery Worker 集群与对象存储连通状态指示灯。

---

## 2. 快捷入口与继续工作

- **快捷入口矩阵**：一键直达【CSV 上传】、【新建工作流】、【S01 DMA 漏损分析】、【算子中心】；
- **继续工作列表**：列出当前用户最近编辑的 5 个工作流草稿与最近执行的任务，支持一键点击恢复上下文继续编辑。
