import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: '智慧水务算法平台文档中心',
  tagline: '面向水务时序治理、算法算子编排与管网漏损评估的统一技术文档',
  favicon: 'assets/platform-mark.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://schwarz-hal.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/smart-water-platform-docs/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'Schwarz-Hal',
  projectName: 'smart-water-platform-docs',

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          exclude: ['intro.mdx', 'tutorial-basics/**', 'tutorial-extras/**'],
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themes: ['@docusaurus/theme-mermaid'],
  markdown: {
    mermaid: true,
  },

  themeConfig: {
    // Replace with your project's social card
    image: 'assets/social-card.svg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: '智慧水务算法平台文档中心',
      logo: {
        alt: '智慧水务算法平台',
        src: 'assets/platform-mark.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'productSidebar',
          position: 'left',
          label: '产品指南',
        },
        {
          type: 'docSidebar',
          sidebarId: 'algorithmSidebar',
          position: 'left',
          label: '算法与场景',
        },
        {
          type: 'docSidebar',
          sidebarId: 'devSidebar',
          position: 'left',
          label: '开发者中心',
        },
        {
          type: 'docSidebar',
          sidebarId: 'opsSidebar',
          position: 'left',
          label: '部署与运维',
        },
        {to: '/search', label: '搜索', position: 'left'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '产品与指南',
          items: [
            {
              label: '平台架构概览',
              to: '/docs/platform/platform.overview',
            },
            {
              label: '快速开始',
              to: '/docs/quick-start/quickstart.first-quality-workflow',
            },
            {
              label: '用户手册',
              to: '/docs/user-guide/user.workflow-editor',
            },
            {
              label: '业务场景实践',
              to: '/docs/scenarios/scenario.s01-dma-leakage',
            },
          ],
        },
        {
          title: '核心算法库',
          items: [
            {
              label: 'Chronos-2 时序预测',
              to: '/docs/algorithms/algorithm.chronos2.overview',
            },
            {
              label: 'DMA 水量平衡分析',
              to: '/docs/scenarios/scenario.s01-dma-leakage',
            },
            {
              label: '最小夜间流量 (MNF)',
              to: '/docs/scenarios/scenario.s01-dma-leakage',
            },
          ],
        },
        {
          title: '开发者与运维',
          items: [
            {
              label: 'API 快速调用',
              to: '/docs/development/development.first-api-call',
            },
            {
              label: '服务拓扑与运维',
              to: '/docs/operations/operations.health-topology',
            },
            {
              label: '系统验收与闭环',
              to: '/docs/acceptance/acceptance.workflow-closure',
            },
            {
              label: '多通道数据治理',
              to: '/docs/scenarios/scenario.timeseries-governance',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} 智慧水务算法平台. All rights reserved.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
    mermaid: {theme: {light: 'neutral', dark: 'dark'}},
  } satisfies Preset.ThemeConfig,
};

export default config;
