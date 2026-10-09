---
id: operations.frontend-release
title: 前端与文档独立发布及指针回退
document_type: operations
document_version: 0.1.0
status: draft
locale: zh-CN
audience: [operator, developer]
related_modules: []
related_operators: []
related_apis: ["/health/live", "/health/ready"]
owners: [operations-team]
reviewed_at: 2026-10-09
summary: 使用前端发布包、摘要校验和互斥锁切换前端与文档，保留当前后端运行环境并限定回退边界。
---

# 前端与文档独立发布及指针回退

## 前置条件

本流程面向维护者，只发布前端制品与配套文档。实现位于前端仓库 `scripts/frontend-release.py`，不执行服务重启、数据库迁移、依赖安装、环境文件修改或自启变更。需要这些操作时使用[统一部署流程](./deployment.md)，数据恢复另见[备份与恢复](./backup-and-recovery.md)。本文是新工具的操作说明，不是已在服务器发布或完成生产验收的记录。

发布前取得明确的目标环境与切换授权。Linux 发布端需支持 flock、符号链接与同文件系统原子替换；发布根目录已有 `releases/`、`shared/` 和指向有效版本的 `current`。当前版本必须具备 `release.json`、`frontend-dist/`、`backend`、`contract`、`nginx`、`runtime.env`。不要把维护者个人目录、密钥或环境文件放进制品、日志或文档。

前端和文档必须是已经提交、工作树干净的精确版本，并包含当前已部署前端／文档 commit 的祖先。当前整合保留已部署 SDK 作者与区域交互前置，而不是仅基于 main 覆盖这些能力；整合功能分支不等于合并主线。实际主线、工作分支、部署版本以共享板和目标端记录分别核对。

## 检查

1. 从实际 `current/release.json` 取得本次基线的原始文件副本，核对 release_id、frontend_commit、docs_commit、backend_commit、contract_commit、migration。脚本按基线文件字节摘要比较，不要重新格式化 JSON 后当作同一份基线。
2. 检查前端、文档工作树干净和部署祖先关系；准备目标源代码对应的生产构建目录，不能用 Playground／离线制品或未知旧 dist。pack 校验文件完整性，但不能单凭哈希证明 dist 确实由指定源码构建，构建来源仍需维护者核对。
3. 对实际改动运行有范围的既有检查。此工具不会自动运行测试或前端构建；不要为发布重复执行无变化的全量业务测试。确认所需生产构建和文档验证证据，再封包一次。
4. 确认后端和静态站点可从发布端进行健康检查，原后端／契约／Nginx／运行环境无需改变，磁盘足够容纳新制品与保留资源。不符合条件时停止，不改成强制覆盖。

以下命令中的大写占位符需替换为已核定的本机路径、发布根目录、摘要或 release ID，不是可直接执行的真实配置。

## 操作步骤

### 镜像算法文档并封包

在可信前端仓库中，将已提交文档镜像到已构建的生产目录：

```text
node scripts/mirror-operator-docs.mjs DOCS_REPO FRONTEND_DIST
python scripts/frontend-release.py pack --repo FRONTEND_REPO --docs DOCS_REPO --dist FRONTEND_DIST --baseline BASELINE_JSON --output BUNDLE_TAR_GZ
```

镜像脚本要求文档工作树干净；读取 `docs/05-algorithms` 的 Markdown 元数据，复制相应文件及 `static/`，在 `operator-docs/index.json` 记录 source_commit、document_version、路径和每篇 SHA256。它不是全文档站点构建，也不发布快照标签。应从本次干净构建产物开始镜像，避免旧 operator-docs 文件残留；脚本不承担清理任意历史产物目录的职责。

pack 重新要求两工作树干净并用 Git 祖先检查防止遗漏部署前置；将前端源码和完整文档源码以 git archive 收入包中。bundle.json 包含精确提交、基线清单 SHA256、前端逐文件 SHA256、两份源码归档 SHA256和继承的后端／契约／迁移信息。命令输出整个压缩包 SHA256，需随可信交接记录保存；哈希用于完整性比对，不是制品签名。传输后使用该摘要，不能在接收端把未知包重新算出的值当成可信来源证明。

### 先计划，后显式切换

在 Linux 发布端使用同版脚本，先执行默认计划模式：

