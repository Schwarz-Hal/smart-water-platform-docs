---
id: development.industrial-design-language
title: 青色工业设计语言 v1 与旧页面迁移
document_type: development
document_version: 1.5.0
status: draft
locale: zh-CN
audience: [frontend_developer, designer]
related_modules: []
related_operators: []
related_apis: []
owners: [frontend-team]
reviewed_at: 2026-09-14
summary: 定义主线青蓝工业界面的视觉令牌、智能体执行约定、复用层级与页面迁移验收要求。
---

# 青色工业设计语言 v1 与旧页面迁移

## 用途与权限

本文面向前端开发者与设计者。v1 取代旧版大圆角卡片语言，以深墨色标题条、青色操作强调、小圆角、工程边框和可读内容建立层级。不改变 API、业务权限、任务状态或算法语义，页面继续执行原有鉴权与校验。

青蓝工业风已确认为前端主线的默认设计方向。2026-09-13 的历史核对记录中，前端 main 为 `16bff9b64d524c575927a046e34f257da648b260`，参考界面已随 PR #58 合入，当时部署版本为 `8f19280169ad6e6bee4e960507d7ed10e8a44426`。这些是历史基线，不代表当前服务器版本；当前部署必须读取共享协调板确认。合并主线与部署版本分别记录，不要求两者提交号相同。配套文档 PR #32 仍待合并，不能将本文作者态内容当作已经同步到平台的文档版本。

参考界面主要覆盖快速试用及已接入的公共控件。全局令牌和 Material 外观接入不等于所有页面的布局、控件状态与响应式已经迁移。“迁移要求”约束后续新增与改造，不是存量页面已全部达到或所有算法路径已验收的声明。

本文另记录 `feature/industrial-motion-details` 基于上述 main 的新增动效：该分支当前未提交、未合并、未部署；方框开关、选中上下线、映射展开和菜单退场等新增效果不属于历史部署 `8f19280`。上一轮 1.2.0 的设计指导继续保留，不将其独立前端 guidance 分支与本动效分支视为已集成。

## 智能体执行约定与约束层级

需要运行控件示例、比较状态或查看用法时，参见[青色工业组件实验场](./industrial-playground.md)。该工具使用独立开发构建入口，不是生产业务路由；展示状态和本地交互不代表真实任务执行，新增共享控件的非 CVA API 与接入边界在其开发说明中列出。

实验场当前目录为 `src/playground/playground-catalog.ts` 的 25 项示例，支持 `?example=ID` 独立打开。新增筛选栏、本地排序分页表格、局部 start／end 详情抽屉、任务反馈、文件元信息选择器以及时间范围、时序工具栏、资源层级与属性检查器可作组合参考；多步向导仍是实验场专属 Material Stepper 示例。它们不是 HTTP 或执行引擎：取消只发意图，断线不等于失败，文件选择不读取内容或上传，表格不做服务器分页。这些新增组件仍处于未合并开发分支，源码接入不等于上线。

