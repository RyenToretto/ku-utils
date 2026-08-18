import vue3Config from '@ku-utils/eslint-config/vue3';

export default [
  ...vue3Config,
  {
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/.vitepress/**',
      'docs/**',
    ],
  },
  {
    files: ['**/*.vue'],
    rules: {
      'vue/block-lang': 'off',
    },
  },
  // Vue 2 组件包使用 Vue 2 语法（.sync、非自闭合 HTML 等），需关闭 Vue 3 专属规则
  {
    files: ['packages/v2-custom-columns/**/*.vue'],
    rules: {
      'vue/no-deprecated-v-bind-sync': 'off',
      'vue/require-explicit-emits': 'off',
      'vue/no-v-for-template-key-on-child': 'off',
      'vue/html-self-closing': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/multiline-html-element-content-newline': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
    },
  },
];
