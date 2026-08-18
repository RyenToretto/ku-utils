import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import { select } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';

export async function create(name: string) {
  console.log(chalk.blue(`\n🚀 创建项目: ${name}\n`));

  const template = await select({
    message: '选择项目模板',
    choices: [
      { name: 'Vue 3 + TypeScript + Vite', value: 'vue3' },
      { name: 'Vue 2 + JavaScript + Vite', value: 'vue2' },
      { name: 'Nuxt 4', value: 'nuxt4' },
    ],
  });

  const spinner = ora('正在创建项目...').start();

  try {
    const targetDir = resolve(process.cwd(), name);
    mkdirSync(targetDir, { recursive: true });

    const pkgJson = {
      name,
      version: '0.0.1',
      private: true,
      type: 'module',
      scripts: getScripts(template),
      dependencies: getDeps(template),
      devDependencies: getDevDeps(template),
    };

    writeFileSync(resolve(targetDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

    const eslintConfig =
      template === 'vue2'
        ? "import vue2Config from '@ku-utils/eslint-config/vue2';\n\nexport default [...vue2Config];\n"
        : template === 'nuxt4'
          ? "import nuxt4Config from '@ku-utils/eslint-config/nuxt4';\n\nexport default [...nuxt4Config];\n"
          : "import vue3Config from '@ku-utils/eslint-config/vue3';\n\nexport default [...vue3Config];\n";

    writeFileSync(resolve(targetDir, 'eslint.config.js'), eslintConfig);

    const tsconfig =
      template === 'vue2'
        ? { extends: '@ku-utils/tsconfig/vue2.json' }
        : template === 'nuxt4'
          ? { extends: './.nuxt/tsconfig.json' }
          : { extends: '@ku-utils/tsconfig/vue3.json' };

    writeFileSync(resolve(targetDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

    spinner.succeed(chalk.green('项目创建成功！'));
    console.log(`\n  cd ${name}`);
    console.log('  pnpm install');
    console.log('  pnpm dev\n');
  } catch (error) {
    spinner.fail(chalk.red('项目创建失败'));
    console.error(error);
  }
}

function getScripts(template: string) {
  const base = { lint: 'eslint .', 'lint:fix': 'eslint . --fix' };
  if (template === 'nuxt4') {
    return { ...base, dev: 'nuxt dev', build: 'nuxt build', preview: 'nuxt preview' };
  }
  return { ...base, dev: 'vite', build: 'vite build', preview: 'vite preview' };
}

function getDeps(template: string): Record<string, string> {
  if (template === 'vue2') {
    return { vue: '^2.7.16', 'vue-router': '^3.6.5', vuex: '^3.6.2' };
  }
  if (template === 'nuxt4') {
    return { nuxt: '^3.17.3', vue: '^3.5.16' };
  }
  return { vue: '^3.5.16', 'vue-router': '^4.5.1', pinia: '^3.0.3' };
}

function getDevDeps(template: string): Record<string, string> {
  const base: Record<string, string> = {
    '@ku-utils/eslint-config': 'latest',
    '@ku-utils/prettier-config': 'latest',
    '@ku-utils/tsconfig': 'latest',
    eslint: '^9.27.0',
  };
  if (template === 'vue2') {
    return { ...base, '@vitejs/plugin-vue2': '^2.3.3', vite: '^6.3.5' };
  }
  if (template === 'nuxt4') {
    return { ...base, typescript: '^5.8.3' };
  }
  return {
    ...base,
    '@vitejs/plugin-vue': '^5.2.4',
    typescript: '^5.8.3',
    vite: '^6.3.5',
    'vue-tsc': '^2.2.10',
  };
}
