import baseConfig from '@ku-utils/eslint-config/base';

export default [
  ...baseConfig,
  {
    ignores: ['dist/**', 'node_modules/**', 'scripts/**', 'public/**'],
  },
];