```text
python FRONTEND_RELEASE_SCRIPT deploy --base RELEASE_BASE --bundle BUNDLE_TAR_GZ --sha256 TRUSTED_BUNDLE_SHA256
```

默认不切换 current：脚本取得 `shared/frontend-release.lock` 非阻塞排他锁，在 releases 内临时解包并校验，准备复合版本、检查后端 ready，输出计划后清理临时目录。计划模式仍会读取环境、获取锁、创建临时文件和发健康请求，不是完全无副作用的离线打印。锁冲突应等待当前发布者处理，不能删除锁文件绕过。

通过计划审核后，保持同一包、摘要和基线，显式执行：

```text
python FRONTEND_RELEASE_SCRIPT deploy --base RELEASE_BASE --bundle BUNDLE_TAR_GZ --sha256 TRUSTED_BUNDLE_SHA256 --apply
```

若默认回环探测入口不适用，可通过 `--frontend FRONTEND_SMOKE_URL` 与 `--backend BACKEND_SMOKE_URL` 指定已批准的探测入口；不要在共享记录中写入内部地址或秘密。

每次执行重新校验整个包、前端逐文件集合与内容、源码归档摘要，拒绝穿越路径、链接和重复归档名；并将实际 current 的 release.json 摘要与包内基线比对。基线变化必须重新规划，不能绕过检查。应用前还会复查 current 指针是否仍为准备开始时的版本。

新复合 release 包含本次前端制品、前端源码和文档；backend／contract／nginx／runtime.env 以符号链接指向原版本解析后的目标，不复制运行环境或重启服务。旧前端中符合哈希命名规则的 JS／CSS 文件，如新制品没有同路径文件，会复制保留并登记 retained_assets，帮助已打开页面继续取得旧懒加载块。这不保证所有旧媒体或任意文件永久可用；被链接的旧 release 不能随意删除。

## 验证与回退

### 切换后的检查

apply 将准备目录移入正式 releases，先写 `shared/frontend-release-state.json` 的 switching 状态，再原子替换 current。烟测比较实际提供的 index 与新文件字节，核对 index 中本地 script／link 引用，检查 quick-trial／extensions 返回同一 SPA 入口，并请求后端 live／ready。成功后更新 previous 指针，日志状态变为 healthy。

这是有界的静态资源和健康检查，不包含登录、权限、上传、安装、算法训练、任务终态或全部懒加载资源的浏览器验收。维护者还需确认 release.json、当前指针与原服务边界，按本次变更补充已授权的页面检查。

切换或烟测抛出可捕获异常时，脚本将 current 恢复到旧目标、写 rolled-back 并对旧版本再烟测。旧版本烟测仍失败时需人工处理，不能仅凭 rolled-back 字样认定系统健康。

### 显式前端回退

```text
python FRONTEND_RELEASE_SCRIPT rollback --base RELEASE_BASE --expected-release EXACT_CURRENT_RELEASE_ID
```

注意 rollback 没有计划模式或 `--apply` 门槛，执行即尝试切换，须单独确认授权与当前 release ID。它要求当前版本为 frontend-docs-only，目标在 releases 内，并比较两版 backend_commit、contract_commit、migration、runtime_environment_sha256 一致；不符合时拒绝。符合后回到该清单记录的 previous 并烟测，不重启服务。

这不是完整后端或数据库回滚，也不恢复运行中的业务状态。不要对非前端复合版本使用此命令；回退烟测失败时，保留指针与日志证据并按实际故障处理，不盲目反复切换。

### 中断恢复与记录

SIGKILL、断电等不可捕获中断不会执行异常回退。恢复后先只读核对 current 实际目标、当前／旧版清单和 shared 中的状态日志；switching 只说明切换曾开始，不能证明切换完成或旧版已恢复。确认链接目标、资源摘要和健康后，由维护者决定是否对精确当前 release 使用受保护 rollback；若 current 已改变或状态不明，停止并重新评审，不自动清理目录或强行覆盖。日志是辅助记录，不是自动恢复守护程序。

交接记录包摘要、前端／文档 commit、基线与新 release ID、烟测和人工检查范围、异常／回退结果及未验证项；保持合并与部署状态分离，不记录 runtime.env 内容。`scripts/test_frontend_release.py` 提供归档安全、资源引用解析和故障回退等测试来源，其中 Linux 锁／符号链接场景有平台限制；本说明未执行这些测试、构建或服务器发布，不声明测试文件存在即验收通过。
