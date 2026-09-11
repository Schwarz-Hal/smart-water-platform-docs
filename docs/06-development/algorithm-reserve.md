---
id: development.algorithm-reserve
title: 治理、异常检测与预测算法扩充
document_type: development
document_version: 0.1.0
status: draft
locale: zh-CN
audience: [algorithm_user, developer]
related_modules: [M03, M04]
related_operators: [pchip_repair_dataset_v1, kalman_repair_dataset_v1, saits_imputation, isolation_forest_ts, matrix_profile_anomaly, beatgan, tranad, dlinear, patchtsmixer, patchtst, chronos_bolt]
related_apis: []
owners: [algorithm-team]
reviewed_at: 2026-09-10
summary: 新增算法的运行表面、模型生命周期、缺失处理、效果与耗时评估边界。
---

# 治理、异常检测与预测算法扩充

本文记录新增版本的实现和接入限制。登记算子、通过小样本测试、完成主线合并和实际部署是不同状态；本文不宣称已完成真实管网效果或全年全网性能验收。

## 用途与权限

扩充候选方法，使用户可以按效果和耗时选择，而不是预先把某个深度模型设置为所有数据的默认方法。操作继续使用现有数据读取、治理、训练、模型和工作流权限，不新增权限或隐式获取其他用户数据。

| 类别 | 新增能力 | 本版运行表面 | 模型要求 |
| --- | --- | --- | --- |
| 数据治理 | [PCHIP](../05-algorithms/pchip-repair.md)、[Kalman](../05-algorithms/kalman-repair.md) | 数据文件治理及数据集工作流 | 无训练；Kalman 使用固定噪声方差。 |
| 学习式修复 | [SAITS](../05-algorithms/saits-repair.md) | 单通道工作流，不声明数据文件治理模型绑定 | 显式训练后绑定模型；可显式运行内训练。 |
| 异常检测 | [Isolation Forest](../05-algorithms/isolation-forest-ts.md)、[Matrix Profile](../05-algorithms/matrix-profile-anomaly.md)、[BeatGAN](../05-algorithms/beatgan.md)、[TranAD](../05-algorithms/tranad.md) | 单通道工作流 | 冻结训练模型或参考库及后段校准阈值。 |
| 学习式预测 | [DLinear](../05-algorithms/dlinear.md)、[PatchTSMixer](../05-algorithms/patchtsmixer.md)、[PatchTST](../05-algorithms/patchtst.md) | 单通道工作流 | 显式训练模型，保存训练与验证分段。 |
| 零样本预测 | [Chronos-Bolt Small](../05-algorithms/chronos-bolt.md) | 单通道工作流 | 预先导入并绑定可信本地权重，无本地训练。 |

上述算法提供者版本为 `0.1.0`，新增算子版本为 `1.0.0`；PCHIP 与 Kalman 作为治理处理器登记，不另造可训练算法版本。已发布旧版本不改成新默认值。

## 请求与使用流程

1. 先选精确源版本、点位、指标及时间范围，确认当前缺失和采样间隔。
2. 修复只处理缺失，不把持续高流量、启停平台、压力阶跃自动替换。PCHIP 与 Kalman 在数据文件治理可创建新版本或新文件；工作流先形成 stage。
3. 新异常检测及预测输入均要求规则且有限的单通道时序。SAITS 的输入端口和训练数值字段显式声明 `allow_missing: true`，保留真实空值；未声明的旧端口仍维持原来不接受缺失的行为。无效文本不自动当成缺失。
4. 需要学习或参考库的方法先完成独立训练并选择模型，或明确选择 `fit_on_run`。运行内训练也生成训练记录和模型，普通推理不能偷偷重新拟合。Chronos-Bolt 使用另行准备的可信本地模型包。
5. 在“快速试用 → 单算法试用”选择新的异常检测或预测方法后，先核验算法与模型状态。选择属于当前精确版本的已有模型，或对可训练方法明确启用本次运行先训练；Chronos-Bolt 不能选择运行内训练。缺少模型或就绪条件时不能直接运行。入口选择不代表已获得效果保证，也不应覆盖原工作流。

### 从快速试用开始治理

进入“快速试用 → 数据治理”可匿名浏览平台示例。点击“配置治理”后才要求登录，再打开现有治理工作台的修复目录，选择 PCHIP 或 Kalman、调整参数并确认派生输出。内置示例不被覆盖；治理关闭后可继续查看运行，结果跳转指向本次生成的精确文件版本。

“从数据中心选择其他数据”用于已有数据的治理。SAITS 的“配置 SAITS 模型”按钮进入独立模型训练页；当前 SAITS 推理只在工作流运行，不会混入数据文件治理修复目录，也不由该按钮直接训练或推理。

复用现有训练、模型绑定和工作流提交契约，不引入以用户 import path 执行代码的接口。模型只承载数据，训练数据和权重不得提交进代码仓库。

