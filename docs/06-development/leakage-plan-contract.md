---
id: development.leakage-plan-contract
title: 漏损闭环执行方案契约
document_type: development
document_version: 1.1.0
status: draft
locale: zh-CN
audience: [developer]
related_modules: [M03, M04]
related_operators: []
related_apis: []
owners: [backend-team]
reviewed_at: 2026-09-11
summary: 说明可选LeakagePlan、执行快照、缓存隔离与前端资产显示状态的边界。
---

# 漏损闭环执行方案契约

## 接口与兼容性

通用前缀为 `/api/v1/demos/leakage-closed-loop`，旧 `/api/v1/demos/fengtai-leakage` 路径继续可用。

- `GET /plan-catalog` 无需登录，返回 `schema_version`、`default_plan`、`preset_plans` 和 `stages`。每个阶段包含稳定 `code`、标题、必需标记、依赖、参数Schema及默认值。
- `POST /analyze` 保持原鉴权：登录且具有 `workflow:run` 权限。原 `start_date`、`end_date`、`preset` 不变，新增可选 `plan`。
- 省略 `plan` 时继续使用旧分析实现，不替换旧结果或默认计算。提交方案时使用独立配置计算分支。

学习型方案必须通过新增后台 `/runs` 路径执行，不在同步 `/analyze` 请求中训练。旧统计方案序列化在没有learning时不增加该字段，旧统计方案与分析ID保持兼容。

示例为设置上周期基线，其他字段由Schema默认值补齐：

```json
{
  "start_date": "2025-01-01",
  "end_date": "2025-01-07",
  "preset": "balanced",
  "plan": {
    "schema_version": "1.0",
    "stages": {
      "seasonal_96_slot_forecast": {
        "enabled": true,
        "method": "seasonal_lag",
        "season_length": 96
      }
    }
  }
}
```

日期仅示意请求格式，实际范围必须位于所选数据包支持的窗口内。方案和各阶段模型拒绝未声明字段；边界和枚举按Pydantic参数Schema校验。调用方应读取目录，不自行维护另一套参数默认值。

## 阶段参数与依赖

| 阶段代码 | 参数与默认值 |
| --- | --- |
| `data_intake` | `enabled=true`且不可关闭 |
| `quality_score` | `minimum_score=80`，范围0—100 |
| `data_governance` | `method=linear`，可选none／linear／pchip／kalman／saits_imputation；`max_gap_points=4`（1—96）；`outlier_policy=flag_only`或none；`hampel_threshold=3.5` |
| `seasonal_96_slot_forecast` | `method=historical_slot_median`，另可选seasonal_lag／dlinear／patchtsmixer／patchtst；`season_length=96`（4—672）；`band_mad=3` |
| `persistent_residual_ewma_cusum` | `method=ewma_cusum`，另可选robust_residual／seasonal_robust_anomaly／isolation_forest_ts／beatgan／tranad；EWMA alpha 0.2、阈值2.2；CUSUM allowance 0.5、阈值8、decay 0.95；残差阈值3；持续4点 |
| `night_flow_water_balance` | `start_hour=2`、`end_hour=4`；起止小时分别允许0—23、1—24，且前者小于后者 |
| `network_candidates` | `limit=8`（1—100）、`min_confidence=0`（0—1） |
| `response_advice` | 仅执行开关 |

除必需接入外，每个阶段默认启用。依赖链为基线→异常识别→候选管段→处置建议。前端提示无效开关组合，服务端依据实际依赖将对应阶段置为 `skipped`，并给出 `unavailable_reason`。质量未过阈值只产生 `passed=false`，不构成全链路硬门禁。

`season_length`只影响季节滞后方法；历史同刻中位数仍按每日96个15分钟位置分组。分数是此场景的阈值量，不是概率。候选的 `min_confidence` 对既有候选证据字段进行过滤，不新增概率校准模型。

## 计算与数据范围

配置治理从总表原始观测重建流量与压力序列。接入阶段仍按既有规则去重并对齐到15分钟；随后只填完整短缺口的内部位置，不再替换对齐后的非缺失观测，长缺口和边界缺口保留。PCHIP禁止外推；Kalman使用局部水平平滑及固定观测／过程方差1.0、0.01。Hampel只标记，不替换观测，原始文件不写回。

