---
id: development.extension-author-tooling
title: 扩展作者工具与独立开发包
document_type: development
document_version: 0.2.0
status: draft
locale: zh-CN
audience: [developer]
related_modules: [M02, M03, M04, M05]
related_operators: []
related_apis: ["/api/v1/extensions/preflight"]
owners: [backend-team, frontend-team]
reviewed_at: 2026-10-04
summary: 说明作者项目、七类用途模板、资源增量、预检依赖锁、分层测试、预览及平台上传边界。
---

# 扩展作者工具与独立开发包

## 用途与当前状态

第一次开发扩展，可先阅读[扩展开发者入门与能力边界](./extension-developer-introduction.md)。本文提供安装、命令和本地调试的具体步骤。

SDK 工具用于在平台源码之外编写和检查扩展：建立作者项目、登记资源声明、编译成既有扩展清单、检查依赖、分层测试、预览结果视图，最后生成扩展 ZIP。工具不会授予平台账号、上传权限或运行环境审批。

本文对应工具版本 0.2.0。此版本号只表示作者工具；不等于运行 SDK 0.1.0、manifest schema 2.0 或执行协议 1.0 升级。独立包已在干净临时虚拟环境中安装，作者 CLI 的创建、增量添加、锁定、测试、编译、打包、检查和报告新鲜度流程均已走通。QuickJS 浏览器预览覆盖正常、空、缺失、错误输入及恢复流程，四档视口已实测。扩展导入预检页面在临时合成账号和内存目录下完成真实后端预检及四档视口/键盘检查；这不是正式上传、安装或生产部署验收。经授权的临时服务器验收中，既有批准镜像通过六类真实容器检查，清理已核实；不据此声称生产发布或完整平台任务生命周期已验收。本批尚未提交、推送或部署。

## 前置条件与角色

- 扩展作者需要 Python 3.12（`>=3.12,<3.13`）和 pip；使用本地渲染预览时还需要现代浏览器及开发包中的预览资源。SDK 的发行包名为 `smart-water-extension-sdk`；下文分别说明从 Neo 源码树或独立开发包安装。
- `sdk/python/` 是可安装的 SDK 源码；SDK 的直接依赖不等于平台固定运行档的全部依赖。运行镜像和运行档由平台审批，不由包内依赖声明自行安装。
- 独立开发包包含前端类型提示、预览渲染器与资源索引；导出包已在干净临时环境完成安装和作者 CLI 流程验证。这不表示它已发布到 PyPI／npm，也不表示平台已部署相同版本。
- 公开分享的示例、截图及诊断不得暴露凭据或敏感数据，应使用合成或已获准公开的数据。本地工具可读取作者显式选择且有权使用的数据，不新增禁止使用真实数据的规则。仅对自己掌握并信任的 Python 源码使用 `run-local`；未知上传代码不能为检查而导入或运行。

## 最短作者流程

### 1. 安装、生成与检查

从 Neo 仓库根目录安装 SDK：

```console
python -m pip install ./sdk/python
```

使用独立开发包时，在解压后的开发包根目录安装其中的 SDK：

```console
python -m pip install ./python
```

以下命令均在放置新项目的工作目录执行，也就是 `my-extension` 的父目录；不要先切换到 `my-extension` 内部。

源码工具版本为 `0.2.0`。新项目默认使用 `algorithm` 模板；`init` 只创建新目录，不覆盖已有内容。支持七种用途：`algorithm`、`node`、`type`、`visualizer`、`workflow`、`scene`、`timeseries`。历史 `--template legacy` 仍可生成旧式直接清单项目。

```console
swext --version
swext init ./my-extension --namespace my-water --name scale-tools
swext check ./my-extension
swext inspect ./my-extension
swext build ./my-extension --output ./build/my-extension
swext pack ./build/my-extension ./scale-tools-build.zip
```

作者项目以 `extension.project.json` 和 `resources/*.json` 为声明来源；`python/`、`web/` 与 `fixtures/` 放置实现和样例。`swext build` 把声明编译为既有 manifest schema 2.0，不改变运行清单协议。默认算法可声明生成默认节点；生成节点仍指向同一算法入口，不复制业务实现。`swext add KIND CODE` 可增量加入资源骨架；它不会覆盖已有文件，项目索引更新失败时会清理本次新建文件。生成清单放在新输出目录中，不能编辑它代替作者源。

作者命名空间最多 40 个字符，使用以小写字母开头的编码；平台会另外添加所有者前缀。显示名称可使用中文，不必把中文名称放入命名空间。

作者源码、生成的清单/ZIP、测试报告和依赖锁各有用途：源码是编辑入口；构建目录及 ZIP 是可重建产物；测试报告记录某个源码与环境摘要下的样例执行；`extension.lock.json` 记录精确依赖提供方及源摘要。不要把测试报告当作上传产物或把锁文件当作测试结果。

