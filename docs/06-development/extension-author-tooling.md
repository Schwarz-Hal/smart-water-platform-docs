---
id: development.extension-author-tooling
title: 扩展作者工具与独立开发包
document_type: development
document_version: 0.1.1
status: draft
locale: zh-CN
audience: [developer]
related_modules: [M02, M03, M04, M05]
related_operators: []
related_apis: []
owners: [backend-team, frontend-team]
reviewed_at: 2026-09-30
summary: 说明独立开发包的安装、脚手架、可信本地运行、真实受限渲染预览、静态打包及平台发布边界。
---

# 扩展作者工具与独立开发包

## 用途与当前状态

开发包用于在平台源码之外编写和检查扩展：生成可运行样例、诊断包结构、调试自己的可信 Python、预览作者 JavaScript 返回的视图，最后生成扩展 ZIP。它不提供平台账号、上传授权或运行环境审批。

本文描述工具发行 0.1.1，开发包可独立分发和使用；工具未发布到 PyPI 或 npm，也不是公开托管的预览站点。代码合并与服务器部署是不同状态，使用开发包不要求先部署服务器变更；平台执行仍按既有运行 SDK 0.1.0 的运行档和审批规则处理，不据此声称新镜像已部署。本地预览执行作者实际 JavaScript，复用平台的受限 QuickJS 解释器、视图校验和 Angular 显示组件；它不是替代算法的模拟画面，也不执行 Python 或连接平台 API。

## 前置条件与角色

- 扩展作者需要 Python 3.12（`>=3.12,<3.13`）、pip、现代浏览器及已解压的 `smart-water-sdk-kit-0.1.1`。以下作者命令均在解压后的开发包根目录执行，每条命令为单行，可用于 Windows PowerShell。
- `python/` 是可安装的 SDK 源码；直接依赖固定为 `jsonschema==4.26.0`，构建依赖为 `setuptools==84.0.0`。固定 CPU 运行档的完整依赖清单在 `python/runtime-requirements.txt`，不能将 SDK 的直接依赖视为完整运行环境。未附带依赖 wheel，安装可能需要联网或使用自行准备的可信依赖缓存，不能称为完全离线安装。
- `frontend/index.d.ts` 提供编辑器类型提示；`preview/` 提供编译好的真实渲染器与资源索引。作者使用开发包不需要完整前后端源码或 Node.js。
- 公开分享的示例、截图及诊断不得暴露凭据或敏感数据，应使用合成或已获准公开的数据。本地工具可读取作者显式选择且有权使用的数据，不新增禁止使用真实数据的规则。仅对自己掌握并信任的 Python 源码使用 `run-local`；未知上传代码不能为检查而导入或运行。

## 最短作者流程

### 1. 安装、生成与检查

如需让本地依赖与目标固定 CPU 运行档一致，先在专用 Python 3.12 环境安装完整固定清单，再安装 SDK：

```console
python -m pip install -r ./python/runtime-requirements.txt
```

以下安装命令不会单独固定全部传递依赖；安装成功也不替代平台运行档审批。

```console
python -m pip install ./python
swext --version
swext init ./my-extension --namespace my-water --name scale-tools
swext check ./my-extension
```

工具版本应为 `0.1.1`。`init` 不覆盖已有目录；它生成 `extension.json`、`python/main.py`、`web/number.js`、`fixtures/preview.json`、`local-request.json` 和本地操作说明。样例算子 `scale@1.0.0` 将输入 `3` 乘以参数 `factor=4`；声明的 `number-view@1.0.0` 显示数值结果。

`check DIR` 检查与打包一致的文件、路径、大小、声明和入口存在性；单独检查 `extension.json` 只能校验清单，不能确认声明的文件存在。`check`、`pack` 和 `preview` 都不会导入或执行扩展 Python。静态检查通过不表示平台已上传、注册、安装或批准执行。

### 2. 显式运行自己的可信 Python

```console
swext run-local --trust-local-code --package ./my-extension --request ./my-extension/local-request.json --output ./local-output
```

预期 `local-output/result.json` 中 `outputs.result.payload` 为 `12`，并保留精确类型引用。该命令直接在本机 Python 中运行源码，不是沙箱或隔离测试；本机依赖可用也不代表平台运行档允许该依赖。不要将它用于未知上传包，平台缺少 Docker 或批准环境时也不得回退到此命令。

### 3. 启动真实渲染预览

```console
swext preview --package ./my-extension --visualizer number-view --input ./my-extension/fixtures/preview.json --assets ./preview
```

`--visualizer` 只能选择清单中已声明的可视化编码；候选不唯一时必须明确选择，仍有版本歧义则拒绝。输入文件是原始 JSON，样例文件内容为数值 `12`，直接成为 `render` 的 `input`。预览不会自动拆开 `result.json`；调试运行结果时应另存所需 `payload`，不能把完整执行结果信封当成原始数值输入。

打开命令打印的本机回环 URL，保留首次打开所需的会话 fragment。默认 `--port 0` 选择空闲端口。页面从 fragment 取出会话令牌并清除地址栏中的该 fragment，以 `X-Swext-Session` 请求同源会话；令牌不传给 renderer，也不进入查询参数或存储。服务仅提供已索引的固定预览资源及冻结的会话，不开放目录浏览、任意文件读取、写入、跨域访问或平台登录。不要把本机会话链接当作公开预览地址分发。

