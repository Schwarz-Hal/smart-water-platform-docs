import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const routes = [
  ['开始使用', '从数据接入到运行第一个分析流程。', '/docs/quick-start/quickstart.first-quality-workflow'],
  ['按场景查看', '查看 DMA 漏损评估等场景的流程与结果解释。', '/docs/scenarios/scenario.s01-dma-leakage'],
  ['理解算法', '阅读算法原理、输入输出、参数与适用范围。', '/docs/algorithms/algorithm.chronos2.overview'],
];

export default function Home(): ReactNode {
  return (
    <Layout title="文档中心" description="智慧水务算法平台统一文档中心">
      <main className={styles.homepage}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>智慧水务算法平台</p>
          <h1>一套持续演进、可交付的项目文档</h1>
          <p>覆盖平台能力、操作流程、场景方案、算法说明、开发集成、运维与验收。公开内容以人工批准的文档快照为准。</p>
          <div className={styles.actions}>
            <Link className="button button--primary button--lg" to="/docs/quick-start/quickstart.first-quality-workflow">快速开始</Link>
            <Link className="button button--outline button--secondary button--lg" to="/progress">查看阶段进度</Link>
          </div>
        </section>
        <section className={styles.cards}>
          {routes.map(([title, description, to]) => <Link className={styles.card} key={title} to={to}><h2>{title}</h2><p>{description}</p><span>阅读文档 →</span></Link>)}
        </section>
        <section className={styles.notice}>
          <strong>发布原则：</strong>文档仓库 main 用于协作；公开站点、平台同步内容与交付包仅在创建不可变快照后更新。
        </section>
      </main>
    </Layout>
  );
}
