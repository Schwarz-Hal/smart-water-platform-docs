---
id: development.frontend-page-structure
title: 数据资产、算子中心与快速试用的前端维护边界
document_type: development
document_version: 0.1.10
status: draft
locale: zh-CN
audience: [frontend_developer]
related_modules: [M02, M04, M05]
related_operators: []
related_apis: []
owners: [frontend-team]
reviewed_at: 2026-09-13
summary: 说明三类页面的维护职责，以及快速试用工业主题、输入交互与验证边界。
---

# 数据资产、算子中心与快速试用的前端维护边界

## 用途与适用范围

本文供前端开发者定位修改位置，涵盖 `FRONTEND-PAGE-DECOMPOSITION` 的职责拆分，以及 `CYAN-INDUSTRIAL-UI` 对快速试用布局与公共主题的后续调整。职责拆分保持入口、权限和数据语义；视觉调整不创建新的文件管理、训练或算法执行引擎。

青蓝工业风已确认为主线默认设计方向。2026-09-13 核定的前端 main 为 `16bff9b64d524c575927a046e34f257da648b260`（PR #58 已合并），服务器运行 `8f19280169ad6e6bee4e960507d7ed10e8a44426`；参考界面已合入并部署。配套文档 PR #32 仍待合并，本文作者态修订不等于平台文档已更新。全平台未逐页迁移或验收，原计划中的拆分也未逐项完成：文件管理器的部分模板和操作编排、算子中心的训练与使用方式区域仍由页面协调；不以文件数量或页面行数作为完成标准。

新增细节动效来自另一个基于 main 的 `feature/industrial-motion-details` 分支，当前未提交、未合并、未部署。下文专节所述效果不在服务器 `8f19280` 中；上一轮设计指导内容保留，其前端 guidance 分支不因此被视为已经与动效分支集成。

前端继续使用项目锁定的 Angular 21、Angular Material/CDK 和 ECharts。运行命令前应安装锁文件对应的依赖，并核对当前分支，不把其他工作区的未提交修改带入本轮。

## 页面与状态的分工

智能体进行页面任务时，先依次阅读前端 `AGENTS.md` → `design-system/smart-water-platform/MASTER.md` → [完整设计规范](./industrial-design-language.md) → 目标组件、Schema／接口与测试 → 本任务状态清单，再选择最小复用方案。语义 tokens、Material/CDK、真实状态与参数契约、compact 内容适配及可访问性为必须项；IndustrialPanel 与轻量进入动效为推荐项；纹理、管线、工程码和任务索引为按需项。共享参数表单默认仍为 stacked，不能在视觉任务中全局切换所有调用方。

