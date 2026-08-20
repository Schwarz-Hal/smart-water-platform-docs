# 智慧水务算法平台文档中心

这是平台的唯一文档事实来源。它以 Markdown/MDX 编写，以 Docusaurus 构建站点；只有人工批准的快照标签才更新公开站点、平台同步内容和交付导出包。

## 本地使用

```bash
npm ci
npm run start
```

常用检查：

```bash
npm run validate
npm run progress
npm run build
```

PDF、DOCX 和离线 HTML 的正式交付由 GitHub Actions 中锁定的导出容器生成。请阅读 [贡献指南](CONTRIBUTING.md)、[写作规范](STYLE_GUIDE.md) 与 [协作规则](AGENTS.md)。

## 发布模型

`main` 是协作分支；发布者在指定提交上手工触发快照工作流，生成不可变 Tag、GitHub Pages、发布清单和交付文件。详见站内的“文档发布与快照说明”。
