---
id: operations.monitoring-logs
title: 任务状态、服务日志与常见故障排查
document_type: operations
document_version: 1.0.0
status: published
locale: zh-CN
audience: [operator, developer]
related_modules: [M07]
related_operators: []
related_apis: [/health/ready]
owners: [operations-team]
reviewed_at: 2026-08-21
summary: 全局 trace_id 排障链路、Journald 日志过滤、健康检查探针与常见故障应急预案。
---

# 任务状态、服务日志与常见故障排查

---

## 1. 基于 Trace ID 的全链路排障

当用户界面提示任务异常时，复制详情页中的 `trace_id`（如 `tr_89a0b12`）：

```bash
# 检索 API 与 Worker 聚合日志
journalctl -u "smart-water-*" --since "1 hour ago" | grep "tr_89a0b12"
```

---

## 2. 常见故障自愈与处理方案

| 故障现象 | 根因诊断 | 处置步骤 |
| :--- | :--- | :--- |
| **工作流长期处于 PENDING** | Celery Broker 连通异常或对应 Worker 掉线 | 检查 `systemctl status smart-water-worker@*`，重启离线 Worker |
| **CSV 导入报编码错误** | 文件含有特殊非 UTF-8 字符 | 指导用户另存为 UTF-8 编码或使用前端编码自动检测 |
| **时序预测显存溢出 (OOM)** | 并发批处理序列数过大 | 在算子参数中调小 `batch_size`，或扩充 GPU Worker 实例 |
