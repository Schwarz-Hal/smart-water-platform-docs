---
id: user.mysql-source
title: 接入和导入只读 MySQL 数据源
document_type: user_guide
document_version: 1.3.0
status: published
locale: zh-CN
audience: [platform_user, operator, developer]
related_modules: [M02]
related_operators: []
related_apis: ["/api/v1/data-sources", "/api/v1/data-sources/{source_id}/test", "/api/v1/ingestions"]
owners: [product-team]
reviewed_at: 2026-08-21
summary: 通过数据源页面连接只读 MySQL 并启动导入。
---

# 接入和导入只读 MySQL 数据源

## 用途

从已有水务 MySQL 读取监测数据，形成平台数据资产。平台只读取外部源库，不回写、修改或删除源数据。

## 前置条件与角色

需要数据源和导入权限，并向源库管理员取得只读账号、连接信息和字段说明。不要在页面备注、截图或工单中复制密码。

## 操作步骤

1. 打开【数据源与导入】，点击【接入只读 MySQL】。
2. 在表单填写【数据源编码】、【数据源名称】、【只读 MySQL URI】、【表名】、【主键/水位字段】、【点位字段】、【时间字段】和【流量字段】，点击【保存只读数据源】。
3. 保存后，在同页【数据接入记录】找到该数据源，先点击【测试连接】；连接成功后点击【开始增量导入】。
4. 等待接入记录显示完成，再到【可用数据资产】打开生成的资产，选择需要的版本、点位和指标。

## 结果与失败处理

连接测试失败时，检查只读账号、URI、网络策略、表名和字段填写；不要改用写账号绕过限制。增量导入失败时打开接入记录或任务详情查看原因，修正源数据或表单后重新执行导入。资产未完成前不要把处理中状态当成可运行数据。

## 开发联调

页面与后端请求的字段约束见开发文档中的数据资产 API；用户操作不需要手写查询语句或接口请求。