### 安装与实际 Worker 核验

在 Neo 后端的目标运行环境按已提交的依赖锁安装算法扩展：

```bash
uv sync --locked --extra algorithm-reserve
```

执行测试时额外启用开发依赖，不将它作为运行要求：

```bash
uv sync --locked --extra algorithm-reserve --extra dev
```

随后使用实际 CPU Worker 的 Python 解释器执行，不用 API 进程或其他虚拟环境的导入成功替代：

```bash
python scripts/check_algorithm_reserve_runtime.py
```

该脚本检查数值依赖、CPU 张量运算、插补及模型架构运行；不下载权重、不写数据库、不启动服务。检查通过只证明运行能力，输出中的 `pretrained_weights_verified` 仍为 `false`，模型制品就绪单独核验。即使使用脚本的随机 Bolt 架构检查，也不代表可信预训练权重可用。选择 CUDA 的任务还须检查对应 Worker 的 CUDA 资源。

## 响应与结果解释

PCHIP／Kalman 的数据文件治理结果复用变更集、完整缺失问题掩码和溯源制品；工作流 stage 只沿用现有数据集与参数血缘契约，不额外提供相同的掩码下载端口。SAITS 工作流直接输出修复时序、缺失掩码表及报告，超限和首尾缺失仍为 `null`。

新异常检测输出原始分数、校准阈值、标签、完整时间轴和有效性掩码。窗口预热期为 `null/false`，不是正常分数。不同算法的分数不能直接相加比较，也不是概率。回算源数据时，查看模型训练／校准重叠元数据，不将其误称独立在线效果。

DLinear、PatchTSMixer、PatchTST 输出点预测，不生成未校准区间；Chronos-Bolt 输出预训练 P10/P50/P90，尚不代表本地覆盖率。SAITS 使用未来上下文做离线补全，不用于宣称在线检出能力。

### 效果与耗时的比较方式

| 能力 | 建议效果指标 | 主要耗时来源 |
| --- | --- | --- |
| 缺失修复 | 已知观测遮蔽后的 MAE、峰值保留、积分偏差、未缺失点修改比例 | 读取与排序、插值或状态平滑；SAITS 另计训练及模型加载。 |
| 异常检测 | 每点位每天误报事件数、事件检出率、发现延迟、人工复核命中率 | 特征提取、训练、模型加载、逐窗口推理；Matrix Profile 另计参考比较和首次编译。 |
| 时序预测 | MAE／MASE、峰值误差、日累计量误差；有概率输出时看覆盖率与区间宽度 | 训练、模型加载、上下文长度、预测长度、批量推理。 |

这些是评估方案，不是已测结果。比较时固定源数据、硬件、分段、窗口与预算，分别记录读取、训练、首次加载、已加载推理及页面到结果的总耗时。公共论文数字不能替代平台全流程实测；小样本数值可运行也不等于真实效果更好。

本轮已执行数值冒烟与训练／模型回读检查。Chronos-Bolt 另使用官方 Small 真实权重完成 288 点输入、16 点预测检查，输出有限且分位数不交叉，并验证约 191 MB 模型 ZIP 的解析路径。这些证明实现与制品可运行，不构成真实管网预测精度、覆盖率或生产耗时评价。

训练选择与最终评估分开。缺少真实标注时，人工复核与合成异常注入结果分开汇报；不能只用经过 point adjustment 的 F1 宣称质量提升。保留既有轻量基线参与同条件对照。

## 错误与重试

- 缺失依赖、CUDA 或可信模型时明确失败；修复模型不退回普通插值，深度模型不返回随机权重结果。
- 时间无效、重复、采样不规则及非数值输入须先明确治理。Kalman 固定局部水平模型不接受待修复组的非规则采样；SAITS 不自动制造缺少的时间行。
- SAITS 每次最多 200000 点；Matrix Profile 参考库最多 5000 行、每次比较最多 2000 万对子序列。超限应缩小分析范围，不以隐藏截断或采样规避限制。
- 学习式预测的请求长度不得超过模型训练输出容量，采样间隔必须匹配，预测起点不能早于模型训练／验证结束。
- 参数、数据或模型不匹配不是临时网络故障，应修正配置后创建新运行，不重复提交同一错误任务。

依赖和模型是否已经在实际 Worker 环境安装须由运行环境检查确认。当前文档不包含部署、下载权重、修改业务数据或启动长期训练的授权。

## 实现与参考资料

平台依据为 Neo 新增算子 manifest、对应算法 `versions/0.1.0` 实现与 `SOURCES.md`，以及治理 `advanced_repair.py`。各方法的原论文、官方实现、适配差异和许可来源列在上表链接的独立指南中；本次没有新增图像资产。

本版未接入 GDN、CSDI；SAITS、TranAD 和预测候选也不能仅凭论文名称被解释为已经具有多传感器、管网图或概率补全能力。
