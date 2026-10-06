# 贡献文档

本仓库是智慧水务算法平台的唯一文档事实来源。`main` 可持续更新；对外站点、平台同步内容与交付文件仅来自人工批准的快照标签。

## 最短流程

```bash
git switch main
git pull --ff-only
git switch -c docs/your-topic
npm ci
npm run validate
npm run build
git add docs/ catalog/ static/assets/
git diff --cached
git commit -m "docs: describe your topic"
git push -u origin docs/your-topic
```

提交 PR 前，确认每篇正式文档含完整 front matter、术语与链接检查通过，并已在相关产品任务中声明文档影响。不要直接推送 `main`、不要提交密钥、真实数据或未授权图片。

## 扩展文档同步

[扩展开发者入门与能力边界](docs/06-development/extension-developer-introduction.md)是扩展作者的阅读入口，稳定文档 ID 为 `development.extension-developer-introduction`。SDK 命令、扩展种类、运行环境、权限、资源引用或版本规则变化时，在同一产品变更中核对这篇介绍，并同步对应的详细指南。

提交前检查：当前支持与规划能力是否仍然准确；示例能否按说明执行；失败原因和处理方式是否需要调整；是否影响旧包、已发布场景或历史结果。有实际内容变化时递增 `document_version`，同步目录版本，再运行校验并交独立审阅。接口、命令和限制的细节以对应指南为准，介绍页保留阅读入口，不重复维护整套参考手册。无需修改介绍时，在 PR 的文档影响说明中写明原因。

## 本地检查

- `npm run validate`：元数据、术语和本地链接。
- `npm run progress`：模块完成度计算。
- `npm run build`：Docusaurus 静态站点与 Pagefind 索引。
- `npm run export -- --ref HEAD --formats html`：交付导出预检。

PDF/DOCX 的完整导出使用 CI 容器完成，不要求本机安装 TeX。
