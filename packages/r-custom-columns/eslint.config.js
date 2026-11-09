import baseConfig from '@ku-utils/eslint-config/base';
import tseslint from 'typescript-eslint';

export default tseslint.config(...baseConfig, {
  files: ['**/*.{ts,tsx}'],
  extends: [...tseslint.configs.recommended],
  languageOptions: {
    parserOptions: {
      ecmaFeatures: { jsx: true },
    },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
});
