---
id: user.data-collections
title: 数据集与文件管理
document_type: user_guide
document_version: 0.2.0
status: published
locale: zh-CN
audience: [platform_user, operator]
related_modules: [M02, M05]
related_operators: [data_file_input_v1]
related_apis: ["/api/v1/data-collections", "/api/v1/data-files/uploads", "/api/v1/data-file-versions/{version_id}/preview", "/api/v1/data-file-versions/{version_id}/views", "/api/v1/data-views/{view_id}"]
owners: [product-team]
reviewed_at: 2026-11-02
summary: 创建数据集、上传和预览文件，并在分析中选择使用。
---

# 数据集与文件管理

## 用途

数据集用于集中管理一组相关资料。同一数据集可以包含不同格式的文件，便于后续查找和分析使用。

## 前置条件与角色

登录后，从【数据中心】切换到【数据集】。创建、上传和管理操作由当前账户权限决定。

## 操作步骤

1. 点击【新建数据集】，填写名称和说明后创建。名称可说明资料范围或用途，方便后续识别。
2. 打开目标数据集，点击【上传文件】添加资料。等待上传和解析完成，在文件列表中核对名称、格式和状态。
3. 选中文件打开预览，查看列名和样本。若文件仍在解析，待状态更新后再继续。
4. 在分析流程中选择已有数据时，打开对应数据集并选取所需文件；也可从项目右侧资料目录添加到画布。
5. 进入数据准备窗口，选择表格或时序读取方式，核对时间列、数值列等设置，再应用到输入节点。
6. 文件更新后，按本次分析需要选择版本。已完成分析的记录继续保留原来使用的数据。

## 结果与失败处理

上传或解析失败时，核对文件格式与内容，并按页面提示处理。上传结果不确定时，先刷新列表确认文件是否已经保存，避免重复上传。

数据集用于组织资料；将文件用于流程后，仍需确认各输入的用途和列设置。个人文件夹的位置整理参见[我的文件与个人文件夹](data-file-explorer.md)。
