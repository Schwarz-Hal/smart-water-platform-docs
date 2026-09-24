---
id: development.industrial-page-rollout
title: 工业风页面迁移与维护边界
document_type: development
document_version: 0.1.0
status: draft
locale: zh-CN
audience: [frontend_developer, designer]
related_modules: []
related_operators: []
related_apis: []
owners: [frontend-team]
reviewed_at: 2026-09-23
summary: 说明数据中心、统一数据资源与任务页面的工业风接入、展示职责拆分及本地验证边界。
---

# 工业风页面迁移与维护边界

## 用途与当前状态

本文供维护者定位已接入的真实页面和保留的业务职责，配合[组件实验场](./industrial-playground.md)及[设计语言](./industrial-design-language.md)使用。2026-09-23这批改动位于前端 `feature/playground-foundation`，仍为本地未提交、未合并、未部署内容；不能由本文推断服务器界面已更新。

统一采用用户选定的B工程折角，复用 Angular Material、CDK、现有主题令牌和共享面板。本批不新增后端API、权限、算法、任务执行引擎或数据库迁移；公共接口契约不变。另一工作区的未提交漏损UI不属于本批合并成果。

## 已接入的页面范围

以下路径相对于前端仓库 `src/app/features/`。覆盖表示源码已经使用相应组件和样式，不等于所有状态及真实服务流程均已验收。

| 页面／入口 | 本批接入 | 保留的业务边界 |
| --- | --- | --- |
| 数据中心四个入口：数据资产、质量概览、治理任务、规则与模板 | `data-sources/data-center.page.*` 统一标题及页签；对应列表、报告、筛选和面板使用工业风层级 | 文件、版本、报告与模板仍由原服务读取；权限检查和治理任务跟踪继续由原页面／Store承担 |
| 数据资产 | `data-sources/data-collections.page.*` 统一列表表面、操作布局与摘要层级 | 保留数据集展开、无归属文件、文件操作、预览和治理入口，不复制文件管理引擎 |
| 统一数据资源高级创建 | `data-resources/data-resources.page.*`、`resource-source.component.*`、`resource-workbench.scss` 统一来源、字段映射和表单布局 | 文件／版本加载、候选字段、显式确认及来源提交仍使用原契约 |
| 自动识别时序资源 | `data-resources/automatic/automatic-timeseries.dialog.*` 统一来源、识别结果、微调和样本预览区域 | 继续读取已有画像，保留单位／时区确认、创建／追加及未保存关闭行为；样本不冒充全量校验 |
| 任务列表与详情 | `task-detail/task-center.page.*`、`task-detail.page.*` 统一筛选、状态摘要、列表、日志和操作区域 | 保留原任务ID、分页、权限、重跑／取消、状态与日志请求；不改写追踪生命周期 |

这不是全平台迁移完成声明。算子、训练、工作流画布和辅助管理页面仍需后续逐页检查；数据中心的业务弹窗也不能仅凭外层改版就认定所有细节已统一。隐藏的旧数据源页面不因本批重新开放。

## 展示职责如何拆分

| 文件／组件 | 自身职责 | 不应接管的职责 |
| --- | --- | --- |
| `data-sources/quality-report/quality-report-view.component.*` | 展示质量维度、报告标识、发现说明，并发出问题处理意图 | 报告请求、历史选择、精确版本定位、是否可以发起治理仍由父页面负责 |
| `task-detail/components/task-list-row.component.*` | 呈现单行任务，发出打开、重跑、删除和目标跳转事件 | 不请求列表、不判定权限；可操作标志和事件处理来自父页面 |
| `task-detail/components/task-log-panel.component.ts` | 呈现传入日志、空状态和局部滚动区 | 不建立轮询、Socket或日志请求，不把无日志判定为任务失败 |
| `data-resources/resource-source.component.html` | 承担来源选择与映射模板，减少控制器内联视图体积 | 控制器继续负责来源联动与输出契约；这是视图分离，不是服务层重构完成 |
| `data-sources/assets/asset-presentation.ts` | 提供文件大小与相对更新时间格式化 | 不加载文件、不保存状态；不能套用到业务来源中的任意无时区时间 |

