import pluginVue from 'eslint-plugin-vue';

import baseConfig from './base.js';

export default [
  ...baseConfig,
  ...pluginVue.configs['flat/vue2-recommended'],
  {
    files: ['**/*.vue'],
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-indent': 'off',
      'vue/html-self-closing': [
        'error',
        { html: { void: 'any', normal: 'always', component: 'always' } },
      ],
      'vue/block-order': ['error', { order: ['template', 'script', 'style'] }],
      'vue/no-v-html': 'off',
    },
  },
];
