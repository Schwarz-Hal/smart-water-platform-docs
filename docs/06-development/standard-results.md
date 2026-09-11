---
id: development.standard-results
title: 标准结果契约与可视化接入
document_type: development
document_version: 1.0.0
status: draft
locale: zh-CN
audience: [developer, algorithm_user]
related_modules: [M03, M04]
related_operators: [beatgan, tranad, isolation_forest_ts, matrix_profile_anomaly, dlinear, patchtst, patchtsmixer, chronos_bolt]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-09-11
summary: 统一异常、预测与评测输出协议，按业务类型复用可视化并兼容历史制品。
---

# 标准结果契约与可视化接入

## 范围与版本

同类算法输出共同业务结构，前端按结果类型和协议版本选择组件，不按算法名称分别绘图。外层制品继续使用现有存储、权限和SHA校验；本轮没有数据库迁移。

异常检测、预测和评测采用 `sw.result` 协议1.0。新算法算子以新版本显式声明 `result_schema`，旧算子版本及旧制品不修改。算法Provider、模型版本和权重不会因显示升级而重训。治理、质量、C1、S01和普通输出在读取侧适配，不将历史字节改写为新协议。

## 公共结构

标准文档放在JSON制品的payload中：

```json
{
  "schema": "sw.result",
  "schema_version": "1.0",
  "result_type": "anomaly_detection",
  "provenance": {"operator": {"code": "beatgan", "version": "1.1.0"}},
  "series": [],
  "metadata": {}
}
```

上例仅说明字段位置，空series不是有效异常结果。provenance记录已知的精确算子、算法、运行、节点和模型摘要，不推断缺少的点位或单位。评测文档使用scope和metrics代替series。

## 异常检测

每个series包含id、metric、times、observed、scores、labels、validity_mask，以及score描述。可选point_id、unit和threshold；未来支持多序列时各序列独立声明指标，不能将不同单位无区别拼成同一条线。

- 时间与数值数组一一对应，时间唯一递增。
- observed来自本次实际绑定输入，不读取来源文件最新版本。
- labels为0、1或null；预热分数与标签为null，validity_mask为false。
- score记录direction、meaning及is_probability。当前适配检测器均为分数越高越异常，原始分数不是概率。
- threshold是模型或规则提供的阈值，不能为了视觉效果重标定为0—100。
- metadata保留训练重叠范围和causal_evaluation等事实。回算训练数据不等于独立效果评测。

## 时序预测

每个series包含forecast_origin、目标times、values、validity_mask和history。预测起点及间隔来自本次绑定输入，并与Provider元数据核对。

可选quantiles、interval及actual。interval包含lower、upper，仅已知概率语义时声明coverage。没有区间时省略，不补零、不默认95%。Chronos的P10/P90对应80%分位范围，但其本地覆盖率仍需真实数据验证。

actual只有在获得真实观测且时间对齐后才存在。未来尚未观测时不得生成MSE。历史上下文只用于显示和追溯，不当作未来真实值。

## 评测

scope包含split、sample_count、alignment和missing_policy，并尽可能记录实际时间范围。split默认unknown；用户指定train、validation、test或backtest只描述来源用途，不替代独立划分验证。

metrics每项包含name、value、direction、status，可选unit和reason。回归评测提供MSE、MAE、RMSE，来自明确对齐的真实值与预测值。MSE的单位应为原单位平方；来源单位未知时不猜测物理单位。

没有有效对照不能补成零分。训练过程的loss、重构MSE和最终预测误差用途不同，必须分别标识。无真实异常标签时不能计算真实Precision、Recall或F1。

## 前端组织

`shared/results`中contracts定义视图结构，adapters负责标准及历史读取，services处理精确制品加载，components按结果类型拆分，charts封装共用图表宿主和时间轴。业务页面只组织结果和操作，不复制异常或预测图表。

默认显示可视化；明细和运行依据为辅助入口，原始JSON按需展开。无法识别的内容使用字段树和表格保留，不凭字段名随意推断概率或业务风险。

关联观测只能来自标准结果已有history/observed，或冻结图中明确的上游时序制品。找不到可靠输入时只展示算法结果。对象存储不意味着截断；显示范围以实际制品预览信息为准。

## 兼容与验收

旧异常JSON、旧预测结果、C1多端口和S01报告通过只读适配展示。旧版请求和制品仍可下载；不重算历史运行，不覆盖已发布算子目录。

关键验收包括旧版本输出不变、新版本数组对齐、预热null、无区间点预测、已知误差指标、标准与历史结果共用组件、对象制品读取、异常状态恢复和窄屏交互。部署状态和实际结果见Neo维护计划，不以文档存在替代验收。
