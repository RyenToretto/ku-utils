import { defineConfig } from 'tsup';

const bundledPackages = ['@ku-utils/landing-report', '@ku-utils/report', '@ku-utils/utils'];

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    resolve: bundledPackages,
  },
  clean: true,
  splitting: false,
  sourcemap: true,
  noExternal: bundledPackages,
});
