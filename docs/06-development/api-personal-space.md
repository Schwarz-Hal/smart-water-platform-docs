---
id: api.personal-space
title: 个人文件夹与资源位置 API
document_type: api
document_version: 0.1.0
status: draft
locale: zh-CN
audience: [developer]
related_modules: [M02, M05]
related_operators: []
related_apis: ["/api/v1/personal-space", "/api/v1/personal-space/folders", "/api/v1/personal-space/folders/{folder_id}", "/api/v1/personal-space/move"]
owners: [backend-team]
reviewed_at: 2026-10-15
summary: 个人逻辑目录的浏览、文件夹管理、资源位置移动及并发冲突处理。
---

# 个人文件夹与资源位置 API

## 用途与权限

个人空间只记录资源的组织位置，不代表服务器磁盘路径。每个登录账户拥有自己的虚拟根目录，根目录在 JSON 中用 `null` 表示。目录移动不修改文件内容、资源编号、版本、工作流图或数据集成员关系。

文件夹操作以当前登录账户为所有者。资源查询与移动均要求资源归属于当前账户；管理员没有跨所有者例外。资料权限如下：

| kind | 现有资源 | 读取权限 | 移动时额外需要 |
| --- | --- | --- | --- |
| `file` | 当前账户创建、状态为 active 的非 demo 文件 | `data_file:read` | `data_file:write` |
| `dataset` | 当前账户创建、状态为 active 的数据集合，排除内置示例集合 | `data_collection:read` | `data_collection:write` |
| `project` | 当前账户创建、未删除且 purpose 为 scene 的工作流 | `workflow:read` | `workflow:edit` |

缺少某类读取权限时，浏览响应不返回该类资料。文件夹本身仍属于当前账户，不从资源的可读数量推断其所有者。旧资源没有位置记录时自动出现在根目录，无需复制、重建或改写原记录。

本接口为本地候选。启用前需按契约仓库的正式迁移链升级至 `0029_personal_resource_space`，其脚本为 `migrations/versions/0029_personal_resource_space.py`，前置版本为 `0028_workflow_purpose`。迁移新增 `sw_personal_folder` 和 `sw_resource_location`；API 启动不会自动建表。当前未完成真实 MySQL 迁移和联机并发验收，不将本地或离线检查等同于部署完成。

迁移仅在两张新表都为空时允许降级。已有任何文件夹或位置记录时，降级报错 `PERSONAL_SPACE_DOWNGRADE_REQUIRES_VERIFIED_RESTORE`，避免静默丢弃用户整理结果；需要回退时先准备并核验备份恢复方案，不通过删表或清空记录绕过保护。

## 请求

所有路径均以 `/api/v1/personal-space` 为前缀。写入请求拒绝未声明字段。

| 方法与路径 | 参数或请求体 | 行为 |
| --- | --- | --- |
| `GET /api/v1/personal-space` | 可选 `folder_id`、`query`、`kind`、`page`、`page_size` | 浏览指定目录内资料；省略 folder_id 浏览根目录 |
| `POST /folders` | `name`，可选 `parent_id` | 新建文件夹，初始 revision 为 1 |
| `PATCH /folders/{folder_id}` | 必填 `revision`；可选 `name`、`parent_id`、`action` | 更新、回收或恢复文件夹 |
| `POST /move` | `items`、可选 `target_folder_id` | 一次移动 1–100 项资料到目标目录 |

浏览参数：`query` 最长 160 字符，只搜索当前文件夹内的资源名称，不递归搜索子目录；`kind` 为 `file`、`dataset` 或 `project`。分页默认第 1 页、每页 50 项；`page_size` 范围 1–100。文件夹列表单独返回，不参与资料分页。

文件夹名称先进行 Unicode NFC 规范化并去除首尾空白，长度为 1–160 字符，禁止 `.`、`..`、路径分隔符和控制字符。同级活动文件夹名称按大小写折叠检查重名。每账户最多保留 1000 个文件夹，包含已回收项。

更新文件夹时，`action` 可为 `update`（默认）、`trash`、`restore`。省略 `name` 或 `parent_id` 表示保留原值；显式传 `parent_id: null` 表示移至根目录。`revision` 必须使用最近一次读取的版本，每次成功更新后加 1。