`ANALYSIS-COMPONENTS-ADOPTION` 已在该分支将快速试用算法／模型版本、任务卡、只读输入时间范围、预览工具栏与训练参数接到相应共享组件，详见[当前接入核查表](./industrial-playground.md#当前快速试用接入核查)。视窗意图仍经过原 applyWindow 点数校验，属性搜索和收起保留完整 Formly；真实上传、跟踪、映射、结果组件不被实验场替代。资源层级是原生 details 导航而非 ARIA tree；UTC+8 时间边界与跨度校验不替代训练最小点数规则。不由此次局部接入宣称全平台已改造或全部分析计划完成。

开始界面任务时，依次阅读前端 `AGENTS.md`、`design-system/smart-water-platform/MASTER.md`、本文完整规范、目标组件及其 Schema／接口／测试，再列出本任务的状态清单。按仓库规则核对共享板、分支与权限后，选择满足目标的最小复用方案。MASTER 仅作入口与摘要，不复制本文形成第二份规范；文档 PR 未合并时，应读取协调记录指定的作者分支，不能把“主线暂时没有文件”当作自行重建规范的理由。若仍无法读取完整规范，说明缺口并依据 MASTER 与已合入代码处理有证据的范围，不声称已完成规范核对。

| 层级 | 执行要求 | 适配边界 |
| --- | --- | --- |
| 必须 | 使用现有语义 tokens 和 Material/CDK；保留真实请求、权限、Schema 校验、状态与数据语义；新改参数区评估并适配 compact 网格；验证键盘、错误和窄容器 | 不全局改变参数表单默认 stacked；简单字段紧凑排列，复杂字段与窄宽可全跨；无法采用时说明原因 |
| 推荐 | 职责清楚的工程面板优先复用 `IndustrialPanelComponent`；必要的轻量进入反馈复用 `PanelMotionDirective` 和动效令牌 | 普通列表或已有清楚结构不必再套面板；无需动效可保持静态，采用时必须可中断并支持减少动态效果 |
| 按需 | 水纹、管线图、工程码、任务索引和定位装饰 | 只有内容预算与任务结构适合时使用；不得为像参考截图而给每页加侧栏、照抄 188px 索引或固定卡片高 |

共享能力与页面组合分开：`shared/components/` 中的面板、参数表单和指令可按现有输入复用；`features/quick-trial/components/` 的模型、输入、运行状态组件依赖快速试用上下文，不是全局任务服务。其他页面应复用底层能力和交互原则，不搬走 `QuickTrialInputState` 或复制任务执行链。改变共享接口前检查全部调用方。

偏离上述要求时，在任务交接或 PR 中记录具体页面、偏离项、内容／可访问性／既有契约原因、替代实现与验证结果。既有例外不自动成为新页面默认；不以“沿用旧代码”或“截图看起来一致”代替理由。

## 请求：迁移输入与边界

改造前列出页面任务、输入、执行状态、结果、权限和错误路径，记录最窄工作区、最长标签与所需数据密度。对比的是内容预算，不是截图列宽比例。保留原有请求、响应和错误处理，不增加模拟预测、伪造进度或等待动画的请求延迟。未取得业务数据时使用明确空态，不绘制假数据填满页面。

## 三层令牌与颜色语义

令牌按“基础值 → 语义用途 → 组件使用”组织。当前 `styles.scss` 提供通用变量，最后调用 `_industrial.scss` 覆盖；三层并非都有独立文件。迁移时消费语义变量，不在每页复制完整色板。

| 层 | 当前入口与示例 | 约束 |
| --- | --- | --- |
| 基础 | 墨色 `#172b34`、青色 `#23c4df`、4px 空间基准 | 原始值集中于主题或必要的局部装饰 |
| 语义 | `--sw-industrial-ink/cyan`、`--sw-color-primary`、`--sw-surface` | 表达操作、表面与状态，不绑定某页面名称 |
| 组件 | Material overrides、IndustrialPanel、图表样式 | 消费语义变量，按内容设置尺寸 |

| 用途 | v1 值或变量 | 边界 |
| --- | --- | --- |
| 标题条／青色强调 | `#172b34`／`#23c4df` | 青色按钮配深色文字，青色不是错误或成功 |
| 主色／悬停／深色／弱底 | `#087b9c`／`#06657f`／`#074c61`／`#dff7fb` | 操作、选择与辅助强调 |
| 页面／表面／弱表面／下沉表面 | `#eef3f5`／`#fbfcfc`／`#f0f3f4`／`#e5edef` | 不用重阴影替代层级 |
| 边框／强边框 | `#c9d7dd`／`#94aab5` | 结构边框通常 1px |
| 正文／次级／辅助文字 | `--sw-text-primary/secondary/muted` | 不用装饰级低对比承担正文 |
| 成功／警告／错误 | `--sw-color-success/warning/danger` | 保留独立语义与状态文字，不统一染青 |
| 焦点 | `--sw-focus` | 全局 `:focus-visible` 为 3px 外环、2px 外偏移 |

轻阴影使用 `--sw-shadow-sm`，浮层可用 `--sw-shadow-md`。圆角令牌 xs 为 2px、sm/md 为 4px、lg/xl 为 6px，局部控件现有 3px。禁止将大圆角软卡片恢复为默认工程面板。当前浅色工业外观不构成深色模式完整验收。

## 字体与空间

界面字体栈为 `Inter, 'Microsoft YaHei UI', 'Microsoft YaHei', system-ui, sans-serif`；Material 主题另配置 Roboto，需检查回退后的真实字宽。不要依赖新增网络字体维持布局。等宽字体用于编号和短工程码，不用于中文正文；时间、指标与表格数字使用等宽数字排布。

| 内容 | 当前尺度 | 迁移要求 |
| --- | --- | --- |
| 快速试用工作台标题 | 20px | 不挤压操作；通用页面标题仍为 26–34px 自适应 |
| 面板标题 | 16px、650 字重 | 保留标题语义与换行能力 |
| 索引任务名 | 15px、600 字重、1.45 行高 | 允许换行，不为固定比例缩字 |
| 正文／密集控件 | 14px、1.5 行高／13px | 按实际内容检查可读性 |
| 辅助信息 | 11–12px | 不承载唯一关键状态 |
| 工程码／装饰标记 | 8–10px | 只辅助，SELECTED 另有 `aria-current` 语义 |

空间优先使用 `--sw-space-*`：4、8、12、16、20、24、32、40、48px。现有局部 14px、18px 等光学校正不是新空间体系；不要机械放大间距稀释任务信息。

## 工程面板解剖与装饰限额

复用 `IndustrialPanelComponent`：1px 外框、8px 外内边距；标题条最小高 36px，标题前 9px 青色方块，右侧工程码，`[panel-actions]` 插入真实操作。内容内边距为 12px 8px 8px。左上与右下各有 12px 定位十字，超出边框 6px，不捕获鼠标。

IndustrialPanel 与工作台总标题共享 `--sw-industrial-hatch` 斜纹令牌，白色条纹为 `#ffffff12`（约 7.1% 不透明度）；定位十字使用强边框色，不遮挡文本或焦点。选中任务点阵为 `#07557135`、7px 网格；蓝图区为 `#7e939a35`、9px 网格，均约 21% 不透明度。管线装饰改用内置 imagegen 生成的透明 PNG，目标线色为灰蓝 `#607b87`，组件整体透明度为 0.9；位图不再适用旧 SVG 的非缩放线宽与辅助轴线参数。

`PipeBlueprintComponent` 的 `variant` 支持 `vertical`、`manifold`、`horizontal`，默认为 `vertical`，分别读取 `public/assets/industrial/pipe-*-v1.png`。快速试用为时序预测选择 vertical、异常检测选择 manifold，其余任务选择 horizontal。图片使用 `object-fit: contain`，高度由 `--sw-pipe-height` 控制，默认 300px；`alt` 为空并设置 `aria-hidden="true"`，不可拖拽、不捕获点击。旧内联 SVG 模板文件保留，但该组件不再引用它。

快速试用容器通过 `.trial-container::before` 在内容底层平铺离线生成的周期光纹，默认 `water-periodic-s42-d8.png`，备选为 s19/d6、s73/d11。CSS `--sw-water-image` 切换图片，`--sw-water-tile-size` 默认 480px，`--sw-water-opacity` 默认 0.32；减小显示尺寸会使视觉纹理更密。底层保持 `pointer-events: none`，没有角落渐隐 mask 或实时 shader。旧用户照片 `water-caustics-v1.webp` 与 `contours-v1.svg` 保留但当前页面不再引用。资源来源及三幅管线 PNG 的最终生成提示词在前端 `design-system/smart-water-platform/decoration-assets.md` 维护，资源不复制到文档中。

`scripts/render-water-texture.py` 仅依赖 Python 标准库，通过周期场生成装饰，不是光学、水力或其他物理仿真。CLI 支持 `--seed`、`--density`、`--size`、`--warp`、`--line-width`、`--output` 与 `--preview`；分别控制随机布局、每边特征密度、输出像素边长、弯曲程度、亮线宽度、输出路径及可选 2×2 平铺预览。输出 PNG 及记录生成器版本、参数、SHA256 的旁车 JSON，同参数与运行环境可复现。每次生成检查 291 项周期场边界/平移关系；采样不重复端点，周期性不要求首尾两列像素逐值相同。使用示例与参数范围维护在上述资源来源文件中。

`swViewportTexture` 以宿主 `getBoundingClientRect()` 的负偏移写入 `--sw-water-x/y`，将纹理原点锚定到视口，内容保持正常滚动。指令在 Angular 区域外监听捕获阶段 `scroll`、窗口 `resize` 和宿主 `ResizeObserver`，通过单个待执行 `requestAnimationFrame` 合并更新，不运行常驻动画；销毁时移除监听、断开观察器并取消待执行帧。该功能的 2026-09-12 交接记录包含前端 200 项测试、周期检查和 2×2 预览检查；当时人工滚动前后对比未完成。后续迁移需核验实际滚动容器，不能将历史单元测试等同于所有页面的视觉验收。

迁移要求：装饰限于标题、索引、专门空白区或页面内容底层，禁止在曲线绘图区叠加点阵、斜纹、定位十字、管线或水纹。坐标网格、预测区间与选区属于数据编码，不是装饰。管线图片和水纹均不承担无障碍内容，不是实际管网拓扑、水位、水力状态或运行结果。状态不能只靠颜色或纹理表达。当前资源已随快速试用参考界面合入并部署，但不是每页必须采用的背景或装饰。

## Material／CDK 组件与状态

| 需求 | 当前组件／机制 | 迁移规则 |
| --- | --- | --- |
| 主次操作 | Material flat、stroked、text 按钮 | 每个操作区一个主动作，状态变化不改变尺寸 |
| 算法／时间范围 | Material `mat-select`、`mat-option`；已部署算法入口使用 `mat-form-field`，新增分支改用框外标签 | 保留标签、键盘导航、禁用；浮层使用 `industrial-select`，新增分支局部外观见下文 |
| 输入数据菜单 | `cdkConnectedOverlay`、`cdkTrapFocus`、Material 列表 | 跟随触发器宽度，Escape／背景关闭并恢复焦点 |
| 步长 | `matInput`、`mat-button-toggle-group` | 保留业务边界，快捷值不能绕过校验 |
| 面板／字段展开 | IndustrialPanel、按钮、`aria-expanded` | 不用可点击 div 模仿按钮 |
| 图表 | TrialChart／ResultChart + ECharts | 复用图表生命周期，不创建重复画布所有者 |

默认状态显示完整标签；悬停和按下只改变背景、边界等反馈，不改变几何尺寸。键盘焦点必须可见，图标按钮必须有可访问名称。数据菜单由 CDK 约束与恢复焦点；配置开关保持自身键盘焦点。

快速试用运行或等待时禁用任务、算法和数据入口，保留原生 `disabled` 或相应无障碍语义。加载显示真实上传解析或任务状态，不显示伪造百分比。错误保留原因和恢复入口，不能仅在短暂动画里出现。迁移应分别检查默认、悬停、按下、选中、焦点、禁用、加载、空态和错误态，不宣称存量页面已逐页验收。

## 响应式与内容预算

### 紧凑参数与模型配置

`OperatorParameterFormComponent` 通过显式 `layout="compact"` 接入紧凑外观；默认仍为 `stacked`，未选择紧凑模式的调用方不因此切换布局。紧凑模式复用原 Schema、参数键、值类型和校验，不创建第二套参数引擎。Material 字段使用 `outline`、常显标签和动态提示区，网格使用 `repeat(auto-fit, minmax(min(100%, 200px), 1fr))`，行列间隔为 10px／16px；不按算法名称硬编码列数。对象、数组、`textarea` 及 UI Schema 标记 `span: full` 的字段跨满当前网格，嵌套字段保留自身结构。控件高度预算为 44px、正文 13px，说明与错误不能为维持整齐行高被裁掉。

快速试用的 `TrialModelControlsComponent` 将模型来源、模型版本、训练参数和资源说明集中展示。训练字段绑定当前 `trainingSchema()` 与 `trainingParameters()`，不为截图补造字段；“本次预训练”仅在算法可训练且训练契约声明 `supports_fit_on_run` 时出现。`busy` 时禁用模型切换和选择，训练表单外层设为 `inert`，刷新按钮还受登录与核验状态约束。核验中、核验错误、未登录和无兼容模型分别保留文字反馈。模型区域容器宽度不超过 460px 时改为纵向布局；资源说明不能被当作实际设备或训练成功证明。

### 本次预训练的最小输入窗口

最小点数反馈以当前算法版本和训练参数为依据，只用于可训练算法的“本次预训练”，不把训练切分限制套到已有模型推理。当前前端仅为算法版本 `0.1.0` 的 DLinear、PatchTST、PatchTSMixer、BeatGAN 和 TranAD 提供预检查；未知算法或版本仍交后端校验，不能沿用已知版本公式。

设整体选区为 `N` 点，切分比例为 `r`，第一段点数为 `floor(N × (1 − r))`，第二段为剩余点数。DLinear、PatchTST、PatchTSMixer 的训练段和验证段各至少为 `window_length + horizon` 点，`r` 使用 `train_validation_ratio`；BeatGAN、TranAD 的训练段和校准段各至少为 `window_length + 1` 点，`r` 使用 `calibration_ratio`。界面显示满足两段条件的最小整数 `N`，不是直接将单段最小值当成总输入要求。

选择过短预设或结束图表拖动后，若先前选区仍有效，则恢复先前选区并警告；若先前选区已被参数变化变为无效，则在此次用户操作时尽量保留请求位置、扩展到最小范围。已加载全量仍不足时不能运行，应加载更长时序或由用户调整参数。拖动中不连续弹出警告；图表松手后提交选区并校验。参数变化本身只更新内联的当前点数、最少点数和原因，提供“扩大到有效范围”按钮，不悄悄修改训练参数或自动移动选区。

这些约束是前端预检查，不替代后端验证或训练验收；参考界面合入部署不证明在线拖动的所有路径已验收，也不表示已有模型推理的全部最小输入要求已经实现。

### 嵌入式内容与真实状态

外层已提供标题时，文件映射显式使用 `appearance="embedded"`：移除内层卡片外框和重复标题，但继续复用文件版本、视图、字段映射及应用事件。默认 `appearance="default"` 保留独立预览外观。快速试用标准结果通过 `[embedded]="true"` 复用 `ResultViewerComponent`，只隐藏其重复标题；警告、可视化、数据明细和运行依据仍保留。其他调用方默认 `embedded=false`。DMA 夜间流量结果仍走原专用分支，不因为嵌入式外观转换成另一类结果。

`TrialRunStatusComponent` 使用工业面板呈现传入的真实状态与消息；排队、训练、失败、取消等标签不能由动效推断。仅在 `running` 时显示不确定进度条，不生成百分比。运行 ID、任务 ID 和工作流入口按实际存在的信息显示；“继续查看同一次运行”发出恢复查看事件，不表示重新训练。登录弹窗沿用原校验、请求与焦点恢复，仅统一标题和按钮外观。

以上组件已随参考界面合入并部署；视觉迁移本身不证明训练成功、真实模型保存或所有在线终态通过。涉及这些行为的任务仍需独立执行端到端验收，不能以截图或样式验证替代。

### 工作台与预览宽度

快速试用桌面为 `188px minmax(0, 1fr)`、16px 间隔。188px 是当前任务内容的预算，不是全平台固定比例。任务按钮高 76px，15px 名称换行，编号与名称分列，`SELECTED →` 在名称下方独立成行并右对齐，形成右下角标记，避免绝对定位侵占名称。未选中项保留标记空间。未来更长内容应扩充预算或允许高度增长，不缩字、不截断关键任务名。

`trial-workspace` 本地容器不超过 760px 时，索引移至上方，以 `minmax(140px, 1fr)` 横向换行，取消吸顶和蓝图，按钮最小高 70px。这依据页面所在工作区，不是浏览器总宽，分屏也要检查。

现有执行字段仍使用视口断点：1150px 以下两列、600px 以下一列；控制条在 1000px 以下重排。不能据此声称所有局部窄容器已适配。迁移时实测完整时间、长错误、菜单和标签，再按内容调整。文件名可中间省略，但保留获取完整名称的方法；菜单与触发器对齐，不锁定截图尺寸。预览图常规高 300px、窄屏可为 260px，是可读性预算，不是固定长宽比。

检查宽桌面、窄桌面、局部分屏和手机级窄宽。可隐藏重复工程码或装饰，不隐藏关键输入、状态、单位与数据。不能用固定整页高度裁掉结果或错误。

## 动效触发与时序矩阵

### 已合入的基础动效

JavaScript 时长以 `shared/components/motion.tokens.ts` 的 `UI_MOTION` 为唯一来源，单位 ms；普通 CSS 反馈保留 `--sw-motion-fast: 120ms` 和 `--sw-motion-base: 180ms`。遗留 `--sw-motion-panel: 220ms` 不是 `swPanelMotion` 时长，视觉令牌不得调度业务工作。

| 触发 | 时长与行为 | 重复／中断边界 |
| --- | --- | --- |
| 任务选中变化 | 当前 CSS 180ms 选中与标记反馈 | 不移动任务项或改变尺寸 |
| `swPanelMotion` 挂载／绑定键变化 | `panel=240`，透明度与横向 16px 进入，标准缓动 | 新键、焦点进入或指针按下取消旧动画；`motionOrder` 每级 `stagger=45`，最多计 4 级 |
| 预览首次／更新 | `previewEnter=320`／`previewUpdate=260` | 使用实际数据；拖动选择不能因回写反复重置窗口 |
| 提交后的输入快照 | `inputFocus=400`，聚焦本次输入窗口 | 异步展示，不等待聚焦结束再执行 |
| 新快速试用预测结果 | `forecastReveal=600`、线性 | 历史观测静态，预测相关系列展开，完整数据已取得 |
| 历史结果查看 | 默认无展开 | 不提供 ForecastRevealSession，不能伪装新计算 |

### 新增细节动效：未合并分支

以下仅适用于 `feature/industrial-motion-details`，不是已部署基线的时序。CSS 新增 `--sw-motion-disclosure: 260ms`、`--sw-motion-menu-enter: 180ms`、`--sw-motion-menu-exit: 140ms`、`--sw-motion-selection-rails: 420ms`；数据菜单退场的 JavaScript 定时使用 `UI_MOTION.menuExit=140`，只延迟浮层卸载，不延迟选择事件或业务请求。

| 触发 | 新分支时长与表现 | 状态与中断边界 |
| --- | --- | --- |
| 任务索引选中 | `button::before` 背景在 260ms 内变为 `skewX(-5deg)`；文字保持正向 | 只变装饰层，不倾斜按钮文本或重排任务位置 |
| 选中上下线 | `button::after` 在 420ms 内从左上／右下反向展开；时间到 40% 时长度为 66%，保持至 68%，再加速至完整 | 线条不是任务进度；减少动态效果时直接显示完整选中线 |
| 方框开关状态变化 | `SquareToggleIconComponent` 箭头正反旋转 260ms；展开光环向外扩散，收起光环向内回缩 | 初次挂载不播放光环；图标 `aria-hidden`，真实展开语义归触发按钮／Material 控件 |
| 字段映射展开／收起 | `.mapping-disclosure` 网格行在 `0fr` 与 `1fr` 间过渡 260ms，配合透明度与可见性 | 展开切换保留映射 DOM；关闭即设 `inert` 与 `aria-hidden`，不能因仍在退场而继续接受输入 |
| 输入数据菜单 | 进入 180ms；关闭时保留浮层退场 140ms 后 detach | `dataMenuClosing` 期间 inert；再次打开取消旧定时器，销毁清理定时器，焦点继续由 CDK 机制约束和恢复 |
| Material 算法菜单 | 带 `industrial-motion-select` 的面板自定义进入 180ms；退出沿用 Material 原生退出动画，仅调整为 140ms | 保留原生退出完成与卸载机制，不用第二个手动卸载计时器；全局样式仅命中显式工业动效类 |

同分支的管线图版增加四角 5px 方块、上下边框和两侧断线，角标 `aria-hidden` 且不接收点击。这是快速试用页面装饰，不是 `IndustrialPanelComponent` 全局结构变化，也不是新增拓扑组件。

同一未合并分支的选择器调整将算法与输入数据入口统一为 `selector-control` 外观：44px 高、13px 字体、青蓝描边，标签置于框外上方。`PLAYGROUND-CONTROL-POLISH` 后默认背景为白色 `#fff`，菜单打开时才使用浅青 `--sw-color-primary-soft`；共享 `IndustrialSelectComponent` 也按内部 open 状态区分白底与浅青底。算法入口从 `mat-form-field` 悬浮标签改为独立 `MatSelect`，通过 `aria-labelledby` 关联上方 label；数据入口仍是按钮加 CDK Connected Overlay。统一的是显示规格，不是底层业务组件、值绑定或键盘机制。

早期选择器统一将算法的 `SquareToggleIconComponent` 移到 MatSelect 旁的独立兄弟层，避开 select value 的 overflow 裁切光环；后续分析组件接入改由共享 IndustrialSelect 包装此结构。输入数据入口仍复用同一图标组件并绑定数据菜单状态。菜单使用深青底、浅色文字，数据菜单上传 footer 为青色强调；深色选项主题仅命中显式工业菜单类，不改变其他下拉。这些变化不包含在历史部署 `8f19280` 中；当前部署情况以共享协调板为准。

当前文件选中项与 Material Select 当前选项使用浅青底、深色文字，与未选中菜单项区分；共享选择器的显式 `industrial-cyan-options` 与快速试用 `trial-cyan-options` 使用同类局部状态规则。共享 `IndustrialChoiceComponent` 的 `SELECTED →` 则是按钮外的兄弟 small 元素，绝对定位于宿主右下角，不进入按钮 label；它为 aria-hidden、pointer-events none，按钮仍以 aria-pressed 表达状态。按钮最小高度 82px、底部 padding 30px 预留角标空间，不将此尺寸替换成全平台任务索引规格。

实验场 `checks` 示例将 Material checkbox／radio／slider 组合成可换行的 `control-lab`：显示选项和设备分段单选占两个 cell，强度 slider 独占整行并显示当前值与 0–100 刻度。这是保留原数据绑定的示例组合样式，不是新增共享基础控件；CPU／GPU 仅改变本地示例值，不选择真实执行设备。

`SquareToggleIconComponent` 位于 `shared/components/square-toggle-icon.component.ts`，模板和样式内联，唯一公开状态输入为 `expanded`。它不拥有菜单、表单或任务状态；当前由算法菜单、数据菜单和映射开关组合使用。映射内容仍受原文件／版本条件控制，“保留 DOM”只指展开切换不销毁内容，不表示跨文件永远保留旧映射。

减少动态效果时，新增选中线、图标光环和数据菜单动画关闭，映射与箭头不做过渡；数据菜单直接关闭，不等待退场计时。Material 算法菜单动画缩短至 1ms，以保留原生动画完成路径。应检查关闭、立即重开、Escape、背景点击、键盘焦点和卸载，不能通过覆盖全站 Material 退出动画修补单一菜单。

本轮协调者报告新增 3 项定向测试、前端共 203 项测试通过；这是本地自动检查，不等于所有浏览器时序、真实算法状态或部署验收。文档检查与前端人工交互证据分别记录，未执行的视觉路径仍需补验。

配置、预览、执行状态和结果在实际出现时进入，不编排固定总长的流程动画。快照复制本次输入与选区，以异步帧聚焦；请求不依赖动画完成。真实结果出现后替换快照，不靠倒计时推断完成。

`ForecastRevealSession` 仅由快速试用结果面板提供，WeakSet 对同一系列对象只领取一次展开，切回已领取对象不重播。它不是跨页面持久标记，也不是服务器进度。

减少动态效果时，CSS 去掉非必要运动，PanelMotion 不启动动画，偏好变更取消在途动画；图表关闭动画并显示完整状态。结果图指针操作、缩放和复位可结束展开并提交完整数据，正常展开在 600ms 后结束活动标记。卸载应取消动画帧、计时器、监听器、ResizeObserver 并销毁图表。其他控件中断路径需单独验证，不能笼统宣称全部已覆盖。

## 图表的真实性边界

时间轴使用真实时间戳：快照右端为最后输入时间加“预测步长 × 采样间隔”，不能人为规定历史 60%、未来 40% 等比例。空白未来表示待预测时段，不预画假曲线。当前输入预览为单数值指标，不是多指标并列预览。

预测结果历史为实线，预测为虚线，预测起点有标线；只在存在数据时展示对照观测、分位数与区间。区间填充不透明度为 0.14，只连接有效相邻边界。缺失值不补零、不跨缺失连接；不能把实测、预测、异常统一染青。

展开只展示已取得结果，不代表流式计算、准确度提升或完成百分比。保留时间、单位、缩放、复位与数据明细；长时序显示抽样需有说明，统计与明细保留全量。结果图有可访问名称，曲线不能是唯一信息入口。

## 迁移操作步骤

### 按页面职责迁移

| 页面类型 | 建议迁移方式 | 不应照搬的部分 |
| --- | --- | --- |
| 工作台 | 按输入、执行、结果组织区域，保留真实主动作；多任务确有切换需要时才加索引 | 不给所有页面复制快速试用侧栏、188px 列宽、水管或水纹 |
| 列表／数据资产 | 保留工具栏、筛选、排序、分页、行操作和选择语义；紧凑行高与清晰表头，嵌套资源保留层级 | 不为了统一外观把所有列表改成卡片或强制转换为 MatTable |
| 表单／配置 | 复用 Material 与 Schema 参数表单，短字段按内容成网格，复杂字段全跨；错误和说明靠近字段 | 不把一个小数字字段拉满整行，也不为多列强挤 JSON／长说明 |
| 结果 | 优先复用 `shared/results/components/result-viewer/`，保留警告、明细与运行依据；外层有标题时使用 embedded | 不新增第二套结果解析／图表所有者，不把专用结果组件冒充通用服务 |
| 弹窗 | 沿用 Material Dialog／CDK 的焦点与关闭语义；标题、内容、动作分区，按需组合工业面板 | 不叠加双标题、双外框或第二层进入动画，不让装饰遮住按钮 |

### 常见反例与修正

| 反例 | 修正与核查 |
| --- | --- |
| 简单参数默认整行铺满，配置区大量空白 | 按字段长度使用 compact 响应式网格；复杂字段、说明和窄屏仍可全跨，不能取消校验提示 |
| 下拉、开关或按钮回到 Material 默认紫色 | 检查主题与浮层样式入口，复用青蓝语义令牌，不用每页硬编码颜色补丁 |
| 为模仿工业标题画纯黑底且遗漏斜纹 | 工程标题使用 `--sw-industrial-ink` 与 `--sw-industrial-hatch`；不要据此把普通表头或正文都刷成深色 |
| 外层面板和内层结果／预览重复标题 | 使用已有 embedded 输入或保留单一标题所有者，不复制内容组件 |
| 在自制下拉层上叠原生 select，触发器与菜单互相遮挡 | 使用 Material select 或 CDK overlay，检查宽度、滚动、焦点返回和真实浮层层级；不靠任意增大 z-index |
| 滚动行中的按钮穿到吸顶表头上方 | 表头需有不透明表面并在本表格滚动上下文覆盖行内容与行按钮；真正的菜单／弹窗仍由 overlay 层展示，不能被表头盖住 |

### 执行与验收

1. 列出原页面状态、事件与权限，保留测试回归基线。
2. 使用工业主题和语义令牌，移除重复色板与大圆角，保留警告、危险和图表语义。
3. 按职责组织区域，需要工程面板时复用 IndustrialPanel，保留原业务内容，将标题动作投影至 `panel-actions`。
4. 根据最长标签与最窄容器设置网格和换行，先保证正文，再安排装饰。
5. 将动效绑定稳定任务 ID、结果对象或内容键，不绑定连续变化的进度值。
6. 复用 Material/CDK，检查焦点返回与键盘路径，错误、加载、禁用独立于动画。
7. 验证减少动态效果、快速切换、重复展开、缩放与卸载，请求不能被动画延迟。
8. 运行验证并交独立审阅，记录已迁移页面和剩余差距，没有部署证据只记录本地状态。

以下组合示例不新增业务请求。将两项加入现有 standalone 组件的 `imports`；`taskId` 和 `result` 使用原页面状态，表单和事件保持原样：

```ts
import { IndustrialPanelComponent } from '../../../shared/components/industrial-panel.component';
import { PanelMotionDirective } from '../../../shared/components/panel-motion.directive';

// 现有组件的 imports 增加：
// IndustrialPanelComponent, PanelMotionDirective
```

```html
<app-industrial-panel heading="输入配置" code="01 / CONFIGURATION"
  [swPanelMotion]="taskId()">
  <!-- 保留原有表单、校验与事件绑定。 -->
</app-industrial-panel>
@if (result(); as value) {
  <app-industrial-panel heading="分析结果" code="02 / RESULT"
    [swPanelMotion]="value" [motionOrder]="1">
    <!-- 保留原结果组件，传入 value。 -->
  </app-industrial-panel>
}
```

## 错误与重试、验证与交接

每个改造任务应维护以下验收清单；不适用项写出原因，未执行项写为待验收，不能统一标通过：

- 状态：默认、悬停、按下、选中、键盘焦点、禁用、加载、空态、字段校验错误、请求失败；执行类页面另查等待、运行、成功、失败、取消、状态未知及恢复查看。
- 内容：最长名称、完整时间与单位、无权限／未登录、无兼容资源、大量行或长 JSON；只覆盖本页真实存在的业务路径，不创造假响应充当端到端结果。
- 响应式：1440、1024、768、390px 视口及局部分屏窄容器；核对字段换行、表头与行按钮层级、菜单定位、图表轴与操作区，关键状态和动作不能被裁掉。
- 交互与生命周期：Tab／Enter／Escape、关闭后焦点返回、鼠标与触控滚动、减少动态效果、快速切换和卸载清理；图表缩放与固定纹理另查所在滚动容器。
- 证据：定向测试、构建、同状态视觉对照及实际执行过的人工检查分别记录；主线提交、部署版本、文档 PR 状态与未迁移范围分别交接。

缺少可解析时间列或数值列时显示选择提示；请求失败依原业务重试路径处理，不用动画表示重试成功。没有动画能力或用户减少动态效果时直接显示最终界面，不阻塞执行。

文档运行 `npm run validate`、`npm run lint`；前端改造按既有 `npm test`、`npm run build` 检查，再进行真实交互和窄容器检查。自动检查不代替视觉和键盘验收。交接记录范围、实现版本、验证结果、未解决问题和独立审阅意见，分支、合并主线与部署状态分开。

## 实现依据与维护入口

以下均为前端仓库路径，审核时对照已核定主线及本任务改动阅读：

- `src/styles.scss`、`src/styles/_industrial.scss`：主题、空间、状态、焦点与 CSS 动效。
- `src/app/shared/components/operator-parameter-form.component.ts` 及同名测试：紧凑模式、字段跨列和原参数校验保留。
- `src/app/features/quick-trial/components/trial-model-controls.component.*`、`trial-run-status.component.*`：模型配置、忙碌交互边界和真实状态展示。
- `src/app/features/data-sources/data-file-preview-panel.component.ts`、`src/app/shared/results/components/result-viewer/result-viewer.component.*`：可选嵌入式外观；`src/app/features/login/login-dialog.component.ts`：登录弹窗外观与原认证流程。
- `src/app/shared/components/industrial-panel.component.ts`、同名 SCSS，`pipe-blueprint.component.ts`：面板结构与装饰资源选择。
- `public/assets/industrial/`、`design-system/smart-water-platform/decoration-assets.md`：透明管线 PNG、周期光纹及资源来源；旧水纹 WebP、等高线 SVG 保留未使用，旧管线 HTML 不再是运行时模板。
- `scripts/render-water-texture.py`、`src/app/shared/components/viewport-texture.directive.ts` 及同名测试：离线生成、周期检查、视口定位与销毁清理。
- `src/app/shared/components/panel-motion.directive.ts`、`motion.tokens.ts`：进入、取消与时长。
- 新动效分支 `src/app/shared/components/square-toggle-icon.component.ts`、`features/quick-trial/components/trial-task-selector.component.*`、`trial-input-panel.component.*`：方框状态反馈、可取消菜单退场与保留 DOM 的映射展开；不属于当前部署基线。
- `src/app/features/quick-trial/quick-trial.page.html/scss/ts`：索引、容器断点、执行与快照。
- `src/app/features/quick-trial/components/trial-task-selector.component.ts/html/scss`、`trial-input-panel.component.ts/html/scss`：控件、焦点、字段与预览。
- `src/app/features/quick-trial/components/trial-execution-chart.component.ts`、`charts/trial-chart.component.ts`、`charts/trial-preview-chart-options.ts`：快照、图表生命周期与更新。
- `src/app/features/quick-trial/components/trial-result-panel.component.ts`、`src/app/shared/results/components/forecast-result/forecast-result.component.ts`：展开注入范围。
- `src/app/shared/results/charts/forecast-chart-options.ts`、`forecast-reveal-session.ts`、`result-chart.component.ts`：预测编码、一次性展开与中断。

前端 `design-system/smart-water-platform/MASTER.md` 只保留入口与核心约束，完整规范在本文维护，避免双份事实来源。
