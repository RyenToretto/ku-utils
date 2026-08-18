import { existsSync, readFileSync, writeFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

import { checkbox } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';

function getCliVersion(): string {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const cliPkgPath = resolve(__dirname, '..', 'package.json');
  try {
    const cliPkg = JSON.parse(readFileSync(cliPkgPath, 'utf-8'));
    return `^${cliPkg.version}`;
  } catch {
    return '^1.1.1';
  }
}

export async function init() {
  console.log(chalk.blue('\n🔧 初始化 ku-utils 配置\n'));

  const cwd = process.cwd();
  const pkgPath = resolve(cwd, 'package.json');

  if (!existsSync(pkgPath)) {
    console.log(chalk.red('未找到 package.json，请在项目根目录执行'));
    return;
  }

  const features = await checkbox({
    message: '选择要配置的功能',
    choices: [
      { name: 'ESLint 配置', value: 'eslint', checked: true },
      { name: 'Prettier 配置', value: 'prettier', checked: true },
      { name: 'TSConfig 配置', value: 'tsconfig', checked: true },
      { name: 'Stylelint 配置', value: 'stylelint' },
      { name: '工具函数 (@ku-utils/utils)', value: 'utils' },
      { name: 'Hooks (@ku-utils/hooks)', value: 'hooks' },
      { name: 'UI 组件 (@ku-utils/ui)', value: 'ui' },
      { name: 'HTTP 请求 (@ku-utils/request)', value: 'request' },
    ],
  });

  const spinner = ora('正在配置...').start();

  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    const ver = getCliVersion();

    if (!pkg.devDependencies) pkg.devDependencies = {};
    if (!pkg.dependencies) pkg.dependencies = {};

    if (features.includes('eslint')) {
      pkg.devDependencies['@ku-utils/eslint-config'] = ver;
      pkg.devDependencies['eslint'] = '^9.27.0';
    }
    if (features.includes('prettier')) {
      pkg.devDependencies['@ku-utils/prettier-config'] = ver;
      pkg.prettier = '@ku-utils/prettier-config';
    }
    if (features.includes('tsconfig')) {
      pkg.devDependencies['@ku-utils/tsconfig'] = ver;
    }
    if (features.includes('stylelint')) {
      pkg.devDependencies['@ku-utils/stylelint-config'] = ver;
      pkg.devDependencies['stylelint'] = '^16.0.0';
    }
    if (features.includes('utils')) {
      pkg.dependencies['@ku-utils/utils'] = ver;
    }
    if (features.includes('hooks')) {
      pkg.dependencies['@ku-utils/hooks'] = ver;
    }
    if (features.includes('ui')) {
      pkg.dependencies['@ku-utils/ui'] = ver;
    }
    if (features.includes('request')) {
      pkg.dependencies['@ku-utils/request'] = ver;
    }

    writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

    spinner.succeed(chalk.green(`配置完成！（包版本: ${ver}）`));
    console.log(chalk.yellow('\n请执行 pnpm install 安装依赖\n'));
  } catch (error) {
    spinner.fail(chalk.red('配置失败'));
    console.error(error);
  }
}
