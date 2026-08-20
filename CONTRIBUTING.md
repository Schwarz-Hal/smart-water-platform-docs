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

## 本地检查

- `npm run validate`：元数据、术语和本地链接。
- `npm run progress`：模块完成度计算。
- `npm run build`：Docusaurus 静态站点与 Pagefind 索引。
- `npm run export -- --ref HEAD --formats html`：交付导出预检。

PDF/DOCX 的完整导出使用 CI 容器完成，不要求本机安装 TeX。
