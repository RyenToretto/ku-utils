const FORBIDDEN_AI_COAUTHOR =
  /Co-authored-by:.*Cursor|cursoragent@|Co-authored-by:.*<[^>]*cursor[^>]*>/i;

export default {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'forbid-ai-coauthor': ({ raw }) => {
          const text = raw ?? '';
          const ok = !FORBIDDEN_AI_COAUTHOR.test(text);
          return [
            ok,
            '禁止包含 AI 署名 trailer（如 Co-authored-by: Cursor <cursoragent@cursor.com>）',
          ];
        },
      },
    },
  ],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'style',
        'refactor',
        'perf',
        'test',
        'build',
        'ci',
        'chore',
        'revert',
        'release',
      ],
    ],
    'scope-enum': [
      1,
      'always',
      [
        'eslint-config',
        'prettier-config',
        'tsconfig',
        'stylelint-config',
        'utils',
        'hooks',
        'directives',
        'ui',
        'ui-vue2',
        'skin',
        'constants',
        'i18n',
        'types',
        'nuxt-module',
        'custom-columns',
        'v2-custom-columns',
        'cli',
        'create-app',
        'kv3-admin',
        'docs',
        'deps',
        'ci',
        'release',
      ],
    ],
    'subject-max-length': [2, 'always', 100],
    'forbid-ai-coauthor': [2, 'always'],
  },
};
