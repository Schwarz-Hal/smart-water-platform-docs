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
          editUrl: 'https://github.com/Schwarz-Hal/smart-water-platform-docs/tree/main/',
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
      respectPrefersColorScheme: true,
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
          sidebarId: 'documentationSidebar',
          position: 'left',
          label: '文档',
        },
        {to: '/docs/quick-start/quickstart.first-quality-workflow', label: '快速开始', position: 'left'},
        {to: '/docs/algorithms/algorithm.chronos2.overview', label: '算法库', position: 'left'},
        {to: '/docs/scenarios/scenario.s01-dma-leakage', label: '业务场景', position: 'left'},
        {to: '/docs/development/development.first-api-call', label: 'API 参考', position: 'left'},
        {to: '/search', label: '搜索', position: 'left'},
        {
          href: 'https://github.com/Schwarz-Hal/smart-water-platform-docs',
          label: 'GitHub',
          position: 'right',
        },
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
              label: '平台源码 (GitHub)',
              href: 'https://github.com/Schwarz-Hal/smart-water-platform-backend',
            },
            {
              label: '文档仓库 (GitHub)',
              href: 'https://github.com/Schwarz-Hal/smart-water-platform-docs',
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
    mermaid: {theme: {light: 'neutral', dark: 'forest'}},
  } satisfies Preset.ThemeConfig,
};

export default config;
