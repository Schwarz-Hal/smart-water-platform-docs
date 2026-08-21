---
id: user.external-algorithm-package
title: 外部算法包接入与审核
document_type: user_guide
document_version: 1.3.0
status: published
locale: zh-CN
audience: [algorithm_user, admin]
related_modules: [M04]
related_operators: []
related_apis: ["/api/v1/algorithm-packages", "/api/v1/algorithm-packages/versions/{version_id}/provision", "/api/v1/algorithm-packages/versions/{version_id}/approve"]
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 通过算子中心向导完成外部算法 ZIP 的检查、环境制备、试运行和审核。
---

# 外部算法包接入与审核

## 用途

为受信任的算法运营人员保留外部算法的兼容接入路径。当前默认业务入口仍是受审查的内置算法；上传外部包不会立即成为可运行算法。

## 前置条件与角色

准备一个 ZIP，包含 `manifest.yaml`、`src/`、`schemas/`，以及 `pylock.toml` 或完全锁定的 `requirements.lock`。上传、环境制备和试运行由算法运营人员完成，最终审核由具备审核权限的管理员完成。

## 操作步骤

1. 打开【算子中心】，点击【导入外部算法】进入向导，选择 ZIP，填写算法名称、版本和批准的运行环境配置。
2. 等待静态检查完成。向导会检查包结构、清单、输入输出 Schema 和依赖锁；平台不会在主服务中运行包内代码。
3. 选择【制备环境】并等待环境状态变为就绪。环境摘要可在版本详情中查看，内部路径不会展示。
4. 在算子草稿步骤补充端口、参数和输出映射，执行契约校验和标准样例试运行；如果清单要求模型，在模型步骤按命名槽位上传。
5. 所有检查通过后，在该版本的【提交审核与激活】区域提交审核。具备审核权限的管理员可选择【批准并激活】或【退回修改】；退役如需操作，仅通过兼容 API 管理能力完成，不是当前向导按钮。

## 结果与失败处理

依赖锁、运行环境、契约、模型槽位或样例运行失败时，按向导提示修正后重新检查。未制备或未批准的版本不会出现在默认可运行入口；历史兼容入口显示未制备或不可运行属于安全边界，不代表上传丢失。已发布工作流仍使用原来冻结的算子和环境。
