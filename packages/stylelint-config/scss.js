import baseConfig from './index.js';

/** @type {import('stylelint').Config} */
export default {
  ...baseConfig,
  extends: ['stylelint-config-standard', 'stylelint-config-recess-order'],
  customSyntax: 'postcss-scss',
  rules: {
    ...baseConfig.rules,
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'use',
          'forward',
          'mixin',
          'include',
          'function',
          'return',
          'if',
          'else',
          'each',
          'for',
          'while',
          'extend',
          'at-root',
          'error',
          'warn',
          'debug',
        ],
      },
    ],
  },
};