这些拆分以输入和事件形成边界，而非把同一段逻辑机械移到另一个文件。质量报告和任务行使用展示组件；真实请求、授权和状态转换保留原所有者。

`data-collections.page.ts` 仍约1200行，文件操作编排等职责尚未继续拆解。后续应按操作协调、选择状态、视图组合逐块处理，不为降低行数而增加跨组件状态耦合。

## 控件与样式约束

- `IndustrialPanelComponent` 只保留工程折角；不再传 `cornerStyle`，不保留生产端A／C切换。旧 `corner-variants` 示例链接继续有效，但仅展示B方案。
- `IndustrialPageHeaderComponent` 增加 `level: 1 | 2`，默认2；独立页面使用1，内嵌内容保持正确标题层级，样式不决定文档层级。
- 资源来源选择器使用 `mat-form-field` 包裹的 `select matNativeControl`，保留原生 `change` 事件和原表单值类型。原先字符串选项继续使用字符串；自动识别中已有 `[ngValue]` 的数字或空值不改为字符串。不要直接替换成 `mat-select` 后沿用不匹配的事件接口。
- 宽表格局部横向滚动，正文与操作区可换行；窄屏调整布局而非裁掉主要操作。颜色之外继续提供状态文字。
- 质量概览、治理任务与模板复用 `industrial-foundation/paginator-labels.ts` 的中文 `MatPaginatorIntl` 工厂，不改变原分页请求和总数来源。
- 本批不新增持续装饰动画，不用动画代替真实进度；既有减少动态效果规则继续适用。

## 本地检查与后续验收

独立实验场与离线业务预览的用途不同：前者查看共享组件的固定样例；后者运行真实业务页面，但响应来自开发专用样例。普通生产构建仍保留真实服务请求，不能把离线保存或运行反馈视作服务器执行证据。

本批开发专用 `src/app/developer-offline/handlers/data-resources.handlers.ts` 在离线 providers 中注册，复用既有时序样例，提供资源列表、元数据、点位、时序读取及固定识别建议。识别响应并未解析真实文件；预检、构建与追加明确返回501“不支持此离线操作”，不生成任务。此补充不新增真实API或更改业务DTO。

2026-09-23本地最终回归为57个测试文件、244项通过。默认并发下，QuickGovernance动态导入测试曾发生一次5秒超时；未修改测试超时、未跳过测试，临时将 `maxWorkers` 限为2后全量通过。生产与Playground构建均通过，生产初始包673.84kB的既有预算警告及Rete依赖警告仍保留，不将成功构建表述为无警告。

浏览器已核对数据中心四页签、质量报告详情、任务列表／详情、统一资源版本选择与读取、自动识别选择，以及390px宽度下的弹窗。这些业务页面检查使用固定离线样例，未执行发布类写操作、未连接服务器验收，也不代表全平台已完成迁移。后续接入真实服务时仍需检查：

1. 数据中心四页签切换、URL恢复、筛选和分页；报告仍绑定正确文件版本。
2. 质量问题处理继续进入原治理配置；无权限用户不新增可执行入口。
3. 资源高级创建与自动识别分别检查选择值类型、重新选择来源、字段确认、提交及关闭确认。
4. 任务列表单行事件只触发一次；日志为空、更新和长内容时不阻塞状态与操作。
5. 在1440、1024、768、390px检查页头、面板折角、表格滚动、表单和固定操作区；同时检查键盘焦点与减少动态效果。
6. 普通构建与Playground构建分别通过，生产产物不带实验场独立入口；相关既有测试不回退。

发现问题时先区分展示错误与服务错误：组件只修正本身的布局、值传递或事件；请求、权限、状态同步问题交回原服务边界处理。服务器部署与真实数据验收需另行授权，本批不执行。

## 维护依据

共享组件源文件位于 `src/app/shared/components/industrial-panel.component.*` 与 `industrial-foundation/page-header.component.ts`；示例目录为 `src/playground/playground-catalog.ts`。业务接入依据为上表对应组件、模板及样式。更新时同步核对父组件输入、输出事件和已有测试，不从页面截图推断后端能力。
