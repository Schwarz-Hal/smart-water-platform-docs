---
id: acceptance.resource-lifecycle
title: 回收站、注销和自动清理验收
document_type: acceptance
document_version: 1.0.0
status: published
locale: zh-CN
audience: [project_stakeholder, admin]
related_modules: [M01, M02, M05, M07]
related_operators: []
related_apis: []
owners: [quality-team]
reviewed_at: 2026-08-21
summary: 验证软删除保护机制、回收站一键恢复与 MinIO 物理底层清理。
---

# 回收站、注销和自动清理验收

---

## 1. 验收测试用例

- [x] **软删除与恢复**：删除数据资产后移入回收站，点击恢复后数据完整重现；
- [x] **物理清理**：在回收站点击彻底删除，确认 MySQL 记录与 MinIO 底层文件均被彻底清除。
