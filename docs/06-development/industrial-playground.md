---
id: development.industrial-playground
title: 青色工业组件实验场
document_type: development
document_version: 0.3.0
status: draft
locale: zh-CN
audience: [frontend_developer, designer]
related_modules: []
related_operators: []
related_apis: []
owners: [frontend-team]
reviewed_at: 2026-09-14
summary: 说明独立开发入口的组件示例、共享控件 API、隔离边界与新增示例验证方法。
---

# 青色工业组件实验场

## 用途与适用边界

组件实验场（Playground）用于在本机运行真实 Angular／Material／Formly 控件，检查青蓝工业外观、交互和组合方式。它不是普通生产业务路由，也不是训练、治理或工作流引擎。状态、点位、配置和结果数字为明确的本地示例；选择“运行中快照”不会创建任务，确认弹窗只记录本地操作。

首版位于 `feature/industrial-motion-details` 的未合并开发改动中，不属于 2026-09-13 核对的历史部署 `8f19280`；当前部署应读取共享协调板，不能由此历史版本推断。设计依据见[青色工业设计语言](./industrial-design-language.md)。本文不表示真实生产任务或全部控件状态已验收。

## 前置条件与启动

读者需要本机前端开发环境和仓库锁文件对应依赖，不需要平台登录或业务角色。先按前端 `AGENTS.md` 检查共享板与分支，不覆盖其他工作区修改；若尚未安装依赖，在前端仓库执行 `npm ci`。

```text
npm run start:playground
```

