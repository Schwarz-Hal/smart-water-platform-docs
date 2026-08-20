import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import publication from '@site/src/generated/progress.json';

type Evidence = Record<string, 'none' | 'partial' | 'complete'>;
type Module = {id: string; name: string; complexity: number; milestone: string; included: boolean; evidence: Evidence};
const weights: Record<string, number> = {implementation: .35, tests: .2, integration: .15, user_docs: .1, api_docs: .1, deployment: .1};
const points = {none: 0, partial: .5, complete: 1};
const score = (evidence: Evidence) => Object.entries(weights).reduce((total, [key, weight]) => total + (points[evidence[key] ?? 'none'] * weight), 0);
const all = publication.modules as Module[];
const total = publication.total;

export default function ProgressPage(): ReactNode {
  const config = publication.progress;
  if (!config.enabled) return <Layout title="交付进度"><main className="container margin-vert--xl">当前快照未展示阶段进度。</main></Layout>;
  return <Layout title="交付进度" description="基于模块目录和证据状态生成的阶段进度">
    <main className="container margin-vert--xl">
      <p className="margin-bottom--sm">文档快照与统计截止日期以发布页底部的快照信息为准。</p>
      <h1>{config.label}</h1>
      {config.show_total && <section className="card padding--lg margin-bottom--lg"><strong style={{fontSize: '3rem', color: '#087c9e'}}>{(total * 100).toFixed(1)}%</strong><p>按模块复杂度和实现、测试、前后端闭环、文档、部署证据加权计算。</p></section>}
      {config.show_modules && <table><thead><tr><th>模块</th><th>里程碑</th><th>复杂度</th><th>完成度</th></tr></thead><tbody>{all.map((item) => <tr key={item.id}><td>{item.id} · {item.name}</td><td>{item.milestone}</td><td>{item.complexity}</td><td>{(score(item.evidence) * 100).toFixed(0)}%</td></tr>)}</tbody></table>}
    </main>
  </Layout>;
}
