---
id: development.frontend-page-structure
title: 数据资产、算子中心与快速试用的前端维护边界
document_type: development
document_version: 0.1.7
status: draft
locale: zh-CN
audience: [frontend_developer]
related_modules: [M02, M04, M05]
related_operators: []
related_apis: []
owners: [frontend-team]
reviewed_at: 2026-09-12
summary: 说明三类页面的维护职责，以及快速试用工业主题、输入交互与验证边界。
---

# 数据资产、算子中心与快速试用的前端维护边界

## 用途与适用范围

本文供前端开发者定位修改位置，涵盖 `FRONTEND-PAGE-DECOMPOSITION` 的职责拆分，以及 `CYAN-INDUSTRIAL-UI` 对快速试用布局与公共主题的后续调整。职责拆分保持入口、权限和数据语义；视觉调整不创建新的文件管理、训练或算法执行引擎。

本文描述分支上的结构，不代表已合并主线或已部署。原计划中的所有拆分项并未逐项完成：文件管理器的部分模板和操作编排、算子中心的训练与使用方式区域仍由页面协调；不以文件数量或页面行数作为完成标准。

前端继续使用项目锁定的 Angular 21、Angular Material/CDK 和 ECharts。运行命令前应安装锁文件对应的依赖，并核对当前分支，不把其他工作区的未提交修改带入本轮。

## 页面与状态的分工

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

`TrialChartComponent` 区分缩放变化与 `zoomCommit`，输入面板在松手后的提交事件校验，避免拖动中反复警告。过短预设或已提交拖动恢复前一个仍有效选区；如果前选区已无效，则按此次请求位置在可用数据内扩至最小范围，全量不足仍禁止运行。参数变化保留当前选区和参数，只更新内联提示与“扩大到有效范围”按钮，等待用户操作。具体交互约束见[最小输入窗口](./industrial-design-language.md#本次预训练的最小输入窗口)。这些本地实现不构成在线拖动验收，也未完整覆盖已有模型推理最小值。

快速试用的模型与训练区由 `components/trial-model-controls.component.*` 展示，注入页面提供的输入状态，刷新通过输出事件交回调用方。它不自行提交训练。模型来源与版本使用 Material 控件；本次预训练入口受算法可训练属性和 `supports_fit_on_run` 契约约束。训练参数直接绑定当前 `trainingSchema()`，并复用 `OperatorParameterFormComponent` 的 `layout="compact"`；`busy` 时模型选择禁用，训练参数容器设置 `inert`。核验中、错误、未登录和无兼容模型各有反馈，不用空模型选项假装可运行。

公共参数表单的默认布局仍是 `stacked`，紧凑模式为调用方显式选择，不强制迁移算子中心或其他使用处。布局使用响应式网格和 outline 字段；对象、数组、文本域及显式全跨字段独占一行，保留原字段键、类型和校验。具体尺寸与迁移约束见[青色工业设计语言](./industrial-design-language.md#紧凑参数与模型配置)。

输入区两条文件预览分支均显式传入 `appearance="embedded"`，仅去除重复卡片和标题，映射状态、版本/视图选择与事件仍由原 `DataFilePreviewPanelComponent` 管理。标准结果由 `TrialResultPanelComponent` 适配后传给 `[embedded]="true"` 的 `ResultViewerComponent`，保留警告、可视化、数据明细与运行依据；DMA 夜间流量继续使用专用结果分支。两类公共组件均默认保留独立展示外观，不能为去重标题复制新的预览或结果引擎。

`TrialRunStatusComponent` 只呈现传入状态、消息和运行标识，按条件发出恢复查看与工作流事件，不拥有第二条任务追踪链路。未知状态显示“状态待同步”，进度条为不确定模式，不能由动画补出训练百分比。此次本地界面覆盖没有运行训练，未逐项在线实测所有终态，不构成训练成功或部署验收结论。

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

视觉依据为前端仓库的 `design-system/smart-water-platform/MASTER.md`：沿用 `--sw-*` 语义变量、本地 SVG 图标、紧凑布局和现有字体，不引入另一套 CSS 框架或动效库。

`src/styles/_industrial.scss` 通过现有语义变量和 Material 覆盖配置定义青色强调、深色标题栏所需色值、小圆角和边框，不全局重染图表或错误、警告状态。`src/app/shared/components/industrial-panel.component.*` 的 `IndustrialPanelComponent` 负责可复用的标题、操作投影区与内容容器；边框、纹理和角标用 CSS 绘制，内容控件与业务状态仍归调用方。该组件的短标题模板内联，样式独立存放。

`PipeBlueprintComponent` 改为加载 `public/assets/industrial/` 中内置 imagegen 生成的透明管线 PNG，旧内联 SVG 模板保留但不再引用。`variant` 支持 `vertical`、`manifold`、`horizontal`，默认 vertical；快速试用按时序预测、异常检测、其余任务依次选用这三种外观。显示高度由 CSS `--sw-pipe-height` 控制，默认 300px，图片保持比例、空 `alt`、`aria-hidden="true"`，不参与点击或拖拽。

`quick-trial.page.scss` 的 `.trial-container::before` 在内容底层平铺离线周期光纹，默认 s42/d8，另有 s19/d6、s73/d11。`--sw-water-image` 选择图片，`--sw-water-tile-size` 默认 480px，`--sw-water-opacity` 默认 0.32，不捕获点击，没有角落 mask 或实时 shader。`scripts/render-water-texture.py` 使用纯 Python 标准库，通过 seed、density、size、warp、line-width 等 CLI 参数输出 PNG、参数与 SHA256 旁车 JSON，并可输出 2×2 预览；每次生成执行 291 项周期场检查，不是物理仿真。

`shared/components/viewport-texture.directive.ts` 负责视口锚定，不把定位逻辑放入页面业务状态。它在 Angular 区域外监听捕获阶段滚动、窗口 resize 与宿主 ResizeObserver，以一个待执行 RAF 合并更新，将宿主矩形的负偏移写入背景坐标；不运行常驻动画，销毁时清理监听、观察器与待执行帧。同名测试覆盖偏移补偿与回调清理；本轮交接报告前端 200 项测试通过、周期检查及 2×2 预览已检查，但人工滚动前后对比尚未完成，不声明所有滚动场景已验收。

旧用户照片 `water-caustics-v1.webp` 和 `contours-v1.svg` 保留但不再用于当前页面。生成方法、使用示例与管线 PNG 的最终生成提示词见前端 `design-system/smart-water-platform/decoration-assets.md`。管线与水纹均为装饰，不是实际管网拓扑、水位、水力状态或运行结果。快速试用仍由任务索引、配置与结果组件组成，不把整页制作成图片。当前仅说明本地快速试用接入，不代表全平台已迁移、验收、合并或部署。

从父页面抽取子组件时，应把相关选择器与响应式规则迁到真实使用它们的组件作用域；不能仅移动模板后依赖原页面的封装样式，也不通过全局关闭封装补救。涉及同一选择器的基础样式与后续覆盖需要一起检查。

快速试用的新组件保留局部反馈和原布局，在 `prefers-reduced-motion: reduce` 下关闭非必要 CSS 动画及图表动画。弹窗使用组件已有焦点行为，不叠加第二层进入动画。统一视觉细节并不要求在本轮替换所有历史颜色或重绘所有图表。

## 验证与失败处理

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

本文不记录服务器验收结论，也不把本地构建、单元测试或截图对照等同于已部署或已合并。具体分支、检查结果及剩余验收由本轮产品任务交接记录维护。