`check`、`inspect` 和 `diff` 默认输出面向作者的摘要；加 `--json` 获取结构化结果。`check` 会核对声明、文件、入口与项目编译结果；`inspect` 显示资源、精确引用和来源位置；`diff OLD NEW` 提供保守的结构差异，不证明算法语义兼容。静态命令不会导入或执行扩展 Python。通过检查不代表平台已上传、注册、安装或批准执行。

### 资源依赖与锁文件

预检的技术信息区提供【下载依赖快照】。若浏览器未开始保存，可用【复制快照】或【查看内容】取得完整 JSON，并另存为 UTF-8 编码的 `extension-dependencies.json`；不要省略字段或改写摘要。

`swext lock PROJECT [--snapshot FILE]` 只替换生成的 `extension.lock.json`，不会改写作者声明、Python/JavaScript 源码或其他文件。SDK 会把项目根目录锁文件收入生成包并校验。锁文件中的 `source_sha256` 将资源源绑定到精确依赖提供方；源码变化会使静态检查报 `SDK_LOCK_SOURCE_CHANGED`。若源码改动导致旧锁失效，不要手动删除或编辑锁文件：先用 `swext pack PROJECT OUTPUT --without-lock` 生成不含旧锁的预检 ZIP。此选项只影响输出 ZIP，不会删除或修改源目录锁文件。将该 ZIP 提交只读平台预检并下载依赖快照，再运行 `swext lock PROJECT --snapshot ./extension-dependencies.json` 原子更新源目录锁，最后正常 `swext pack` 并复查 ZIP。前端下载的文件名为 `extension-dependencies.json`；示例假设已将其放在当前命令工作目录，否则 `--snapshot` 应填写实际下载路径。若项目含外部依赖，首次生成锁也按此预检流程获取快照。预检的 `dependency_snapshot` 中包含 `source_sha256`；预检结果顶层的 `lock_status` 为 `not_provided`、`matched` 或 `changed`。锁不匹配时 `lock_status=changed` 且 `can_upload=false`。`EXTENSION_DEPENDENCY_LOCK_CHANGED` 则用于平台解析或安装时依赖/当前账号不匹配；它不是上述预检结果的同义状态。快照是当时可见依赖的核对材料，不是授权凭证；平台仍会在解析和安装阶段重新解析并复核授权、精确版本与提供方。私有且不可访问的依赖与缺失依赖保持同态，不能据此推断其身份。

```console
swext pack ./my-extension ./preflight.zip --without-lock
swext lock ./my-extension --snapshot ./extension-dependencies.json
swext pack ./my-extension ./scale-tools-1.0.0.zip
```

## 环境诊断与分层测试

`swext doctor` 检查本机 Python/SDK，不指定运行档时不会连接 Docker。需要容器测试时，管理员提供的 runtime 描述文件必须含 `runtime_version`、不可变 `image` 和 `profile`；镜像必须是 digest 引用。工具不会拉取镜像，也不会在容器不可用时回退到宿主机。

```console
swext doctor
swext doctor --runtime ./runtime.json
swext test --package ./my-extension --output ./test-local --trust-local-code
swext test --package ./my-extension --output ./test-container --runtime ./runtime.json
swext verify-report --package ./my-extension --report ./test-local/test-report.json
```

`test` 必须且只能选择 `--trust-local-code` 或 `--runtime FILE`。前者在本机直接运行作者信任的代码，不是沙箱；后者使用指定不可变镜像。测试报告记录包与环境摘要；`verify-report` 只检查报告是否仍匹配当前源码/运行环境，不代表平台授权、容器隔离验收或算法正确性。源码或环境变化后，旧报告不能作为当前结果。

模板会为算法/节点测试生成 `local-requests/scale.json`，并为视图生成 `fixtures/scale-preview.json`。预览用例文件 `preview-cases/{visualizer-code}.json` 是开发专用输入，不打入扩展 ZIP；最多 16 项，文件最大 8 MiB，每项包含 `id`、`label`、`input`。切换用例只替换输入，不改脚本，也不会自动触发渲染；仍需显式点击渲染。时序模板使用 `average` 示例，含正常、空、缺失和错误输入；示例仅说明接口形状，不代表水务算法。

### 2. 显式运行自己的可信 Python

```console
swext run-local --trust-local-code --package ./my-extension --request ./my-extension/local-requests/scale.json --output ./local-output
```

预期 `local-output/result.json` 中 `outputs.result.payload` 为 `12`，并保留精确类型引用。该命令直接在本机 Python 中运行源码，不是沙箱或隔离测试；本机依赖可用也不代表平台运行档允许该依赖。不要将它用于未知上传包，平台缺少 Docker 或批准环境时也不得回退到此命令。

