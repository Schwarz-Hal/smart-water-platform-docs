---
id: user.recycle-bin
title: 管理员回收站、数据恢复与物理清理
document_type: user_guide
document_version: 1.0.0
status: published
locale: zh-CN
audience: [admin, operator]
related_modules: [M01, M02, M05, M07]
related_operators: []
related_apis: ["/api/v1/admin/recycle-bin"]
owners: [admin-team]
reviewed_at: 2026-08-21
summary: 说明平台软删除资源保护机制、回收站查阅、误删一键恢复及存储物理彻底清除。
---

# 管理员回收站、数据恢复与物理清理

为防止生产时序数据资产或重要工作流被误删，平台对所有删除操作实施**软删除（Soft-Delete）机制**。

---

## 1. 软删除工作机制

当用户在界面点击删除数据资产、工作流草稿或模型时：
- 数据库中记录仅标记 `is_deleted = True` 与 `deleted_at` 时间戳；
- 物理文件仍安全保留在 MinIO 对象存储中；
- 资源立即从用户主视图中隐藏并移入【系统回收站】。

---

## 2. 回收站操作

- **一键恢复 (Restore)**：若发生误删，管理员在回收站列表中定位目标资源，点击【恢复】，资源及其所有依赖关系将完好无损地回到原工作空间；
- **永久彻底清理 (Purge)**：在确认不再需要后，管理员点击【彻底删除】，系统将同步清理 MySQL 数据库记录并物理删除 MinIO 中的底层时序文件，释放存储空间。