CLI 启动时冻结源码与输入；修改磁盘文件后，按 Ctrl+C 停止并重新启动以读取新快照。页面编辑器内的修改只用于当前浏览器预览，不写回磁盘。也可以在页面的本地文件模式选择或粘贴 JS 和 JSON；这不需要平台 API、配置或凭据。

### 4. 静态打包与复查

```console
swext pack ./my-extension ./scale-tools-1.0.0.zip
swext check ./scale-tools-1.0.0.zip
```

打包收集清单及 `python/`、`web/`、`docs/`、`fixtures/` 的约定文件；根目录本地请求、操作说明及上述独立输出目录不进入扩展 ZIP。已有 ZIP 不会被覆盖。生成的 ZIP 是上传候选，不是已经发布的扩展版本。

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

工具发行 `0.1.1` 与运行 SDK `0.1.0` 是不同版本；本次工具更新不改变 manifest schema `2.0`、执行和视图协议 `1.0`、CPU 运行档 `python-cpu-v1` 或批准镜像。扩展自己的精确版本也独立于工具版本。现有资源输入和环境审批边界见[扩展生命周期与 Python SDK 首段](./extension-lifecycle-sdk.md)；开发工具不新增 GPU、任意依赖安装或新的运行档。

开发包包括可安装 Python 源码、前端类型、编译预览及资源索引、样例、第三方许可和 `kit.json`。`kit.json` 记录工具／协议／运行档版本、后端与前端源提交、dirty 状态及文件 SHA-256；它是来源核对记录，不代表平台审批或独立安全认证。

### 维护者导出开发包

此步骤面向持有两个源码仓库、已有前端构建依赖及 Python SDK 依赖的维护者，不是普通作者的前置条件。用实际检出的路径替换以下示例路径；先在前端根目录执行：

```console
npm.cmd run build:sdk-preview
```

随后在 Neo 根目录执行，明确指定前端源码与新的输出位置：

```console
python scripts/build_extension_sdk_kit.py --frontend-root E:/Project/frontend --output E:/Project/sdk-output/smart-water-sdk-kit-0.1.1.zip
```

脚本默认使用前端 `dist/extension-sdk-preview/browser`，核对构建来源与当前前端提交、版本和 dirty 状态。默认要求两个仓库工作区干净，以其 HEAD 记录来源；提交或修改后应重建预览。缺少资源、许可、来源不匹配或输出已存在会失败。只有明确进行开发试用时才加 `--allow-dirty`，该包按未提交开发状态记录，不能据此称为干净发布包。此命令仅导出 ZIP，不上传 PyPI／npm、不发布站点或部署平台。

## 限制与验证范围

- 文件／编辑器入口限制为 UTF-8 JS 最大 512 KiB、原始 JSON 最大 8 MiB。解释器另执行 UTF-16 字符串长度预算：序列化输入最大 `8×1024×1024` code units，输出最大 `2×1024×1024` code units；不能把它们当作 UTF-8 字节限制。状态、视图块、表格、图表、网络和画布还有独立预算，详见[生命周期指南的受限可视化说明](./extension-lifecycle-sdk.md#前端受限可视化-sdk)。
- 扩展 ZIP 最大 20 MiB、解压后最大 50 MiB、最多 256 项、每项最大 5 MiB。预览资源不是上传扩展的一部分，不应混入作者 ZIP。
- 预览只检验浏览器脚本执行和展示；不会读取二进制制品字节、准备容器、运行 Python、验证跨包授权或批准依赖。QuickJS/WASM 及宿主限制是防护措施，不是独立安全审计或普遍隔离保证。
- 本文不宣称本轮仓库外安装、浏览器操作、CI、服务器端到端验收或性能已经通过；验证结论须另按精确提交和实际记录陈述。

## 平台发布路径与下一步

完成本地检查和自己的可信运行／渲染调试后，保存源码和精确版本，再将扩展 ZIP 提交到平台扩展中心。上传解析、环境准备、平台 smoke、安装、个人启用和公开审核沿用[生命周期指南](./extension-lifecycle-sdk.md#平台包身份可见性与生命周期)，以平台任务终态判断结果。本地输出 `12` 或成功渲染不替代任何平台阶段。

发布前分别确认包结构、精确类型引用、批准运行档、实际容器执行和需要覆盖的场景；升级使用新版本，不覆盖已发布包。GPU、可选依赖运行档、更多扩展界面能力及未覆盖的安全／业务验收需要独立工作，不从本地预览结果推断完成。

## 实现依据

- Neo：`sdk/python/README.md`、`pyproject.toml`、`src/smart_water_extensions/{cli,package,preview,manifest}.py`、`scripts/build_extension_sdk_kit.py`。
- 前端：`sdk/frontend/{README.md,package.json,index.d.ts}`、`src/sdk-preview/{main.ts,preview-bridge.ts,preview-state.ts,sdk-preview.page.html}`、`scripts/build_extension_sdk_preview.mjs`、`angular.json`。
