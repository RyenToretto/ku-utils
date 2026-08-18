import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    base: 'src/base.js',
    vue2: 'src/vue2.js',
    vue3: 'src/vue3.js',
    nuxt4: 'src/nuxt4.js',
  },
  format: ['esm'],
  clean: true,
  external: [
    'eslint',
    'eslint-plugin-vue',
    'typescript-eslint',
    '@stylistic/eslint-plugin',
    'eslint-plugin-import-x',
    'globals',
  ],
});
