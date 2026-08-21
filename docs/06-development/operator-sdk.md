---
id: development.operator-sdk
title: 内置算法接入与 Operator SDK 开发指南
document_type: development
document_version: 1.0.0
status: published
locale: zh-CN
audience: [developer, algorithm_user]
related_modules: [M04]
related_operators: []
related_apis: []
owners: [backend-team]
reviewed_at: 2026-08-21
summary: 详细介绍基于 Python Operator SDK 开发、封装、注册与单测自定义水务算子的完整流程。
---

# 内置算法接入与 Operator SDK 开发指南

---

## 1. 算子类继承与契约定义

```python
from app.operators.contracts import OperatorModel, OperatorSpec, InputBinding, OutputBinding
from app.operators.sdk import adapt_legacy
from pydantic import Field

class MyParams(OperatorModel):
    window_size: int = Field(default=10, gt=0)

class MyCustomOperator(OperatorSpec):
    code = "my_custom_water_op_v1"
    name = "自定义管网流态算子"
    category = "analysis"
    version = "1.0.0"
    inputs = [InputBinding(name="input_ts", kind="timeseries")]
    outputs = [OutputBinding(name="output_ts", kind="timeseries")]
    params_schema = MyParams
```
