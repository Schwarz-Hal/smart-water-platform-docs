---
id: scenario.fengtai-leakage-demo
title: 丰泰风光苑漏损快速试用与结果解释
document_type: scenario
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, project_stakeholder]
related_modules: [M05, M06]
related_apis:
  - /api/v1/demos/fengtai-leakage/manifest
  - /api/v1/demos/fengtai-leakage/analyze
  - /api/v1/demos/fengtai-leakage/topology
  - /api/v1/demos/fengtai-leakage/simulate
owners: [algorithm-team]
reviewed_at: 2026-09-02
summary: 使用一年期丰泰风光苑数据完成水量平衡、风险排序和压力情景试算。
---

# 丰泰风光苑漏损快速试用与结果解释

## 用途

本页用于快速了解丰泰风光苑的历史漏损风险线索。它适合项目演示、方案讨论和巡检优先级排序，不替代现场核验。

## 数据范围

演示数据覆盖约一年：总表有 35,042 条 15 分钟观测；533 只远传户表先按本地日期汇总；27 只机械表按计费月份汇总。管网拓扑包含 886 个节点、899 条管道、7 个阀门和 3 个消火栓。输出不展示住户姓名、地址或个人表号。

## 分析流程

页面依次展示数据概览、历史水量平衡、风险排序和拓扑定位线索。水量平衡以总表进水量与户表汇总的差值形成未解释水量代理指标；分析接口在选定的 30 天窗口内比较日覆盖和可用平衡数据。风险结果按证据和数据质量排序，拓扑视图帮助把高风险线索关联到邻近资产。可点击具体日期查看输入覆盖、未解释水量和风险信号。

## 如何解读结果

- 数据覆盖表示当天有多少户表贡献了可用读数；覆盖不足时，平衡结果应降低可信度。
- 未解释水量是入口与户表汇总之间的差值代理，不等于确认漏损量；还可能受计量边界、读数时差和未纳入用水影响。
- 风险排序表示检查优先级。高分应促成阀门状态、仪表和现场用水记录的复核，不表示已经确认漏点。
- 拓扑高亮表示与风险线索相关的节点或管段，不能单凭高亮确定泄漏位置。

## 压力管理情景试算

页面可用入口压力变化试算相对流量变化：

`L1 / L0 = (P1 / P0)^N1`

其中 `L0`、`L1` 是调整前后的相对漏失量，`P0`、`P1` 是调整前后的压力，`N1` 是压力指数。输入和输出均为情景估计；页面会显示采用的压力值和指数，便于复核假设。

## 严格边界

本页给出的是巡检优先级，不是已确认漏损。水量平衡是代理指标；系统不会实际控制阀门，也不会向现场设备下发压力命令。演示不包含经过校准的水力模型，因此压力情景不能作为运行设定或安全保证。

## 参考资料

- [EPANET](https://www.epa.gov/water-research/epanet)
- [WNTR 文档](https://usepa.github.io/WNTR/)
- [FAVAD 关系概述](https://doi.org/10.1061/(ASCE)0733-9496(2000)126:6(299))
- [最小夜间流量方法说明](https://ukwir.org/minimum-night-flow)
