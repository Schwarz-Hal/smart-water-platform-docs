---
id: development.frontend-page-structure
title: 数据资产、算子中心与快速试用的前端维护边界
document_type: development
document_version: 0.1.1
status: draft
locale: zh-CN
audience: [frontend_developer]
related_modules: [M02, M04, M05]
related_operators: []
related_apis: []
owners: [frontend-team]
reviewed_at: 2026-09-10
summary: 说明三类页面的组件、页面状态和异步职责，以及保持现有行为的重构验证边界。
---

# 数据资产、算子中心与快速试用的前端维护边界

## 用途与适用范围

本文供前端开发者定位修改位置，适用于 `FRONTEND-PAGE-DECOMPOSITION` 的前端重构。目标是在保持现有布局、入口、权限和数据语义的前提下缩小维护单元，不是重新设计三个页面，也不是创建新的文件管理、训练或算法执行引擎。

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

## Angular 控件与图表复用

| 场景 | 实际复用方式 | 保持的边界 |
| --- | --- | --- |
| 数据资产标准表单、按钮、菜单 | Material 表单字段、输入、按钮和菜单；创建/编辑/上传沿用覆盖层并使用 CDK `CdkTrapFocus` | 焦点约束与恢复由 CDK 管理，不改变文件操作语义 |
| 文件拖拽 | 现有 CDK DragDrop | 菜单和按钮入口仍可用；选择与拖拽分开处理 |
| 算子参数与模型详情 | 参数编辑内联复用现有参数表单组件；模型详情使用 Material `MatDialog` | 参数契约和精确版本不变，不把参数编辑改成弹窗 |
| 算子详情导航 | Material `mat-tab-nav-bar` 与 `mat-tab-nav-panel` | 保留六个详情区域及原 URL 参数 |
| 快速试用运行状态 | `MatProgressBar` 的不确定进度模式 | 只表示运行中，不生成虚假的数值进度 |
| 关闭输入配置 | CDK `FocusMonitor` 恢复到触发按钮 | 内联面板不强制改成覆盖式抽屉 |
| 快速试用图表 | 现有 ECharts 与新的 `TrialChartComponent` | 一个组件实例拥有一个图表实例及其事件和尺寸监听 |

`charts/trial-forecast-chart-options.ts`、`trial-anomaly-chart-options.ts`、`trial-night-flow-chart-options.ts` 和 `trial-preview-chart-options.ts` 分别构造各类图表选项，不访问页面、HTTP 或路由。结果区域根据结果种类选择选项；共用图表组件负责初始化、更新、尺寸变化和销毁。

预览图的缩放事件仅更新输入区间，不因为滑动本身重复创建图表。图表销毁时断开 `ResizeObserver` 并释放 ECharts。维护选项工厂时必须保留时间解释、空值、单位、异常分数双轴、置信区间、图例和缩放语义，不能把展示调整变成数据转换。

## 视觉、动效与样式作用域

视觉依据为前端仓库的 `design-system/smart-water-platform/MASTER.md`：沿用 `--sw-*` 语义变量、本地 SVG 图标、紧凑布局和现有字体，不引入另一套 CSS 框架或动效库。

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