历史同刻中位数使用整个选定时段，是回顾基线。季节滞后取此前周期值，并仅使用此前残差估计尺度。缺测或尺度尚未建立时保留无效分数。EWMA／CUSUM使用有符号残差；CUSUM包含衰减项，并在无效位置清空状态。MAD带不是校准后的概率预测区间。

这些配置针对入口总表15分钟序列。节点日级与管段拓扑代理的计算仍保持已有语义，不能宣称配置参数已传播成逐节点高频模型。新方案关闭某些阶段时相应图层不可用；图层显示开关与阶段执行开关不是同一状态。

## 学习型方案与时间隔离

`plan.learning`可选；选中学习型方法后，后台按默认 `mode=auto_pretrain` 补全。学习配置包括 `device=auto`（也可cpu／cuda）、`epochs=10`（通常1—30）、`window_length=96`（16—384）、`horizon=16`（1—96）、`training_fraction=0.5`、`calibration_fraction=0.2`、`threshold_quantile=0.99`、`seed=42`。BeatGAN和TranAD至少训练2轮，其余方法保持1—30轮配置范围；训练与校准比例之和不得超过0.9，BeatGAN窗口必须为32的倍数。`execution_id`由服务端写入运行标识，调用方不应以它选择历史运行。

支持精确算法版本0.1.0的DLinear、PatchTSMixer、PatchTST；季节稳健、Isolation Forest、BeatGAN、TranAD；以及SAITS。季节稳健、Isolation Forest及SAITS0.1.0训练实现始终使用CPU。支持CUDA的提供者在auto模式下以GPU健康状态选择设备：健康但忙仍排队，不可用才回退CPU并返回 `device_reason=GPU_UNAVAILABLE`；CUDA执行失败不自动重新路由CPU。混合任务可以进入GPU Worker，但CPU方法不因此切换设备，各模型的 `training_device`记录实际训练设备。

训练段、校准段、评测段按时间顺序分开。训练从原始流量训练段选择最长的合格连续观测，当前最小长度为 `5 * (window_length + horizon)`；不压缩缺失间隔。预测使用此前完整原始窗口，缺失上下文直接跳过，评测只对独立评测段中可对齐的原始观测计算MAE、RMSE和有效／期望点数。SAITS修复可使用后续上下文，但这些修复值不进入预测训练或误差对照；压力保持原值。

检测使用独立校准段确定阈值，并将原始分数除以阈值得到比值r。评测段展示 `100 * max(r,0) / (1 + max(r,0))`，阈值为50，保留未截断的 `anomaly_ratio`；该值非概率。训练／校准及无效位置保留缺失，不显示为正常零分。旧统计方案的分数含义不改写。

评测段没有有效对照或检测分数时，执行报错，不以空数组或NaN生成100分、高风险或评测成功结论。

## 后台接口、进度与模型复用

| 接口（通用及旧前缀均支持） | 权限与结果 |
| --- | --- |
| `POST /runs` | HTTP 202；要求 `workflow:run`和`algorithm:train`；必须提交plan且至少选中一种学习型方法；返回run_id、task_id、device、device_reason |
| `GET /runs/{run_id}` | 仅创建者或管理员；返回MySQL状态、progress、state_revision、取消标记、安全错误、阶段detail和成功后的result |
| `GET /runs/{run_id}/frames` | 仅创建者或管理员，成功后返回时间轴快照 |
| `GET /runs/{run_id}/assets/{asset_id}` | 仅创建者或管理员，使用冻结证据恢复资产分析 |
| `POST /api/v1/tasks/{task_id}/cancel` | 复用已有任务取消能力与权限，不新增另一套取消状态 |

MySQL任务是最终状态来源，`run_id`与`task_id`一致；本地快照只补充阶段输出和结果。前端2秒串行检查状态，短暂读取失败不结束追踪，终态停止轮询；URL参数 `leakage_run`用于刷新恢复。进度是阶段进度，不把单轮训练比例当成整个分析完成比例。取消在检查点确认；frames、result与evidence写入后，任务才转success。

训练通过现有算法生命周期和模型存储执行。复用键包含创建者、训练帧摘要、精确算法版本和实际训练参数；仅复用成功训练及就绪模型／权重，不跨用户复用。模型、权重、训练记录使用已有持久化机制，结果中的learning_report记录算法版本、模型ID、训练ID、数据摘要及是否复用，不将临时内存模型当作已保存模型。

