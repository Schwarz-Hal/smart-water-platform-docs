---
id: scenario.fengtai-leakage-demo
title: 丰泰风光苑漏损快速试用与结果解释
document_type: scenario
document_version: 1.2.0
status: published
locale: zh-CN
audience: [platform_user, project_stakeholder]
related_modules: [M05, M06]
related_apis:
  - /api/v1/demos/fengtai-leakage/manifest
  - /api/v1/demos/fengtai-leakage/analyze
  - /api/v1/demos/fengtai-leakage/topology
  - /api/v1/demos/fengtai-leakage/assets/{asset_id}
  - /api/v1/demos/fengtai-leakage/analyses/{analysis_id}/frames
  - /api/v1/demos/fengtai-leakage/analyses/{analysis_id}/assets/{asset_id}
owners: [algorithm-team]
reviewed_at: 2026-09-03
summary: 使用一年期丰泰风光苑数据完成质量治理、水量平衡和管网巡检优先级分析。
---

# 丰泰风光苑漏损快速试用与结果解释

## 用途

本页用于快速了解丰泰风光苑的历史漏损风险线索。它适合项目演示、方案讨论和巡检优先级排序，不替代现场核验。

## 数据范围与入口粒度

演示数据覆盖约一年：入口总表有 35,042 条 15 分钟观测；533 只远传户表先按本地日期汇总；27 只机械表按计费月份汇总。管网拓扑包含 886 个节点、899 条管道、7 个阀门和 3 个消火栓。输出不展示住户姓名、地址或个人表号。

映射文件提供 513 个住宅拓扑节点：511 个节点有历史数据，2 个节点只有映射而无历史数据；另有 22 个一层户表记录没有对应拓扑节点，不进入节点级输出。

入口总表的资产详情接口（`/assets/{asset_id}`）按 15 分钟读取入口流量和压力；分析后的管网状态接口（`/analyses/{analysis_id}/assets/{asset_id}`）使用节点日数据并按日返回状态序列。两者粒度不同，不能把入口总表的 15 分钟曲线当作节点日状态轴。

## 分析流程

页面提供八个可点击的步骤：数据接入、质量检查、数据治理、趋势基线、异常筛查、水量平衡、候选管段和建议。点击任一步可切换查看对应结果；完成状态表示该步骤已经纳入本次分析。水量平衡以入口总表进水量与户表汇总的差值形成未解释水量代理指标；分析在选定的 30 天窗口内比较日覆盖和可用平衡数据。风险结果按证据和数据质量排序，拓扑视图帮助把高风险线索关联到邻近资产。

## 管网状态时间轴与图层

运行分析后，页面加载 `GET /analyses/{analysis_id}/frames`。状态轴为日粒度（`interval_minutes: 1440`），每个时间点对应选定日期的一天；默认显示最后一天，可前后步进或播放。可切换的图层包括：

- 节点下游日需水量（`node_demand_m3d`，推导，m³/d）；
- 节点下游异常分（`node_anomaly_score`，推导，score）；
- 管段流量代理（`pipe_flow_proxy_m3h`，估算，m³/h）；
- 管段漏损风险（`pipe_leak_risk`，推导，score）；
- 管段计算置信度（`pipe_confidence`，推导，1）。

图层的实测/清洗后实测/估算/推导标记随返回的 `value_kind` 展示。颜色由绿至红表示当前图层值由低至高；无数据会保留为空值并以无数据样式显示。管段流量和风险不是逐点实测：流量代理由节点日需水量沿确定性 BFS 拓扑聚合并换算，风险结合入口日异常、节点异常、材质、管径和拓扑脆弱性计算，均属于估算或推导结果。

## 点击资产、查看详情与候选跳转

在拓扑图中点击节点、管段或阀门，可打开对应资产详情；图中也展示消火栓等拓扑资产。详情调用 `GET /analyses/{analysis_id}/assets/{asset_id}`，返回资产属性、连接关系、分析窗口和按资产生成的 `state_series`：

- 节点返回节点下游日需水量与异常分。具有历史的节点以 `node_history_aggregate` 作为证据范围；无历史节点无法提供对应历史值时，状态可能为空并按拓扑代理解释。
- 管段返回管段流量代理、漏损风险和计算置信度，证据范围为 `topology_proxy`。
- 阀门按其关联节点返回节点日状态；其证据范围取决于关联节点是否有历史，否则按拓扑代理解释。

候选管段列表按管段自身的时间帧证据排序。点击候选会跳转到候选峰值日期、切换到“候选管段”步骤、打开该管段详情，并滚动到拓扑图，便于从排名回看状态轴和资产属性。

旧的 `/assets/{asset_id}` 详情仍用于入口测点曲线：若资产有匹配的直接测点，返回 `scope: direct`；否则返回入口总表的 `community_reference`，只能作为小区级参考。分析页面的解释应以每个资产自己的 `state_series`、`value_kind` 和 `calculation.evidence_scope` 为准，不对所有资产使用同一种曲线来源描述。

## 如何解读结果

- 数据覆盖表示当天有多少户表贡献了可用读数；覆盖不足时，平衡结果应降低可信度。
- 未解释水量是入口与户表汇总之间的差值代理，不等于确认漏损量；还可能受计量边界、读数时差和未纳入用水影响。
- 风险排序表示检查优先级。高分应促成阀门状态、仪表和现场用水记录的复核，不表示已经确认漏点。
- 拓扑高亮表示与风险线索相关的节点或管段，不能单凭高亮确定泄漏位置。
- 节点无历史或状态序列为空时，不应将其解读为“没有用水”或“没有风险”。

## 严格边界

本页给出的是巡检优先级，不是已确认漏损。水量平衡是代理指标；管段流量与风险为估算或推导结果，当前演示没有校准水力模型，也不执行阀门调节或现场控制。任何候选管段或资产状态都应结合现场巡检、仪表状态和用水记录复核。

## 参考资料

- [EPANET](https://www.epa.gov/water-research/epanet)
- [WNTR 文档](https://usepa.github.io/WNTR/)
- [最小夜间流量方法说明](https://ukwir.org/minimum-night-flow)
