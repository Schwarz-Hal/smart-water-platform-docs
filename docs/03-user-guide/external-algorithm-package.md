---
id: user.external-algorithm-package
title: 外部算法包接入与环境制备
document_type: user_guide
document_version: 1.0.0
status: published
locale: zh-CN
audience: [developer, admin]
related_modules: [M04]
related_operators: []
related_apis: ["/api/v1/operators/packages"]
owners: [algorithm-team]
reviewed_at: 2026-08-21
summary: 说明第三方 Python 算法代码包打包规范、requirements 依赖声明、环境容器化制备与调试方法。
---

# 外部算法包接入与环境制备

平台支持将高校科研团队或第三方厂商开发的专有 Python 算法无缝接入为平台标准算子。

---

## 1. 外部算法包目录结构规范

外部算法包必须打包为标准 `.zip` 或 `.tar.gz` 压缩文件，包含以下核心文件：

```text
my_water_algorithm/
├── operator.py          # 算子入口函数实现 (继承 OperatorSDK)
├── manifest.json        # 算子元数据与 JSON Schema 参数契约
├── requirements.txt     # Python 第三方依赖库列表
└── test_sample.py       # 自动化冒烟测试脚本
```

---

## 2. 环境制备与沙箱隔离

1. **上传算法包**：在【算子中心】点击【接入外部算法包】，上传打包文件；
2. **后台环境制备**：制备 Worker 自动为该算法创建隔离的 Conda 虚拟环境或轻量 Docker 容器，并自动执行 `pip install -r requirements.txt`；
3. **冒烟测试与挂载**：制备完成后自动运行 `test_sample.py`，测试通过后即可在工作流画布中像内置算子一样拖拽使用。