回收仅允许没有活动子文件夹、没有活动资料的文件夹，不级联删除资料，也没有永久删除接口。确认目录为空后，会释放已回收或已永久删除资料留下的位置记录，不修改资料本身；已回收资料此后通过原机制恢复时出现在根目录。恢复文件夹时，如果原上级目录已回收，文件夹恢复到根目录；目标位置重名则拒绝恢复。

资源移动示例（编号仅为示意，调用时必须使用当前账户真实资源和目录）：

```json
{
  "items": [
    {"kind": "file", "id": 21, "source_folder_id": null},
    {"kind": "project", "id": 32, "source_folder_id": null}
  ],
  "target_folder_id": "00000000-0000-4000-8000-000000000001"
}
```

`items` 中每项的 `id` 为正整数，`source_folder_id` 为客户端最后读取的位置，根目录用 `null`。不得重复提交同一 kind/id。目标目录必须属于当前账户且未回收。服务端先检查全部项目的权限、归属和原位置，再一起写入；任何一项失败，整批移动回滚。

普通文件上传不属于此接口。客户端若要上传到子文件夹，应先调用已有上传接口，再调用 `/move`；这两个请求不是一个事务。上传成功而移动失败时文件仍在根目录，应重新查询并移动，不重复上传文件。

## 响应

成功使用现有 JSON 信封，包含 `code: 0`、`message: "success"`、`data`、`trace_id`。以下为 `data` 中的字段：

| 操作 | 字段 |
| --- | --- |
| 浏览 | `folder_id`、`folders`、`items`、`total`、`page`、`page_size` |
| 新建／修改文件夹 | `id`、`parent_id`、`name`、`deleted`、`revision` |
| 移动资料 | `moved`、`target_folder_id` |

`folders` 返回当前账户的文件夹列表，包含 `deleted: true` 的回收项，用于目录树及文件夹回收区。每项字段与文件夹修改响应相同。

`items` 返回当前目录、搜索与类型条件下的资料页。每项包含 `id`、`kind`、`name`、`updated_at`、`folder_id`、`can_move`；`total` 为满足条件的资料总数。资源按名称、类型和编号稳定排序。`can_move` 用于界面提示，不替代服务端再次检查。

持久化适配器以当前用户行锁串行处理该用户的目录和位置变更。文件夹 revision 防止过时更新；移动请求中的原位置防止其他窗口移动后再次覆盖。资源迁回根目录时移除其位置记录，原资源不受影响。

## 错误与重试

| HTTP 状态 | 业务错误码 | 处理方式 |
| --- | --- | --- |
| 403 | `PERMISSION_DENIED` | 检查登录状态、账户可用性及该类资源读写权限 |
| 404 | `FOLDER_NOT_FOUND` | 目录不存在、已回收或不属于当前账户；返回根目录刷新 |
| 404 | `RESOURCE_NOT_FOUND` | 资源不存在、已删除、不属于当前账户或不在支持范围；刷新资料列表 |
| 409 | `FOLDER_CONFLICT` | 文件夹 revision 已变化，重新读取后决定操作 |
| 409 | `RESOURCE_MOVE_CONFLICT` | 资料原位置已变化，刷新并使用新的 source_folder_id |
| 409 | `FOLDER_NAME_CONFLICT` | 同级有同名文件夹，修改名称或更换位置 |
| 409 | `FOLDER_CYCLE` | 不能移入自身或后代目录，重新选择目标 |
| 409 | `FOLDER_NOT_EMPTY` | 先移出活动资料和子文件夹，再回收目录 |
| 409 | `FOLDER_LIMIT` | 已达含回收项在内的 1000 项上限；目前不提供永久删除来释放额度 |
| 422 | `FOLDER_NAME_INVALID` | 修正名称后提交 |
| 422 | `RESOURCE_MOVE_INVALID` | 去掉同一 kind/id 的重复条目 |

字段类型、长度或枚举不合法时另走平台请求校验错误。对 409 不应自动携带旧 revision 或原位置无限重试；请求结果不确定时先读取目录，核对是否已成功。离线入口使用同名请求的会话模拟数据，不提供后端持久化、真实权限或事务并发保证。