打开本机 [组件实验场](http://127.0.0.1:4213/dev/playground)。该命令只监听回环地址，端口为 4213。若端口被占用，先确认占用者，不停止无关服务。访问生产站点的同名路径不会获得此独立入口；应检查是否启动了 playground 配置，而不是普通 `npm start`。

独立构建命令：

```text
npm run build:playground
```

`angular.json` 的 playground 配置使用 `src/playground.main.ts` 和 `tsconfig.playground.json`，输出到 `dist/industrial-playground`；样式为 `src/styles.scss` 与专属 `src/playground/theme.scss`。普通生产构建仍使用 `src/main.ts`。独立入口仅初始化 RouterOutlet、动画、Material Formly 和实验场路由，不加载 AppShell、AuthService、HTTP providers、socket 或业务作业；`/dev/playground` 之外的路径在此独立应用中重定向到实验场，不增加生产路由。

## 使用流程与首版控制范围

1. 按“基础、控件、反馈、动效、组合”分类或按示例 ID／名称搜索。通过“独立打开此示例”或 `/dev/playground?example=data-table` 聚焦注册 ID；这是同一开发应用的查询参数，不是新业务路由。选择分类或搜索会清除 example 参数。搜索和分类组合过滤；基础与工作台示例主要通过 hidden 保留，分析四例采用条件模板可卸载控件，不将过滤统一视为保留或销毁测试。
2. 设置内容宽度（280–1600px），检查长名称、字段与布局。该值限制预览主区域宽度，不模拟设备视口或浏览器缩放。
3. 切换“禁用示例控件”和“减少动态效果”。禁用只影响已绑定该状态的示例：按钮、部分选择器、输入、复选／单选／滑块、参数区域、选择块和折叠示例的触发按钮等；它不是整页禁用锁，独立反向切换、状态选择和配置组合仍有可交互入口。
4. “方框／展开时长”范围为 0–2000ms，默认 260ms，修改实验场局部 `--sw-motion-disclosure`。消费同一令牌的过渡也会受到影响；它不是所有动画的统一调速器。选择标记线仍使用默认 420ms，菜单和面板等保留各自默认令牌／设置。减少动态效果另行覆盖 CSS，并关闭示例面板动画、缩短弹窗动画。
5. 实际改变表单值或选择项，观察前端校验与状态；交互记录仅保留最近 12 条已接入的事件，不是审计日志，也不会捕获每个属性变化。
6. 展开“用法与复用入口”查看源码路径和复制片段。片段是集成起点，使用前核对组件输入输出、standalone imports 和所需 providers，不能将片段视为完整业务实现。
7. 通过“恢复默认”清除独立示例参数、重置页面状态，并重建新增工作台示例子组件以清理其局部状态；没有跨会话持久化，刷新不会恢复本次修改。装饰区可切换三张预生成纹理并调整 120–1200px 显示尺寸，不会实时生成图像。

## 25 个注册示例

真实清单为 `src/playground/playground-catalog.ts` 的 `PLAYGROUND_EXAMPLES`，页面读取该目录；下面是当前 25 个注册项，不表示 25 套业务功能。工作台六例在 `workbench-examples.component.ts/html` 组合，分析四例在 `analysis-examples.component.ts` 组合，均使用局部示例状态，不连接业务服务。

| ID | 分类 | 名称与可检查内容 |
| --- | --- | --- |
| `colors` | 基础 | 语义色卡，复制 token 用法 |
| `type` | 基础 | 字体与空间，正文、辅助文字与间距样本 |
| `buttons` | 控件 | 按钮与禁用，主／次／文字操作 |
| `select` | 控件 | 统一选择框，长名称与选择反馈 |
| `fields` | 控件 | 输入与校验，本地必填和数值约束 |
| `checks` | 控件 | 可换行的显示选项／设备分段单选与整行强度滑块，本地值变化及 0–100 刻度 |
| `params` | 控件 | Schema 参数网格，真实 Formly 参数与有效性事件 |
| `status` | 反馈 | 状态与进度，就绪／运行中／成功／失败／空态快照 |
| `table` | 反馈 | 表格与固定表头，24 行合成点位与行按钮 |
| `dialog` | 反馈 | 对话框，Material Dialog 与工业面板 |
| `choice` | 动效 | 斜切选择与标记线，调用方持有选中项 |
| `disclosure` | 动效 | 展开与方框光效，保留内容与收起交互边界 |
| `panels` | 动效 | 面板分批进入，重播不提交请求 |
| `decor` | 基础 | 三种管线装饰与 s19/d6、s42/d8、s73/d11 预生成纹理 |
| `composition` | 组合 | 配置区域组合，Tabs、选择框、状态与固定结果示例 |
| `filter-toolbar` | 组合 | 搜索筛选工具栏，本地筛选、条件标签与结果数 |
| `data-table` | 组合 | 数据表格组合，本地排序／分页／选择与详情 |
| `detail-drawer` | 组合 | 局部详情抽屉，start／end 位置与长内容 |
| `config-wizard` | 组合 | 多步配置向导，Reactive Forms 校验与完成快照 |
| `task-feedback` | 组合 | 任务反馈面板，手动切换状态、取消申请与断线快照 |
| `file-upload` | 组合 | 文件选择与上传区：实际仅选择和检查文件元信息，不上传 |
| `series-toolbar` | 组合 | 时序分析工具栏，点位、图例与视窗意图，不读取数据 |
| `time-range` | 组合 | 时间范围与边界校验，显式应用 UTC+8 编辑草稿 |
| `resource-tree` | 组合 | 资源层级选择，原生 details 导航和保留祖先的搜索 |
| `property-inspector` | 组合 | 参数属性检查器，参数索引与完整 Formly 表单 |

## 新增共享控件 API

控件外观的小修仍属于未合并开发分支：共享选择框默认白色 `#fff`，菜单打开后 field 才变为浅青；当前选项为浅青底深字。共享选择块的 `SELECTED →` 独立为按钮外的兄弟 small，位于宿主右下角，aria-hidden 且不捕获点击，不进入按钮 label。按钮最小高 82px、底部 padding 30px 给角标留位；真实选中语义仍是按钮 aria-pressed，API 不变。

`checks` 的 `control-lab` 使用 flex 换行，两个 control-cell 分别容纳显示复选项和 CPU／GPU 分段单选，range-cell 整行显示强度值、Material slider 与 0–100 刻度。它只是 `playground.page.html/scss` 的示例组合，仍使用 Material checkbox／radio／slider 和原本地绑定，不新增基础控件。CPU／GPU 标签只演示单选样式，不查询硬件或启动任何设备上的计算。

以下文件位于前端 `src/app/shared/components/`。这些组件是实际可运行的展示／交互组件，不是 `ControlValueAccessor`（CVA）适配器；不要直接假定它们支持 `formControl`、`formControlName` 或组件级 `ngModel`。选择与展开等受控输入由调用方回写，业务请求由调用方处理。

| 组件／选择器 | 输入 | 输出与边界 |
| --- | --- | --- |
| `IndustrialSelectComponent` / `app-industrial-select` | 必填 `label: string`、`items: readonly { id: string; name: string }[]`；`value=''`、`disabled=false` | `valueChange: string`；内部 Material Select 管理键盘与菜单，label 用作可访问名称，内部 open 状态只驱动方框图标 |
| `IndustrialStatusComponent` / `app-industrial-status` | 必填 `label: string`；`tone: 'neutral' \| 'success' \| 'warning' \| 'danger'`，默认 neutral | 无输出；颜色与文字呈现状态，不跟踪任务，也不自动提供 live region |
| `IndustrialChoiceComponent` / `app-industrial-choice` | 必填 `label: string`；`number=''`、`selected=false`、`disabled=false` | `chosen: void`；可选编号展示，Material 按钮使用 aria-pressed，调用方决定如何切换选中项，不内建任务导航 |
| `IndustrialDisclosureComponent` / `app-industrial-disclosure` | 必填 `label: string`；`expanded=false`、`disabled=false` | `expandedChange: boolean`；disabled 禁用触发按钮；自动生成面板 ID 并以 aria-controls 关联，投影内容保留 DOM，关闭时 inert／aria-hidden |

对应文件名依次为 `industrial-select.component.ts`、`industrial-status.component.ts`、`industrial-choice.component.ts`、`industrial-disclosure.component.ts`。共享选择器消费工业主题和显式菜单 panelClass，移植时需保留主题入口。状态文字若需要即时播报，由实际业务容器按语义提供 `role="status"` 或错误通知，不能仅靠颜色。

实验场同时复用已有 `IndustrialPanelComponent`、`SquareToggleIconComponent`、`OperatorParameterFormComponent`、`PipeBlueprintComponent`、`PanelMotionDirective` 和 `ViewportTextureDirective`。参数示例配置真实 Formly providers，但 Schema 内“训练轮数”等名称只是演示字段，不连接训练服务；不要据此宣称训练已经执行。

### 工作台组合新增 API

下面五个共享组件没有 HTTP、认证或任务引擎依赖。文件名依次为 `industrial-filter-bar.component.ts`、`industrial-data-table.component.ts`、`industrial-detail-drawer.component.ts`、`industrial-task-feedback.component.ts`、`industrial-file-picker.component.ts`。

| 组件／选择器 | 输入 | 输出 |
| --- | --- | --- |
| `IndustrialFilterBarComponent` / `app-industrial-filter-bar` | `query=''`、`filter='all'`、`searchLabel='搜索名称'`、`disabled=false`、`resultCount=0`；`options` 为只读 `{id,name}[]`，默认 all／ready／issue | `queryChange: string`、`filterChange: string`、`reset: void` |
| `IndustrialDataTableComponent` / `app-industrial-data-table` | `rows=[]`；`columns` 为只读 `{key,label}[]`，默认 name／status；`state='ready'`，可取 ready／loading／error／forbidden；`errorMessage` 默认列表加载失败提示 | `openRow: IndustrialTableRow`、`batchAction` 与 `selectionChange` 为只读 string ID 数组、`retry: void` |
| `IndustrialDetailDrawerComponent` / `app-industrial-detail-drawer` | `position: 'start' \| 'end'='end'`、`title='资源详情'`、`open=false` | `openChange: boolean`；`[drawer-details]` 投影详情，其余投影主区域 |
| `IndustrialTaskFeedbackComponent` / `app-industrial-task-feedback` | `state='queued'`，可取 queued／running／success／failed／cancelled／disconnected；`stage='等待处理'`、`message=''`、`elapsedSeconds=0`、`progress: number \| null=null`、`cancelPending=false` | `cancel`、`retry`、`refresh`、`viewResult` 均为 void |
| `IndustrialFilePickerComponent` / `app-industrial-file-picker` | `maxBytes=10*1048576`、`extensions=['.csv','.xlsx','.json']`、`disabled=false` | `changed: readonly IndustrialFileChoice[]`，每项仅含 `id/name/size/error` |

筛选栏只发出输入与重置意图，过滤和 resultCount 由调用方计算。表格的 `IndustrialTableRow` 要求 string ID，其余字段值为 string 或 number；排序、分页与选择在组件内进行，默认每页 5 条，可选 5／10／20。表头全选仅针对当前页，可保留其他页已选 ID；输入 rows 因筛选变化时回到第一页，剔除已不在 rows 中的选中 ID，并在选择确有变化时发出 selectionChange。它不是服务器分页控件，批量操作和重试只发事件，不读写资源或重新请求数据。

详情抽屉基于 Material Drawer 的局部容器与 over 模式，默认从 end 展开，支持 start。它不是全平台页面级抽屉或全屏导航；调用方持有 open 与详情，Material 负责原焦点与关闭交互。长内容、遮罩、Escape 和焦点恢复仍须在实际容器验收。

任务反馈仅呈现输入快照：queued／running 收到有限数值 progress 时按 0–100 范围显示阶段百分比，否则显示不确定进度。elapsedSeconds 也是输入，不启动计时器。点击取消只发出 cancel，不自动改为 cancelled；示例调用方将 cancelPending 置为 true，等待人工切换到取消快照。disconnected 表示状态暂未同步，不等于失败或取消；refresh、retry、viewResult 都不内置网络动作。

文件选择器最多保留 20 项，默认单文件上限为 10×1048576 字节。点击或拖入文件仅检查名称后缀和大小：空文件、不支持后缀、过大文件不通过校验，但错误项仍展示在列表并包含在 changed 元信息中；超出 20 项的部分不加入。检查后缀不是验证文件内容格式。组件不读取内容、不保存 File 对象给调用方、不上传；changed 不是上传载荷，载入示例也只生成固定元信息。它不能直接替代生产上传器，真实上传、内容解析和重试必须另行设计并接入现有服务。

`config-wizard-example.component.ts` 是实验场专属组件，不是新增共享向导引擎。它组合 Material Stepper 与 Reactive Forms：配置名称必填，窗口点数为 4–512，支持横／纵步骤、返回修改和重置；确认后显示选定的成功／失败快照，没有算法执行、版本生成或后台持续运行。

## 新增示例与迁移到业务页面

### 分析组件 API 与边界

四个新增文件位于 `src/app/shared/components/`，仍为非 CVA 展示／事件组件，不提供请求、图表实例或执行引擎。

| 文件／组件 | 输入 | 输出 |
| --- | --- | --- |
| `industrial-time-range.component.ts` / `IndustrialTimeRangeComponent` | `start/end/minimum/maximum=''`；`minimumSpanMs=0`；`zone: '+0800' \| '+0000'='+0800'`；`editable=false`、`disabled=false`；`preset='all'`、`presets` 为 `{id,name}[]`，默认全部／最近 1、3、7 天／自定义 | `presetChange: string`、`rangeCommit: {start:string;end:string}` |
| `industrial-series-toolbar.component.ts` / `IndustrialSeriesToolbarComponent` | `points/metrics=[]`（`{id,name}[]`）、`point/metric=''`；`series=[]`（`{id,label,color,visible}[]`）；`interactiveLegend=true`、`disabled=false` | `pointChange/metricChange: string`；`visibilityChange: {id:string;visible:boolean}`；`viewportAction: 'zoom-in' \| 'zoom-out' \| 'reset'` |
| `industrial-resource-tree.component.ts` / `IndustrialResourceTreeComponent` | `nodes=[]`（`{id,label,children?,disabledReason?}[]` 递归节点）、`value=''`、`disabled=false` | `valueChange: string`，仅叶节点选择 |
| `industrial-property-inspector.component.ts` / `IndustrialPropertyInspectorComponent` | `label='参数属性'`、`schema: ParameterSchema={}`、`model: Record<string,unknown>={}`、`disabled=false` | `parametersChange: Record<string,unknown>`、`validityChange: boolean` |

时间控件默认只读显示，输入应为含明确时区的时间。editable 模式用分钟精度的 datetime-local 草稿，按 UTC+8 或 UTC 解释，点击应用后才输出 UTC ISO 时间；无效日期、结束早于开始、超出 minimum／maximum 或小于 minimumSpanMs 时显示错误且不输出提交。还原读取原 start/end，预设只发出 ID，不自行读取数据或计算业务选区。时间跨度不是样本点数，不能替代训练切分、采样间隔和最小输入点数校验。

工具栏只发选择、图例和视窗意图，调用方必须接到实际图表或业务选区；实验场中只是事件演示，没有新增时序图。资源层级组件使用 nav、原生 details／summary 和叶节点按钮，不是 ARIA tree，也不宣称树控件方向键导航。搜索保留匹配后代的祖先，节点 disabledReason 显示不可用原因；全局 disabled 禁止搜索与叶节点选择，但不是禁止原生分组展开的页面锁。

属性检查器搜索仅匹配顶层参数键与标题的索引，不过滤 Schema、不卸载字段或跳过校验。收起保留完整 compact Formly 表单；disabled 禁用搜索并将表单设为 inert，展开开关仍可操作。参数模型和有效性透传给调用方，不能把搜索命中数当作当前参与校验字段数。四个分析示例使用条件模板：切换不可见示例可卸载对应控件；这与检查器内部搜索／收起保留表单是不同边界。

### 当前快速试用接入核查

以下是 `feature/industrial-motion-details` 中的源码接入，不是已上线或全部计划完成的声明。实验场样本不替代快速试用业务组件。

| 接入点 | 当前共享组件与原绑定 | 保留的业务边界 |
| --- | --- | --- |
| 算法／模型版本 | task-selector 与 model-controls 使用 `IndustrialSelectComponent` | 算法 valueChange 继续发原选择事件；模型版本仍写原 modelVersionId，运行／等待／busy 禁用保持 |
| 左侧任务卡 | quick-trial.page 使用 `IndustrialChoiceComponent`，传编号／selected／disabled | chosen 继续调用 onTaskChange，不新增路由或任务状态服务 |
| 输入时间范围 | input-panel 使用 `IndustrialTimeRangeComponent`，默认只读 UTC+8 | presetChange 调用 selectWindow；不启用任意时间编辑，不把跨度校验当训练点数校验 |
| 预览工具栏 | input-panel 使用 `IndustrialSeriesToolbarComponent`，图例只读 | zoom 意图经 adjustViewport → onZoom → applyWindow；全部时段经 selectWindow → applyWindow，仍执行真实选区不足恢复与警告 |
| 训练参数 | model-controls 使用 `IndustrialPropertyInspectorComponent`，label 为“训练参数 · 按当前算法配置” | 原 trainingSchema／trainingParameters／trainingValid 继续绑定；完整 Formly 与 busy 门禁保留；移除原外层 MatExpansion，避免双重折叠 |
| 上传、执行与结果 | 保留原上传处理、任务跟踪、DataFilePreviewPanel 映射与结果组件 | 不换成元信息 FilePicker、反馈快照或实验场固定结果；资源树目前仅作为实验场示例，不宣称已接管数据资源页 |

验收时应检查预览工具栏放大后不足选区的恢复、时区往返、只读模式、参数搜索／收起后无效字段仍阻止提交，以及原上传／跟踪／映射／结果链路回归。当前文档仅完成源码核对，实际检查结果由对应任务记录。

### 添加示例步骤

1. 在 `playground-catalog.ts` 的 `PLAYGROUND_EXAMPLES` 增加唯一 ID、分类、名称，并在主模板或工作台子模板添加对应 `pg-example`，接入相应可见 ID。页面总数从目录计算；更新测试断言，避免注册与模板脱节。
2. `pg-example` 来自 `example.component.ts`，提供必填 `title/source/snippet` 和可选 `code`，内容通过投影展示。title 要与目录名称一致，组件据此查找 ID 并用 RouterLink 生成独立打开链接。引用真实组件并写明源码入口，不复制另一套控件样式。
3. 在页面或独立示例组件中建立有界本地状态、事件和必要重置逻辑；新增工作台例由子组件维护状态，页面恢复默认会重建该子组件。不引入生产 Auth／HTTP／socket／任务服务。异步资源必须在销毁时清理，状态快照显式标注“示例”。
4. 对外可复用能力放在共享组件，实验数据、调节面板与演示组合留在 `src/playground/`。业务页面使用时单独接入原权限、参数校验和任务状态，不将实验场状态服务化或当作执行引擎。
5. 补充定向测试和人工检查，再分别构建 playground 与 production，检查入口隔离。文档更新后交独立审核，不因实验场可用而自动发布业务页面。

## 验证、隔离与失败处理

在前端仓库执行：

```text
npx ng test --watch=false --include="src/playground/playground.page.spec.ts"
npm run build:playground
npm run build
rg -n "CYAN_COMPONENT_PLAYGROUND|pg-example" dist/smart-water-platform-frontend/browser
```

最后一条检查普通生产输出，不能指向 `dist/industrial-playground`；若项目调整 outputPath，应先确认实际生产目录。无匹配时 rg 返回 1，表示此标记检查未发现入口，不是构建失败。协调者报告首版生产产物检查未发现上述入口标记；这是一项有界隔离证据，不等于所有潜在依赖和安全路径已经穷尽验证。共享组件代码可合法进入生产构建，隔离目标是实验场入口和专属工具，不是禁止复用共享控件。

现有 `playground.page.spec.ts` 检查注册 ID 唯一性、分类／搜索、设置边界和重置，不覆盖所有真实 DOM 交互。人工验收至少记录：

- 键盘访问选择框、按钮、单选／滑块；禁用入口不可操作，焦点清晰。
- 长选项名称与窄宽不遮挡箭头、光环和菜单；区分主区域宽度设置与实际手机视口检查。
- 对话框的初始焦点、Tab 约束、Escape／取消／确认关闭与焦点恢复。
- 折叠后内容退出键盘和无障碍访问，重新展开保留值；折叠触发按钮的 aria-controls 对应面板 ID，disabled 时不可操作。disabled 不自动禁用已展开的投影内容，也不阻止调用方修改 expanded；不要将实验场禁用开关误认为整页交互锁。
- 减少动态效果、快速反向切换、面板重播和卸载清理；独立样式覆盖应包含浮层，不修改系统偏好。
- 固定表头遮住滚动行按钮但不遮住真正的浮层；状态样本含文字，不用动画表示真实百分比。
- 新表格检查本页全选／部分选中、跨页保留、筛选后无效 ID 清除与 selectionChange；不要把 ready、空数据、loading、error、forbidden 混为一种状态。
- 抽屉检查 start／end、局部遮罩、长详情滚动和关闭焦点；向导检查必填／数值边界、返回修改、横纵步骤及重置后的快照。
- 文件选择检查按钮与拖放替代入口、空文件／不支持后缀／过大提示、20 项限制、移除与清空；任务反馈检查取消待确认、取消终态与 disconnected 的区别。
- 本机网络面板无实验场触发的认证、业务 HTTP、业务／任务实时连接或后台任务；Angular 开发服务器用于热更新的本机 HMR WebSocket 是允许的，不要求零 WebSocket。若发现业务依赖，先移除业务注入，不用 mock 服务掩盖隔离问题。

无匹配示例时调整搜索／分类或恢复默认；复制未成功时可手动选择展开区中的片段，不把“点击复制”日志当作剪贴板成功证明。构建或测试失败应定位实际组件／配置，不通过删除校验或隐藏错误完成演示。

当前已有局部详情抽屉、多步配置、多文件元信息和四种分析控件交互；仍无服务器分页、真实上传／网络重试、持续运行／后台任务、时序图示例、实时纹理生成、全套属性编辑器或跨会话存储。属性检查器只是现有 Schema 表单的索引与展开包装，不代表全套属性编辑计划完成。它提供可操作的组件参考，不替代真实生产流程、自动化可访问性审计或全状态验收。

## 维护依据

前端仓库的 `package.json`、`angular.json`、`tsconfig.playground.json`、`src/playground.main.ts` 定义入口和构建；`src/playground/playground-catalog.ts` 定义注册目录，`playground.page.ts/html/scss` 定义页面交互和独立打开，`workbench-examples.component.ts/html` 与 `config-wizard-example.component.ts` 定义新增局部示例。`theme.scss` 定义实验场专属减少动态效果覆盖，`example.component.ts` 与 `playground-dialog.component.ts` 定义示例容器和弹窗。已列出的共享组件是 API 事实来源；接入前必须读实际 Input/Output，不从示例名称推断业务能力。