### 3. 启动真实渲染预览

以下命令仍在工作目录（`my-extension` 的父目录）执行。示例假设独立开发包解压在 `./smart-water-sdk-kit`，预览资源目录位于其中的 `preview/`。

```console
swext preview --package ./my-extension --visualizer scale-view --input ./my-extension/fixtures/scale-preview.json --assets ./smart-water-sdk-kit/preview
```

`--visualizer` 只能选择清单中已声明的可视化编码；候选不唯一时必须明确选择，仍有版本歧义则拒绝。输入文件是原始 JSON，样例文件内容为数值 `12`，直接成为 `render` 的 `input`。预览不会自动拆开 `result.json`；调试运行结果时应另存所需 `payload`，不能把完整执行结果信封当成原始数值输入。

打开命令打印的本机回环 URL，保留首次打开所需的会话 fragment。默认 `--port 0` 选择空闲端口。页面从 fragment 取出会话令牌并清除地址栏中的该 fragment，以 `X-Swext-Session` 请求同源会话；令牌不传给 renderer，也不进入查询参数或存储。服务仅提供已索引的固定预览资源及冻结的会话，不开放目录浏览、任意文件读取、写入、跨域访问或平台登录。不要把本机会话链接当作公开预览地址分发。

CLI 启动时冻结源码与输入；修改磁盘文件后，按 Ctrl+C 停止并重新启动以读取新快照。页面编辑器内的修改只用于当前浏览器预览，不写回磁盘。也可以在页面的本地文件模式选择或粘贴 JS 和 JSON；这不需要平台 API、配置或凭据。

### Legacy 清单脚手架

只有使用 `swext init ... --template legacy` 时，才按旧式直接清单项目编写本地请求与资源路径；上面的 `scale` 示例使用新作者项目模板，不适用旧路径。

### 4. 静态打包与复查

```console
swext pack ./my-extension ./scale-tools-final.zip
swext check ./scale-tools-final.zip
```

打包会收集编译后的 `extension.json`、`extension.project.json`、`resources/`、约定源码目录 `python/`、`web/`、`docs/`、`fixtures/`，以及存在时的 `extension.lock.json`。`preview-cases/` 和 `local-requests/` 是开发专用目录，不进入扩展 ZIP。已有 ZIP 不会被覆盖；构建检查和最终包请使用不同文件名，例如 `scale-tools-build.zip` 与 `scale-tools-final.zip`。生成的 ZIP 是上传候选，不是已经发布的扩展版本。

## 渲染、交互与失败处理

载入会话或本地文件不会自动执行脚本。点击“渲染预览”后，宿主调用自包含脚本中的全局函数 `render(input, state, event)`；首次和显式重渲染的 `state` 为 `{}`、`event` 为 `null`。返回值需符合 `frontend/index.d.ts`，使用 `protocol_version: '1.0'`、标题及允许的视图块。

允许的块为 `text`、`metrics`、`table`、`chart`、`network` 和受限 `canvas`。不支持任意 HTML、CSS、SVG、模块导入、DOM、网络请求或宿主回调。渲染成功后可检查当前原始输入、返回状态和最近 action；视图按钮发送 `{id}`，带着上次通过校验的状态重新执行 JavaScript，不提交平台任务或重新计算 Python 算法。“重置状态”使用当前编辑内容重新渲染，从空状态开始。

编辑源码或输入会取消当前 worker；已有成功视图可以保留，但标记为过期并禁用动作。渲染失败也不会把旧视图当作新成功结果，编辑内容保留，修正后需要再次点击渲染。会话读取失败时可保留本地编辑或选择“重新读取会话”。

| 现象或错误 | 处理 |
| --- | --- |
| `SDK_PREVIEW_ASSETS_MISSING` | 将 `--assets` 指向开发包的 `preview/`，确认含 `preview-assets.json`，不要用任意项目目录替代。 |
| `SDK_PREVIEW_SELECTION_REQUIRED` | 核对清单编码和版本，确保选择唯一的已声明可视化。 |
| `SDK_INVALID_JSON`、`INPUT_JSON_INVALID` | 修正 UTF-8 JSON；CLI 的解析诊断可包含行号和列号。原始输入不是执行结果信封。 |
| `SDK_OUTPUT_EXISTS` | 选择新目录或新 ZIP，不覆盖原输出或已分发版本。 |
| `EXTENSION_VIEW_INVALID`、`EXTENSION_VIEW_PROTOCOL` | 按类型声明修正返回结构和协议版本；页面只呈现宿主定义的安全诊断。 |
| `EXTENSION_VIEW_LIMIT`、`EXTENSION_VIEW_TIMEOUT` | 减少数据、图元或计算量后显式重渲染；超限不静默截断，超时不是算法验收失败报告。 |

