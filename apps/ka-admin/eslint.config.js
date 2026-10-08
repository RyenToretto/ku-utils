import angularConfig from '@ku-utils/eslint-config/angular';

export default [
  ...angularConfig,
  {
    ignores: ['dist/**', 'node_modules/**', '.angular/**', 'scripts/**', 'public/**'],
  },
];
