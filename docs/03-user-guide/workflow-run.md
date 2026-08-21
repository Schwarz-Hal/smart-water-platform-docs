---
id: user.workflow-run
title: 数据绑定、校验、发布与运行工作流
document_type: user_guide
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, operator, developer]
related_modules: [M05, M07]
related_operators: []
related_apis: ["/api/v1/workflows/{id}/validate", "/api/v1/workflows/{id}/publish", "/api/v1/workflows/{id}/runs"]
owners: [product-team]
reviewed_at: 2026-08-21
summary: 指导用户在画布中完成数据通道绑定、拓扑图校验、版本发布与触发异步任务运行。
---

# 数据绑定、校验、发布与运行工作流

在画布中完成算子拓扑编排后，需要绑定具体的数据资产、通过图校验并发布后方可提交生产运行。

---

## 1. 数据资产与通道绑定

1. 在画布中选中起始的 `数据资产输入` 节点；
2. 在右侧属性面板中选择目标数据资产（如 `城东DMA-202608`）及其具体版本；
3. 为节点的各个输出端口指定对应通道（如将 `入口流量` 端口与资产中的 `inflow` 通道绑定）。

---

## 2. 拓扑图校验 (Graph Validation)

点击右上角【校验图】，系统前端与后端校验引擎将联合检查：
- **DAG 无环性**：确保拓扑不存在循环死锁回路；
- **端口类型兼容**：确保连线两端的输入输出类型完全匹配；
- **必填参数完整性**：确保所有算子节点的必填参数已正确填写；
- 校验通过后，画布上方将提示 `图结构校验通过，可发布生产版本`。

---

## 3. 发布版本与触发运行

1. **发布版本**：点击【发布版本】，输入版本描述（如 `v1.0.0 - 初始基线发布`），系统将冻结当前拓扑结构与节点算子版本；
2. **触发运行**：
   - 点击【运行已发布版本】；
   - 系统向后端提交执行请求，自动生成全局唯一的 `run_id` 与 `trace_id`，并引导跳转至任务运行详情页。
