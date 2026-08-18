import { defineConfig } from 'vitepress';

const opsSidebar = [
  {
    text: '运维与部署',
    items: [
      { text: 'Turborepo 使用指南', link: '/turborepo' },
      { text: 'VitePress 部署', link: '/deploy-vitepress' },
      { text: '发布到 npm', link: '/npm-publish' },
      { text: '贡献指南', link: '/contributing' },
    ],
  },
];

export default defineConfig({
  title: 'ku-utils',
  description: 'ku-utils 前端团队公共库文档',
  lang: 'zh-CN',
  base: '/',
  themeConfig: {
    nav: [
      { text: '指南', link: '/guide/getting-started' },
      { text: '工程配置', link: '/config/eslint' },
      { text: '组件库', link: '/components/button' },
      { text: '工具库', link: '/packages/utils' },
      { text: 'CLI', link: '/cli/overview' },
      { text: '运维', link: '/turborepo' },
    ],
    sidebar: {
      '/guide/': [
        {
          text: '快速开始',
          items: [
            { text: '简介', link: '/guide/introduction' },
            { text: '快速上手', link: '/guide/getting-started' },
            { text: '从 npm 安装', link: '/guide/npm' },
            { text: '存量项目迁移', link: '/guide/migration' },
          ],
        },
      ],
      '/config/': [
        {
          text: '工程配置',
          items: [
            { text: 'ESLint', link: '/config/eslint' },
            { text: 'Prettier', link: '/config/prettier' },
            { text: 'TypeScript', link: '/config/tsconfig' },
            { text: 'Stylelint', link: '/config/stylelint' },
          ],
        },
      ],
      '/components/': [
        {
          text: '组件',
          items: [
            { text: 'DuButton 按钮', link: '/components/button' },
            { text: 'DuEmpty 空状态', link: '/components/empty' },
            { text: 'DuModal 弹窗', link: '/components/modal' },
            { text: 'DuStatusTag 状态标签', link: '/components/status-tag' },
          ],
        },
      ],
      '/packages/': [
        {
          text: '公共库',
          items: [
            { text: 'Utils 工具函数', link: '/packages/utils' },
            { text: 'Hooks 组合式函数', link: '/packages/hooks' },
            { text: 'Constants 常量', link: '/packages/constants' },
            { text: 'Types 类型定义', link: '/packages/types' },
            { text: 'Directives 指令', link: '/packages/directives' },
            { text: 'I18n 多语言', link: '/packages/i18n' },
            { text: 'Design Tokens 设计令牌', link: '/packages/design-tokens' },
            { text: 'Nuxt Module', link: '/packages/nuxt-module' },
          ],
        },
      ],
      '/cli/': [
        {
          text: 'CLI 工具',
          items: [
            { text: '概览', link: '/cli/overview' },
            { text: 'create 创建项目', link: '/cli/create' },
            { text: 'init 初始化配置', link: '/cli/init' },
            { text: 'doctor 健康检查', link: '/cli/doctor' },
          ],
        },
      ],
      '/turborepo': opsSidebar,
      '/deploy-vitepress': opsSidebar,
      '/npm-publish': opsSidebar,
      '/contributing': opsSidebar,
    },
    socialLinks: [],
    footer: {
      message: 'ku-utils 前端团队',
    },
    search: {
      provider: 'local',
    },
    outline: {
      level: [2, 3],
      label: '目录',
    },
  },
});
