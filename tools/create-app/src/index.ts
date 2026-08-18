import { mkdirSync, writeFileSync } from 'fs';
import { resolve } from 'path';

import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';

async function main() {
  console.log(chalk.blue('\n🚀 @ku-utils/create-app\n'));

  const name = process.argv[2] || (await input({ message: '项目名称' }));
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
      scripts: {
        dev: template === 'nuxt4' ? 'nuxt dev' : 'vite',
        build: template === 'nuxt4' ? 'nuxt build' : 'vite build',
        lint: 'eslint .',
        'lint:fix': 'eslint . --fix',
      },
    };

    writeFileSync(resolve(targetDir, 'package.json'), JSON.stringify(pkgJson, null, 2));

    writeFileSync(
      resolve(targetDir, '.gitignore'),
      'node_modules\ndist\n.nuxt\n.output\n*.local\n.DS_Store\n',
    );

    spinner.succeed(chalk.green('项目创建成功！'));
    console.log(`\n  cd ${name}`);
    console.log('  pnpm install');
    console.log('  pnpm dev\n');
  } catch (error) {
    spinner.fail(chalk.red('创建失败'));
    console.error(error);
  }
}

main();
