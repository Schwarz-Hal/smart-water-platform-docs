---
id: user.extensions
title: 资源广场与扩展管理
document_type: user_guide
document_version: 0.4.0
status: published
locale: zh-CN
audience: [platform_user, admin]
related_modules: [M04, M05]
related_operators: []
related_apis: ["/api/v1/extensions/preflight", "/api/v1/extensions/upload", "/api/v1/extensions/catalog", "/api/v1/extensions/{package_id}", "/api/v1/extensions/{package_id}/prepare", "/api/v1/extensions/{package_id}/smoke", "/api/v1/extensions/{package_id}/install", "/api/v1/extensions/{package_id}/enable", "/api/v1/extensions/{package_id}/relations", "/api/v1/extensions/{package_id}/versions", "/api/v1/extensions/{package_id}/operations"]
owners: [algorithm-team]
reviewed_at: 2026-11-02
summary: 查找扩展、检查内容，并完成安装与个人启用。
---

# 资源广场与扩展管理

## 用途

浏览扩展提供的算法、节点、流程模板和结果视图，按需要安装并为自己的账户启用。

## 前置条件与角色

从左侧【资源广场】进入。导入、安装及版本管理操作按账户权限显示。

## 操作步骤

1. 在【全部扩展】【我的扩展】或【公共扩展】中查找内容，也可按名称搜索。
2. 选中扩展，查看简介、所含内容和使用状态。打开关系信息，了解它依赖的内容以及被其他资源使用的情况。
3. 使用已有扩展时，按页面提示完成环境准备、试运行和安装，再点击【为我启用】。
4. 启用后，可从内容卡片进入算法中心或使用流程模板；也可在项目节点目录中查找新增节点。
5. 导入自有扩展时，点击【导入扩展】并选择扩展包。检查解析结果和依赖提示，确认后继续后续操作。
6. 查看版本或处理记录时，进入相应详情。停用不再需要的扩展前，先检查当前项目是否仍需使用。

## 结果与失败处理

上传后先等待检查完成。缺少依赖、环境准备失败或试运行未通过时，打开处理记录查看原因，修正后再继续。已经安装的扩展还需为当前账户启用，才能在自己的工作中使用。

扩展开发方法参见[扩展开发者入门](../06-development/extension-developer-introduction.md)。
