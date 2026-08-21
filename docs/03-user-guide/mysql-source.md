---
id: user.mysql-source
title: 接入和导入只读 MySQL 数据源
document_type: user_guide
document_version: 1.0.0
status: published
locale: zh-CN
audience: [platform_user, operator, developer]
related_modules: [M02]
related_operators: []
related_apis: ["/api/v1/datasources/mysql"]
owners: [product-team]
reviewed_at: 2026-08-21
summary: 指导用户配置只读 MySQL 外部数据源连接、安全探查数据表、编写取数 SQL 并导入为平台资产。
---

# 接入和导入只读 MySQL 数据源

针对已具备 SCADA、GIS 或营销抄表 MySQL 数据库的水务企业，平台支持通过**只读（Read-Only）连接**直接定时抽取或一次性导入管网时序数据。

---

## 1. 数据源安全原则

- 平台仅要求外部数据库提供 `SELECT` 权限的只读账号；
- 平台后端驱动默认开启 `read_only=True` 事务隔离模式，严禁向源数据库执行任何写入或修改操作。

---

## 2. 配置与导入步骤

1. **新建数据源连接**：
   - 进入【数据管理】→【外部数据源】，点击【新建 MySQL 数据源】；
   - 填写连接名称、主机 IP、端口（默认 3306）、数据库名、只读用户名与密码；
   - 点击【测试连通性】，系统向源库发起轻量心跳探针；
2. **探查与编写抽取 SQL**：
   - 在 SQL 编辑器中输入时序抽取语句（如 `SELECT record_time, flow_rate, pressure FROM dma_sensor_log WHERE record_time >= '2026-08-01'`）；
   - 点击【执行采样预览】，核验前 10 行时序样本；
3. **映射通道并导入**：
   - 指定时间戳列与各指标通道，提交导入任务，生成平台标准数据资产。
