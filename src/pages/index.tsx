import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './index.module.css';

interface ModuleCard {
  tag: string;
  title: string;
  description: string;
  to: string;
  icon: string;
}

const moduleCards: ModuleCard[] = [
  {
    tag: 'M01 · ARCHITECTURE',
    title: '平台总体架构',
    description: '深入了解时序数据治理、微服务拓扑、异步任务编排与全链路结果追溯体系。',
    to: '/docs/platform/platform.overview',
    icon: '🏛️',
  },
  {
    tag: 'M02 · QUICK START',
    title: '快速上手指南',
    description: '从选择业务和准备数据开始，完成流程编排、运行与结果查看。',
    to: '/docs/user-guide/user.task-workdesk',
    icon: '⚡',
  },
  {
    tag: 'M03 · USER GUIDE',
    title: '工作流与操作手册',
    description: '了解项目工作台、个人资料、流程调整和分析结果的日常操作。',
    to: '/docs/user-guide/user.task-workdesk',
    icon: '🛠️',
  },
  {
    tag: 'M04 · SCENARIOS',
    title: '多源协同漏损检测',
    description: '载入整组资料，浏览管网与观测曲线，编排分析并回放检测结果。',
    to: '/docs/user-guide/user.task-workdesk',
    icon: '💧',
  },
  {
    tag: 'M05 · ALGORITHMS',
    title: '时序算法模型库',
    description: '探索 Chronos-2 零样本时序预测、Hampel 异常检测与季节基线算法原理。',
    to: '/docs/algorithms/algorithm.chronos2.overview',
    icon: '🧠',
  },
  {
    tag: 'M06 · DEVELOPMENT',
    title: '扩展 SDK 与二次开发',
    description: '了解扩展资源、SDK 工程与打包方式，以及运行环境和权限边界。',
    to: '/docs/development/development.extension-developer-introduction',
    icon: '💻',
  },
  {
    tag: 'M07 · OPERATIONS',
    title: '服务运维与部署',
    description: '基于 Docker Compose 与 Systemd 生产部署指南、环境依赖、健康检查与安全排障。',
    to: '/docs/operations/operations.health-topology',
    icon: '🛡️',
  },
  {
    tag: 'M08 · ACCEPTANCE',
    title: '业务验证与验收',
    description: '涵盖平台核心功能的端到端闭环验证流程、预期结果核对与指标留存规范。',
    to: '/docs/acceptance/acceptance.workflow-closure',
    icon: '✅',
  },
];

const highlights = [
  { value: '8 大核心体系', label: '全链路闭环覆盖' },
  { value: '零样本预测', label: '内置 Chronos-2 大模型' },
  { value: '微服务架构', label: 'FastAPI + Celery + Redis' },
  { value: '不可变溯源', label: '数据与算法版本双向锁定' },
];

export default function Home(): ReactNode {
  return (
    <Layout title="智慧水务算法平台官方文档" description="面向水务时序治理、算法算子编排与管网漏损评估的统一技术文档">
      <main className={styles.homepage}>
        <section className={styles.hero}>
          <div className={styles.heroTag}>
            <span className={styles.heroDot}></span>
            <span>SYSTEM // WATER ALGORITHM PLATFORM DOCS</span>
          </div>
          <h1 className={styles.heroTitle}>智慧水务时序分析与算法编排平台</h1>
          <p className={styles.heroSubtitle}>
            查阅数据准备、流程编排、分析结果、算法应用与扩展开发说明，以及平台接口和运维指南。
          </p>
          <div className={styles.actions}>
            <Link className={styles.primaryButton} to="/docs/user-guide/user.task-workdesk">
              <span>🚀 快速上手</span>
            </Link>
            <Link className={styles.secondaryButton} to="/docs/algorithms/algorithm.chronos2.overview">
              <span>🧩 探索算法库</span>
            </Link>
            <Link className={styles.secondaryButton} to="/docs/development/development.first-api-call">
              <span>📡 查看 API 契约</span>
            </Link>
          </div>
        </section>

        <section className={styles.metricsBar}>
          {highlights.map((h, i) => (
            <div key={i} className={styles.metricItem}>
              <div className={styles.metricValue}>{h.value}</div>
              <div className={styles.metricLabel}>{h.label}</div>
            </div>
          ))}
        </section>

        <section className={styles.sectionHeader}>
          <h2>文档体系导航</h2>
          <p>按功能领域快速查阅平台能力、操作规范与开发指南</p>
        </section>

        <section className={styles.cardsGrid}>
          {moduleCards.map((card) => (
            <Link className={styles.moduleCard} key={card.tag} to={card.to}>
              <div className={styles.cardHeader}>
                <span className={styles.cardIcon}>{card.icon}</span>
                <span className={styles.cardTag}>{card.tag}</span>
              </div>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardDesc}>{card.description}</p>
              <div className={styles.cardFooter}>
                <span>查阅文档</span>
                <span className={styles.cardArrow}>→</span>
              </div>
            </Link>
          ))}
        </section>

        <section className={styles.guideBanner}>
          <div className={styles.bannerContent}>
            <span className={styles.bannerIcon}>💡</span>
            <div>
              <strong>需要本地部署或定制二次开发？</strong>
              <p>平台支持容器化快速编排与全套 OpenAPI 契约接口，详情请参阅【运维与部署指南】与【开发集成文档】。</p>
            </div>
          </div>
          <Link className={styles.bannerButton} to="/docs/operations/operations.health-topology">
            部署指引 →
          </Link>
        </section>
      </main>
    </Layout>
  );
}
