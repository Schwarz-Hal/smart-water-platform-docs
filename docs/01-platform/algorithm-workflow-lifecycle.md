---
id: platform.algorithm-workflow-lifecycle
title: 算法发布版本、模型与工作流复现关系
document_type: platform
document_version: 1.2.0
status: published
locale: zh-CN
audience: [developer, algorithm_user]
related_modules: [M04, M05]
related_operators: []
related_apis: ["/api/v1/algorithms/{algorithm_code}/releases", "/api/v1/workflow-versions/{version_id}/runs"]
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明算法与算子精确版本共存、训练模型、工作流版本和运行快照如何保持可追溯。
---

# 算法发布版本、模型与工作流复现关系

平台通过不可变版本和运行快照保存“当时使用了什么”。这支持审计和比较，但不表示所有历史计算都能在任意环境中自动重算，也不提供未经业务验证的准确率承诺。

## 1. 算法、算子和模型版本

- 算法身份、`algorithm_code@version`、`operator_code@version`、训练运行和模型版本分别登记；每个已安装版本都是可独立解析的实体。
- 算法包按精确版本目录加载，版本目录的内容摘要只覆盖该版本闭包。新增兄弟版本不会改变已发布版本的摘要。
- 训练模型由 `seasonal_robust_anomaly` 生成安全 JSON 模型；Chronos-2 是预训练 GPU 推理算法，当前不支持平台内训练。
- 模型状态为 `training → ready → review_pending → published|retired|blocked`。私有模型默认仅创建者和管理员可见。
- 算子版本可绑定审核通过且未阻断的算法发布包，并保存版本级默认参数和公共默认模型。管理员修改这些默认值只影响之后创建的新节点。

## 2. 生命周期与默认版本

发布状态仍经过 `draft → validating → review_pending → approved` 等审核流程；创建者或提交者不能审核自己的发布版本。版本生命周期使用 `current`、`deprecated`、`blocked`：`deprecated` 版本仍可被历史工作流和显式请求使用，`blocked` 版本不可运行。

默认版本仅用于新节点或省略版本的直跑/训练请求：选择最高稳定的 `current` SemVer；不存在稳定版时选择最高 `current` 预发布版。运行时短暂离线不会改变默认版本。`activate`、`retire`、`rollback` 这类改变唯一活动版本的接口已进入兼容退役阶段，不再作为版本切换机制。

## 3. 工作流与运行快照

草稿节点保存精确算子版本；工作流发布版本冻结 Graph、节点版本、端口连接、参数、算法发布包和模型绑定。Graph 1.0 节点可用 `model_binding.model_version_id` 保存精确模型；历史把模型 ID 放在参数中的节点仍可兼容读取。创建运行时再保存数据版本、点位、指标、值来源、时间范围和参数覆盖。

新版本出现后，历史工作流不会自动升级，也不会因为存在更新版本而失效。只要引用的算子/算法版本目录、Provider、运行时和模型仍存在且可执行，历史工作流就可以继续调用。

## 4. 可追溯范围与边界

通过工作流运行详情、节点和 Artifact 接口，可以追溯数据版本、工作流版本、算子/算法版本、模型摘要、参数和任务 `trace_id`。大对象由 API 代理 MinIO 读取并带 SHA256 摘要。恢复依赖仍可访问的对象、兼容的运行时和保存的版本；平台不宣称跨任意未来环境的自动重演。
