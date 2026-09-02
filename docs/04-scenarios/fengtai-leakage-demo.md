---
id: scenario.fengtai-leakage-demo
title: 丰泰风光苑漏损快速试用与结果解释
document_type: scenario
document_version: 1.1.0
status: published
locale: zh-CN
audience: [platform_user, project_stakeholder]
related_modules: [M05, M06]
related_apis:
  - /api/v1/demos/fengtai-leakage/manifest
  - /api/v1/demos/fengtai-leakage/analyze
  - /api/v1/demos/fengtai-leakage/topology
  - /api/v1/demos/fengtai-leakage/assets/{asset_id}
owners: [algorithm-team]
reviewed_at: 2026-09-03
summary: 使用一年期丰泰风光苑数据完成质量治理、水量平衡和管网巡检优先级分析。
---

# 丰泰风光苑漏损快速试用与结果解释

## 用途

本页用于快速了解丰泰风光苑的历史漏损风险线索。它适合项目演示、方案讨论和巡检优先级排序，不替代现场核验。

## 数据范围

演示数据覆盖约一年：总表有 35,042 条 15 分钟观测；533 只远传户表先按本地日期汇总；27 只机械表按计费月份汇总。管网拓扑包含 886 个节点、899 条管道、7 个阀门和 3 个消火栓。输出不展示住户姓名、地址或个人表号。

## 分析流程

页面提供八个可点击的步骤：数据接入、质量检查、数据治理、趋势基线、异常筛查、水量平衡、候选管段和建议。点击任一步可切换查看对应结果；完成状态表示该步骤已经纳入本次分析。水量平衡以总表进水量与户表汇总的差值形成未解释水量代理指标；分析在选定的 30 天窗口内比较日覆盖和可用平衡数据。风险结果按证据和数据质量排序，拓扑视图帮助把高风险线索关联到邻近资产。图中的流量和压力均来自丰泰风光苑入口总表，不代表全管网逐点平均值。

## 查看管网资产

在管网图中点击管段、阀门或消火栓，可查看该资产的基础属性、相邻关系，以及当前分析窗口对应的曲线。资产详情按所选的开始和结束日期读取，公开访问地址为 `GET /api/v1/demos/fengtai-leakage/assets/{asset_id}?start_date&end_date`。

曲线旁会标明测量范围：

| 测量范围 | 含义 | 当前演示中的解释 |
| --- | --- | --- |
| `direct` | 曲线来自与该资产直接匹配的测点。 | 可作为该资产的直接观测参考。 |
| `community_reference` | 曲线来自小区入口总表。 | 仅用于了解小区级变化，不能视为该资产的直接测量。 |

当前演示包没有资产与直接测点的匹配关系，因此所有资产曲线均为 `community_reference`。查看资产曲线可帮助理解所处小区的用水变化和邻接关系，但不能据此确认该资产存在漏损。

## 如何解读结果

- 数据覆盖表示当天有多少户表贡献了可用读数；覆盖不足时，平衡结果应降低可信度。
- 未解释水量是入口与户表汇总之间的差值代理，不等于确认漏损量；还可能受计量边界、读数时差和未纳入用水影响。
- 风险排序表示检查优先级。高分应促成阀门状态、仪表和现场用水记录的复核，不表示已经确认漏点。
- 拓扑高亮表示与风险线索相关的节点或管段，不能单凭高亮确定泄漏位置。
- 资产属性和相邻关系可用于安排现场核验；若曲线标为 `community_reference`，应把它理解为入口总表的小区级参考，而不是资产直接测量。

## 严格边界

本页给出的是巡检优先级，不是已确认漏损。水量平衡是代理指标；当前演示不包含经过校准的水力模型。任何候选管段或资产曲线都应结合现场巡检、仪表状态和用水记录复核。

## 参考资料

- [EPANET](https://www.epa.gov/water-research/epanet)
- [WNTR 文档](https://usepa.github.io/WNTR/)
- [最小夜间流量方法说明](https://ukwir.org/minimum-night-flow)
