---
id: operations.gpu-runtime
title: GPU Runtime 与 Chronos 模型缓存管理
document_type: operations
document_version: 1.0.0
status: published
locale: zh-CN
audience: [operator, developer]
related_modules: [M04, M07]
related_operators: [chronos2_flow_forecast]
related_apis: []
owners: [operations-team]
reviewed_at: 2026-08-21
summary: GPU 显卡驱动配置、CUDA/PyTorch 运行环境、Chronos-2 权重预热与显存管理规范。
---

# GPU Runtime 与 Chronos 模型缓存管理

---

## 1. 硬件与驱动要求

- **GPU 算力**：推荐 NVIDIA RTX 3090 / 4090 / A10 / V100 及以上（显存 ≥ 16GB）；
- **CUDA 版本**：CUDA 12.1+ 及配套 cuDNN 8.9+；
- **PyTorch 环境**：`torch >= 2.2.0+cu121`，支持 FlashAttention-2 加速。

---

## 2. 模型权重预加载与显存驻留

为消除首请求冷启动延迟，GPU Worker 在启动时通过 `ChronosPipeline` 预热加载模型权重至 GPU 显存，推理耗时保持在毫秒级（典型 96 步预测 &lt; 150ms）。