## 版本、环境与分发

工具版本 `0.2.0` 与运行 SDK `0.1.0` 是不同版本；本次工具更新不改变 manifest schema `2.0`、执行和视图协议 `1.0`、CPU 运行档 `python-cpu-v1` 或批准镜像。扩展自己的精确版本也独立于工具版本。现有资源输入和环境审批边界见[扩展生命周期与 Python SDK 首段](./extension-lifecycle-sdk.md)；开发工具不新增 GPU、任意依赖安装或新的运行档。

开发包包括可安装 Python 源码、前端类型、编译预览及资源索引、样例、第三方许可和 `kit.json`。`kit.json` 记录工具／协议／运行档版本、后端与前端源提交、dirty 状态及文件 SHA-256；它是来源核对记录，不代表平台审批或独立安全认证。

### 维护者导出开发包

此步骤面向持有前后端源码仓库、已有前端构建依赖及 Python SDK 依赖的维护者，不是普通作者的前置条件。用实际检出的路径替换以下示例路径；先在前端根目录执行：

```console
npm.cmd run build:sdk-preview
```

随后在 Neo 根目录执行，明确指定前端源码与新的输出位置：

```console
python scripts/build_extension_sdk_kit.py --frontend-root E:/Project/frontend --output E:/Project/sdk-output/smart-water-sdk-kit-0.2.0.zip
```

脚本生成 scale-tools、timeseries-tools 和 scene-tools 样例包，默认使用前端 `dist/extension-sdk-preview/browser`，核对构建来源与当前前端提交、版本和 dirty 状态。默认要求两个仓库工作区干净，以其 HEAD 记录来源；提交或修改后应重建预览。缺少资源、许可、来源不匹配或输出已存在会失败。只有明确进行开发试用时才加 `--allow-dirty`，该包按未提交开发状态记录，不能据此称为干净发布包。此命令仅导出 ZIP，不上传 PyPI／npm、不发布站点或部署平台；导出包本地验证不等于公开发行或平台部署。

## 限制与验证范围

- 文件／编辑器入口限制为 UTF-8 JS 最大 512 KiB、原始 JSON 最大 8 MiB。解释器另执行 UTF-16 字符串长度预算：序列化输入最大 `8×1024×1024` code units，输出最大 `2×1024×1024` code units；不能把它们当作 UTF-8 字节限制。状态、视图块、表格、图表、网络和画布还有独立预算，详见[生命周期指南的受限可视化说明](./extension-lifecycle-sdk.md#前端受限可视化-sdk)。
- 扩展 ZIP 最大 20 MiB、解压后最大 50 MiB、最多 256 项、每项最大 5 MiB。预览资源不是上传扩展的一部分，不应混入作者 ZIP。
- 预览只检验浏览器脚本执行和展示；不会读取二进制制品字节、准备容器、运行 Python、验证跨包授权或批准依赖。QuickJS/WASM 及宿主限制是防护措施，不是独立安全审计或普遍隔离保证。
- 本批完成了独立包作者流程、QuickJS 浏览器视图/四档宽度、临时合成账号下的后端预检界面，以及经授权临时环境中的六类批准镜像容器检查。预检界面检查未执行正式上传/安装；容器检查未覆盖完整平台任务生命周期。没有生产部署或生产任务/数据库变更；本批仍未提交、推送或部署。

## 平台发布路径与下一步

完成本地检查和自己的可信运行／渲染调试后，保存源码和精确版本，再将扩展 ZIP 提交到平台扩展中心。上传解析、环境准备、平台 smoke、安装、个人启用和公开审核沿用[生命周期指南](./extension-lifecycle-sdk.md#平台包身份可见性与生命周期)，以平台任务终态判断结果。本地输出 `12` 或成功渲染不替代任何平台阶段。

发布前分别确认包结构、精确类型引用、批准运行档、实际容器执行和需要覆盖的场景；升级使用新版本，不覆盖已发布包。GPU、可选依赖运行档、更多扩展界面能力及未覆盖的安全／业务验收需要独立工作，不从本地预览结果推断完成。

## 实现依据

- Neo：`sdk/python/README.md`、`pyproject.toml`、`src/smart_water_extensions/{cli,authoring,workspace,templates,dependency_lock,lock_command,local_tests,container_tests,preview,presentation}.py`、`scripts/build_extension_sdk_kit.py`、`app/infrastructure/extensions/preflight.py`、`app/interfaces/http/extensions.py`、相关 SDK 与预检测试。
- 前端：扩展导入预检组件与 `src/sdk-preview/{preview-bridge.ts,sdk-preview.page.ts,sdk-preview.page.html}`。