工作台、列表、表单、结果和弹窗按各自职责迁移，详见[页面迁移建议与反例](./industrial-design-language.md#按页面职责迁移)。不要给列表或弹窗照搬快速试用的 188px 侧栏；不能因参考组件在某页有效就把页面状态搬成根单例。偏离规范需在交接或 PR 中说明具体原因、替代实现与验证结果。

以下路径均相对于前端仓库 `src/app/features/`。

| 页面入口 | 展示与交互单元 | 页面作用域状态 | 页面保留的职责 |
| --- | --- | --- | --- |
| `data-sources/data-collections.page.ts` | `assets/asset-toolbar`、`dataset-file-row`、创建/编辑/上传弹窗组件 | `DataAssetsStore`、`DataExplorerStore`、`FileExplorerSelection` | 组合目录与数据集视图、打开预览和治理入口、编排文件操作 |
| `operators/operator-center.page.ts` | `center/` 中的目录、详情头、概览、契约、默认参数、版本和文档组件 | `OperatorResourcesStore`；页面保留当前选择、筛选和训练状态 | URL 同步、精确版本选择、管理操作、训练入口与任务关注、左右布局宽度 |
| `quick-trial/quick-trial.page.ts` | `components/` 中的任务选择、输入配置、运行状态和结果区域 | `QuickTrialInputState`；页面保留运行状态和结果 | 登录、上传、数据读取、运行参数快照、临时文件清理、下载和工作流跳转 |

页面和新增界面组件使用外置 HTML/SCSS。子组件通过明确的输入与输出，或注入页面提供的状态服务协作；不把整个页面对象传给子组件。页面作用域服务由页面的 `providers` 提供，不改成跨页面共享的根单例。

### 数据资产页

- `DataAssetsStore` 管理数据集文件、局部加载与错误、月度统计和版本治理摘要；销毁时释放相关读取订阅。
- `DataExplorerStore` 管理当前目录、面包屑、搜索、分页及目录响应转换。切换目录时取消旧请求，并通过请求代次排除过期结果；它不执行文件写操作。
- `FileExplorerSelection` 管理选中 ID 和区间选择锚点，不承担 HTTP 请求。
- 创建、编辑和上传表单在独立组件内；提交、取消仍通过已有数据文件服务和页面流程完成。

文件行保持“数据表、质量、大小、数据治理、更新时间、数据操作”的顺序。嵌套列表和资源管理布局不强制转换为 `MatTable`，避免改变现有密度、层级和拖拽行为。修改选择、拖拽、复制、移动或删除时，应同时检查按钮/菜单替代入口和操作范围。

### 算子中心

目录、当前查看版本、详情 Tab 和 URL 由页面统一协调。`OperatorResourcesStore` 只负责模型、算法发布和文档等读取资源；加载模型和发布时使用当前算子的精确算法版本信息。切换资源时释放旧读取订阅，不允许旧请求覆盖新选择。

默认参数编辑复用现有 `OperatorParameterFormComponent`，不另建参数 Schema 或表单引擎。文档通过已有文档服务读取，文档区域负责展示，不复制独立文档仓库的作者态内容。

旧训练入口的改动限于任务状态追踪：页面使用 `TaskTrackerService.track()` 获得任务句柄，在终态和页面销毁时释放当前关注。终态反馈和模型刷新核对发起训练的算子版本，避免把旧版本的结果写到新版本详情。释放页面关注不等于取消后端训练。

本轮没有把全部旧训练能力改写为新训练工作台，也不删除仍可用的训练入口。涉及训练参数、默认模型、版本绑定或执行契约的后续变更，需要单独核对后端能力及用户文档。

### 快速试用

`QuickTrialInputState` 仅保存任务/算法选择、示例和上传文件元信息、选列、时序点、输入区间及预测步长等输入状态与派生值。它不提交任务、不管理图表实例，也不替代 `QuickTrialService`。

页面在异步预览读取前固定本次任务、算法、版本、列、输入区间和预测步长。后续界面选择变化不能改写已经提交的请求；重复运行在运行中被拦截。运行后的清理使用本次上传文件的 ID 与集合信息，不能清理用户后来选择的其他文件。

示例元数据、完整源文件读取以及执行前补取预览的订阅随页面销毁释放；新的完整源文件读取取消前一次读取。已经开始的执行订阅保持原有完成与临时文件清理链路，不因为展示组件销毁而提前回收正在运行的输入文件。

原始 CSV 的无时区时间与服务端标准化 UTC 时间需要区分。快速试用保留文件画像的 `selected_column` 和 `timezone_assumption`：当前画像明确声明 `Asia/Shanghai` 时，对该列的 ISO 风格无时区日期时间按 UTC+08:00 解释；已带时区的值不重复偏移。该规则用于图表和提交的输入窗口，不能将源数据的本地时间直接标记成 UTC。其他日期格式与时区不在本次补丁扩展范围内。资源创建、更新时间属于另一类元数据，其无时区值按 API 的 UTC 约定计算相对时间，不复用源文件时区。

访客仍可浏览公开示例，上传和运行通过原登录入口处理。输入面板继续复用 `DataFilePreviewPanelComponent` 的版本/视图选择，不新增私有文件预览协议。CSV 字段与时间对齐逻辑位于 `quick-trial-export.ts`；下载动作和工作流跳转留在页面。

工业主题下，输入配置按字段与时序、输入时序预览、运行配置组织。时间列、数值列和可选点位列继续由原 `DataFilePreviewPanelComponent` 映射，外层仅显示摘要和展开入口，不再增设一套重复选列控件。当前预览仍是一条所选数值列的时序，不表示已经支持多指标联合输入。

运行配置的输入窗口提供全部数据、最近 24 小时、最近 3 天、最近 7 天和自定义。预设按当前序列末点向前取范围，并更新预览图的缩放区间；拖动图表范围后切换为自定义。开始和结束时间是只读的北京时间边界，按 `yyyy/MM/dd HH:mm` 展示，不是可编辑日期框。它们随所选区间更新，显示格式不改变提交窗口的时间语义。

## Angular 控件与图表复用

最小训练输入窗口由 `quick-trial/trial-window-requirement.ts` 按算法版本计算，`QuickTrialInputState` 派生要求、选区不足状态及提示，输入面板负责预设、恢复与显式扩展。该规则只用于“本次预训练”：算法 `0.1.0` 的 DLinear、PatchTST、PatchTSMixer 按 `floor(N × (1 − train_validation_ratio))` 划分训练段、其余为验证段，两段各至少 `window_length + horizon` 点；同版本 BeatGAN、TranAD 使用 `calibration_ratio` 切分，两段各至少 `window_length + 1` 点。`N` 是整体输入点数；未知版本不套公式，已有模型不套训练限制。

`TrialChartComponent` 区分缩放变化与 `zoomCommit`，输入面板在松手后的提交事件校验，避免拖动中反复警告。过短预设或已提交拖动恢复前一个仍有效选区；如果前选区已无效，则按此次请求位置在可用数据内扩至最小范围，全量不足仍禁止运行。参数变化保留当前选区和参数，只更新内联提示与“扩大到有效范围”按钮，等待用户操作。具体交互约束见[最小输入窗口](./industrial-design-language.md#本次预训练的最小输入窗口)。实现合入部署不构成在线拖动所有路径的验收，也未完整覆盖已有模型推理最小值。

快速试用的模型与训练区由 `components/trial-model-controls.component.*` 展示，注入页面提供的输入状态，刷新通过输出事件交回调用方。它不自行提交训练。模型来源与版本使用 Material 控件；本次预训练入口受算法可训练属性和 `supports_fit_on_run` 契约约束。训练参数直接绑定当前 `trainingSchema()`，并复用 `OperatorParameterFormComponent` 的 `layout="compact"`；`busy` 时模型选择禁用，训练参数容器设置 `inert`。核验中、错误、未登录和无兼容模型各有反馈，不用空模型选项假装可运行。

公共参数表单的默认布局仍是 `stacked`，紧凑模式为调用方显式选择，不强制迁移算子中心或其他使用处。布局使用响应式网格和 outline 字段；对象、数组、文本域及显式全跨字段独占一行，保留原字段键、类型和校验。具体尺寸与迁移约束见[青色工业设计语言](./industrial-design-language.md#紧凑参数与模型配置)。

输入区两条文件预览分支均显式传入 `appearance="embedded"`，仅去除重复卡片和标题，映射状态、版本/视图选择与事件仍由原 `DataFilePreviewPanelComponent` 管理。标准结果由 `TrialResultPanelComponent` 适配后传给 `[embedded]="true"` 的 `ResultViewerComponent`，保留警告、可视化、数据明细与运行依据；DMA 夜间流量继续使用专用结果分支。两类公共组件均默认保留独立展示外观，不能为去重标题复制新的预览或结果引擎。

`TrialRunStatusComponent` 只呈现传入状态、消息和运行标识，按条件发出恢复查看与工作流事件，不拥有第二条任务追踪链路。未知状态显示“状态待同步”，进度条为不确定模式，不能由动画补出训练百分比。它是快速试用展示组件，不是通用执行服务；参考界面已部署不证明训练成功或所有在线终态已实测。

| 场景 | 实际复用方式 | 保持的边界 |
| --- | --- | --- |
| 数据资产标准表单、按钮、菜单 | Material 表单字段、输入、按钮和菜单；创建/编辑/上传沿用覆盖层并使用 CDK `CdkTrapFocus` | 焦点约束与恢复由 CDK 管理，不改变文件操作语义 |
| 文件拖拽 | 现有 CDK DragDrop | 菜单和按钮入口仍可用；选择与拖拽分开处理 |
| 算子参数与模型详情 | 参数编辑内联复用现有参数表单组件；模型详情使用 Material `MatDialog` | 参数契约和精确版本不变，不把参数编辑改成弹窗 |
| 算子详情导航 | Material `mat-tab-nav-bar` 与 `mat-tab-nav-panel` | 保留六个详情区域及原 URL 参数 |
| 快速试用运行状态 | `MatProgressBar` 的不确定进度模式 | 只表示运行中，不生成虚假的数值进度 |
| 快速试用算法与输入数据选择 | 算法使用 Material `mat-select`；输入数据使用锚定触发按钮的 CDK Connected Overlay 和 Material 列表 | 打开时按触发按钮宽度设置菜单；长文件名中间省略、保留首尾，完整名称放在 `title`；菜单保留上传入口 |
| 收起输入配置 | 保持配置开关的键盘焦点；数据菜单由 CDK 管理焦点约束和恢复 | 内联面板不强制改成覆盖式抽屉 |
| 快速试用图表 | 现有 ECharts 与新的 `TrialChartComponent` | 一个组件实例拥有一个图表实例及其事件和尺寸监听 |

`charts/trial-forecast-chart-options.ts`、`trial-anomaly-chart-options.ts`、`trial-night-flow-chart-options.ts` 和 `trial-preview-chart-options.ts` 分别构造各类图表选项，不访问页面、HTTP 或路由。结果区域根据结果种类选择选项；共用图表组件负责初始化、更新、尺寸变化和销毁。

预览图的缩放事件仅更新输入区间，不因为滑动本身重复创建图表。图表销毁时断开 `ResizeObserver` 并释放 ECharts。维护选项工厂时必须保留时间解释、空值、单位、异常分数双轴、置信区间、图例和缩放语义，不能把展示调整变成数据转换。

## 视觉、动效与样式作用域

视觉入口为前端仓库的 `design-system/smart-water-platform/MASTER.md`，完整约束以[青色工业设计语言](./industrial-design-language.md)为准：沿用 `--sw-*` 语义变量、本地 SVG 图标、紧凑布局和现有字体，不引入另一套 CSS 框架或动效库。

`src/styles/_industrial.scss` 通过现有语义变量和 Material 覆盖配置定义青色强调、深色标题栏所需色值、小圆角和边框，不全局重染图表或错误、警告状态。`src/app/shared/components/industrial-panel.component.*` 的 `IndustrialPanelComponent` 负责可复用的标题、操作投影区与内容容器；边框、纹理和角标用 CSS 绘制，内容控件与业务状态仍归调用方。该组件的短标题模板内联，样式独立存放。

`PipeBlueprintComponent` 改为加载 `public/assets/industrial/` 中内置 imagegen 生成的透明管线 PNG，旧内联 SVG 模板保留但不再引用。`variant` 支持 `vertical`、`manifold`、`horizontal`，默认 vertical；快速试用按时序预测、异常检测、其余任务依次选用这三种外观。显示高度由 CSS `--sw-pipe-height` 控制，默认 300px，图片保持比例、空 `alt`、`aria-hidden="true"`，不参与点击或拖拽。

`quick-trial.page.scss` 的 `.trial-container::before` 在内容底层平铺离线周期光纹，默认 s42/d8，另有 s19/d6、s73/d11。`--sw-water-image` 选择图片，`--sw-water-tile-size` 默认 480px，`--sw-water-opacity` 默认 0.32，不捕获点击，没有角落 mask 或实时 shader。`scripts/render-water-texture.py` 使用纯 Python 标准库，通过 seed、density、size、warp、line-width 等 CLI 参数输出 PNG、参数与 SHA256 旁车 JSON，并可输出 2×2 预览；每次生成执行 291 项周期场检查，不是物理仿真。

`shared/components/viewport-texture.directive.ts` 负责视口锚定，不把定位逻辑放入页面业务状态。它在 Angular 区域外监听捕获阶段滚动、窗口 resize 与宿主 ResizeObserver，以一个待执行 RAF 合并更新，将宿主矩形的负偏移写入背景坐标；不运行常驻动画，销毁时清理监听、观察器与待执行帧。同名测试覆盖偏移补偿与回调清理；该功能的 2026-09-12 交接记录包含前端 200 项测试、周期检查及 2×2 预览检查，当时人工滚动前后对比未完成。后续迁移仍应验证实际滚动容器，不声明所有滚动场景已验收。

旧用户照片 `water-caustics-v1.webp` 和 `contours-v1.svg` 保留但不再用于当前页面。生成方法、使用示例与管线 PNG 的最终生成提示词见前端 `design-system/smart-water-platform/decoration-assets.md`。管线与水纹均为装饰，不是实际管网拓扑、水位、水力状态或运行结果。快速试用仍由任务索引、配置与结果组件组成，不把整页制作成图片。此参考接入已合入部署，但全平台尚未全部迁移；其他页面无需为了符合主题而添加相同装饰。

从父页面抽取子组件时，应把相关选择器与响应式规则迁到真实使用它们的组件作用域；不能仅移动模板后依赖原页面的封装样式，也不通过全局关闭封装补救。涉及同一选择器的基础样式与后续覆盖需要一起检查。

快速试用的新组件保留局部反馈和原布局，在 `prefers-reduced-motion: reduce` 下关闭非必要 CSS 动画及图表动画。弹窗使用组件已有焦点行为，不叠加第二层进入动画。统一视觉细节并不要求在本轮替换所有历史颜色或重绘所有图表。

## 验证与失败处理

### 新动效分支的组件边界

同一未合并分支中的 `TRIAL-SELECT-UNIFY` 只统一算法与输入数据入口的显示：`trial-task-selector.component.html/scss` 共用 `selector-control` 的 44px 高、13px 字体、青蓝描边和浅青底。算法改为独立 MatSelect 和框外上置 label，以 `aria-labelledby` 关联，不再使用 mat-form-field 悬浮标签；数据入口仍为按钮与 CDK overlay，原绑定、选择事件和键盘机制不因此合并或替换。

算法方框图标放在 MatSelect 旁的独立兄弟层，防止 value 容器的 overflow 裁切光环；两入口复用同一 `SquareToggleIconComponent`，各自绑定已有菜单状态。数据菜单局部样式与算法 `trial-cyan-options` panelClass 提供深青底、浅色字和青色高亮，上传 footer 使用青色强调；`styles/_industrial.scss` 中选项主题仅作用于显式标记的算法浮层，不改其他下拉。此结构仍属于未提交、未合并、未部署的分支，不是已部署 `8f19280` 的状态。

`shared/components/square-toggle-icon.component.ts` 是仅消费 `expanded` 的装饰图标，模板和样式内联。箭头 260ms 正反旋转，展开／收起光环分别向外／向内，首次挂载不播放光环；它不管理展开或菜单状态。算法菜单、输入数据菜单与字段映射开关仍由各自的原控件与页面组件持有状态和无障碍语义。

`trial-input-panel.component.html/scss` 使用 `.mapping-disclosure` 的 `0fr/1fr` 网格过渡 260ms；展开切换不卸载映射内容，关闭即应用 inert 和 aria-hidden。文件／版本变化仍遵循原条件模板，不能借动效保存失效映射。`trial-task-selector.component.ts` 用 `dataMenuClosing` 保留 140ms 退场，重新打开取消旧定时器、销毁时清理；CDK 继续管理焦点，选择事件不等待动画。

算法菜单通过显式 `industrial-motion-select` 使用 180ms 自定义进入，原生 Material 退出仅缩短至 140ms；退出完成与卸载仍归 Material，不另建菜单服务。`quick-trial.page.scss` 的图版四角和断侧线、选中背景 `skewX(-5deg)` 与上下反向线均是页面装饰：文字不倾斜，420ms 线条在时间 40% 到 68% 之间停留于 66% 长度，再加速完成，不代表业务进度。

本节仅描述未合并分支。时序、减少动态效果和中断边界见[新增细节动效](./industrial-design-language.md#新增细节动效未合并分支)。本轮协调者报告新增 3 项定向测试、共 203 项前端测试通过；需另行记录人工开关、快速重开、Escape、焦点恢复和减少动态效果检查，不以自动测试代替全状态视觉或部署验收。

### 页面检查

开始修改前为目标页面列出适用状态，完成后逐项记录通过／待验收／不适用及原因。至少覆盖默认、焦点、禁用、加载、空态、校验和请求错误；执行页再核对真实终态与恢复。检查长标签、窄容器、键盘关闭与焦点恢复、浮层遮挡、吸顶表头是否盖住滚动行按钮（不遮住真正的菜单浮层），以及减少动态效果和卸载清理。完整检查项见[验收清单](./industrial-design-language.md#错误与重试验证与交接)。

在前端仓库按修改范围运行现有测试。例如快速试用的定向检查为：

```text
npx ng test --watch=false --include="src/app/features/quick-trial/quick-trial*.spec.ts"
```

整体集成检查使用项目已有命令：

```text
npm test
npm run build
npm run lint
npx ng build --configuration developer-offline
```

浏览器检查覆盖 1440、1024、768、390px：数据资产的展开、无归属文件、多选和操作菜单；算子版本/Tab 恢复、文档和参数编辑；快速试用的示例、配置关闭后焦点、预测步长、图表和导出。页面结构或 CSS 变化后，应与同一状态的改造前基线对照。

测试或构建失败时先定位受影响组件与作用域，不通过放宽业务断言或全局样式隐藏问题。线上验收应另外验证真实任务状态、临时文件回收和精确版本执行。离线调试的合成响应、固定结果与浏览器展示成功不能证明真实算法或服务链路通过；参见[开发者离线调试模式](./developer-offline-mode.md)。

本文记录开头所列已核定的主线与部署事实，不把本地构建、单元测试或截图对照等同于新任务已经部署、合并或业务验收。后续变更的具体分支、检查结果、文档 PR 和剩余验收由各产品任务交接记录维护。
