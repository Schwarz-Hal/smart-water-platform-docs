---
id: platform.architecture
title: 平台组成、数据流与运行架构
document_type: platform
document_version: 1.0.0
status: published
locale: zh-CN
audience: [developer, operator, project_stakeholder]
related_modules: [M08]
related_operators: []
related_apis: []
owners: [platform-team]
reviewed_at: 2026-08-21
summary: 全面介绍智慧水务算法平台的微服务分层、数据流向、Celery 异步调度与对象存储架构。
---

# 平台组成、数据流与运行架构

智慧水务算法平台基于“前后端分离 + 分布式异步计算集群 + S3 兼容对象存储”的工业级云原生架构构建，保障高并发水务时序数据吞吐与深度学习大模型计算的稳定性。

---

## 1. 总体分层拓扑架构

```mermaid
flowchart TD
    subgraph Client [前端与交互层]
        Web[Angular 17 生产客户端 SPA]
        Mobile[移动巡检与大屏展示 Webhook]
    end

    subgraph Gateway [接入与网关层]
        Nginx[Nginx 反向代理 & 静态托管]
    end

    subgraph Service [平台核心服务层]
        API[FastAPI 异步 Web 服务]
        Scheduler[Celery Beat 定时调度器]
        Auth[JWT 鉴权 & RBAC 权限引擎]
    end

    subgraph Middleware [中间件与状态层]
        MySQL[(MySQL 8.4 最终事实元数据)]
        Redis[(Redis 7.x 缓存 & 实时事件总线)]
        RabbitMQ[RabbitMQ 消息中间件]
    end

    subgraph Workers [分布式算力执行集群]
        CPUWorker[CPU 数据清洗 & 统计 Worker]
        WFWorker[工作流拓扑调度 Worker]
        GPUWorker[GPU Chronos-2 大模型推理 Worker]
        TrainWorker[模型离线长周期训练 Worker]
    end

    subgraph Storage [持久化存储层]
        MinIO[(MinIO S3 对象存储 - CSV & Artifacts)]
    end

    Client --> Nginx
    Nginx --> API
    API --> MySQL
    API --> Redis
    API --> RabbitMQ
    API --> Auth
    Scheduler --> RabbitMQ
    RabbitMQ --> Workers
    Workers --> MinIO
    Workers --> MySQL
    Workers -.->|WebSocket 进度推送| Redis
```

---

## 2. 端到端核心数据流向

1. **时序数据接入流**：
   - 业务人员上传 CSV 或接入只读 MySQL $\rightarrow$ API 暂存文件并进行头部采样 $\rightarrow$ 异步触发数据校验与入库 $\rightarrow$ 原始时序流持久化至 MinIO，元数据写入 MySQL；
2. **工作流编排与运行流**：
   - 用户在画布保存 DAG 并发布版本 $\rightarrow$ 触发运行 $\rightarrow$ API 写入执行实例记录并将任务推入 RabbitMQ `workflow` 队列；
   - 工作流调度器解析节点依赖，按拓扑序将各节点计算任务分派至 `cpu` 或 `gpu_inference` 队列；
3. **计算结果工件与可视化流**：
   - Worker 执行算子计算，将生成的时序预测曲线、漏损候选报告写入 MinIO $\rightarrow$ 更新节点状态至 MySQL $\rightarrow$ 通过 Redis 发布/订阅机制经 WebSocket 毫秒级推送到前端画布。