学习运行快照位于场景数据包父目录 `leakage-learning-runs`。API和Worker必须访问同一目录，并与场景数据及原 `leakage-plan-snapshots`一起备份。该目录保存阶段进度、结果、时间轴和分析证据；不能作为可任意清理的缓存。无新增数据库迁移。

不存在、无权或已删除的运行返回404 `LEAKAGE_RUN_NOT_FOUND`；结果未完成返回409 `LEAKAGE_RESULT_NOT_READY`；快照缺失返回404 `LEAKAGE_RESULT_UNAVAILABLE`。无后台服务返回503 `LEAKAGE_ASYNC_UNAVAILABLE`；显式CUDA不可用返回409 `CUDA_TRAINING_UNAVAILABLE`。训练、校准或评测历史不足及执行错误进入失败终态，CUDA错误不隐式转CPU重试。提交后数据摘要变化会以 `LEAKAGE_SOURCE_CHANGED`失败，需重新提交。

## 快照、标识与缓存

服务端先校验并补齐默认值，再对规范化方案进行排序JSON编码和SHA256计算。提交后的响应增加 `plan` 与 `plan_hash`，相关时间轴和资产分析响应携带对应摘要。配置计算标记 `configured_engine_version` 当前为 `1.0.0`，随配置结果返回并参与分析ID；修改计算数学逻辑时必须提升该版本。分析ID使用独立 `fengtai-plan-` 前缀，并将方案摘要及配置引擎版本纳入原有数据／窗口身份；不同方案不共用旧分析ID。

总表检测缓存键增加方案摘要，时间轴缓存按分析ID隔离。方案文件同时记录窗口、预设和摘要，原子写入；相同ID不覆盖已有文件。重启后通过分析ID读取冻结方案，再核对日期、预设与数据身份，不根据当前默认参数重建旧方案。

默认持久化目录为场景数据包父目录下的 `leakage-plan-snapshots`；构造服务时可用 `plan_dir`显式指定。目录随场景数据一起备份，保留读写权限，勿随临时缓存清理。当前上限2048个方案文件，达到上限需要运维检查保留策略，不自动删除历史快照。本轮不新增数据库迁移。

| 情况 | 响应 |
| --- | --- |
| 请求方案结构或范围错误 | HTTP 422；HTTP模型校验错误，或服务层 `FENGTAI_DEMO_PLAN_INVALID` |
| 快照无法写入或容量达到上限 | HTTP 503，`FENGTAI_DEMO_PLAN_STORE_UNAVAILABLE` |
| 冻结快照缺失 | HTTP 404，`FENGTAI_DEMO_PLAN_UNAVAILABLE`；需重新分析 |
| 分析标识与数据／参数不匹配 | HTTP 409，`FENGTAI_DEMO_ANALYSIS_MISMATCH` |

## 资产图例与前端职责

`leakage-asset-style`根据显式节点类型和管径生成类别，不依赖资产名称猜测。节点以圆形、菱形、三角形、方形、环形、圆柱形区分类别；管段按≤100 mm、100—200 mm、>200 mm和未知管径分批，100归小管、200归中管。符号和粗细为视觉分级，不是物理比例。

渲染缓存共享几何体和材质，实例批次保留颜色。图例隐藏只改变批次可见性，不修改方案或分析结果；拾取和搜索排除隐藏资产，隐藏当前类别会清除选中，显式重选可恢复其类别。相机按整体边界和视口适配，支持重置透视／俯视；不得因隐藏图层而声称某类设备不参与计算。

分析图层按分析量覆盖基础配色，类型形状仍保留。前端分别维护“下一次配置”草稿和“本次执行配置”快照，编辑草稿不删除旧结果，也不更新旧结果的执行参数。开发者离线目录可提供配置元数据，但配置执行必须明确拒绝，不返回冒充实时计算的固定结果。

## 验证依据与排除范围

行为依据为 `LeakagePlan`、`configured_analytics`、`plan_store`、场景服务及HTTP路由；前端依据为阶段配置组件、方案校验和资产样式／场景实现。已有针对性测试覆盖短缺口修复保留峰值、长缺口保留、检测状态恢复、季节滞后预热及类型边界／隐藏拾取。测试通过记录与部署记录由维护计划分别登记。

不包含水力仿真、真实泵阀控制或逐管流量压力测量补全。Chronos-Bolt因没有就绪本地权重未加入闭环。部署进度及GPU实机验收以维护与发布记录为准；实际业务效果需要独立对照验证，本节不将功能说明作为验收通过记录。
