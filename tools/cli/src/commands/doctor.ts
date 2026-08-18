import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

import chalk from 'chalk';

interface CheckResult {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  message: string;
}

export async function doctor() {
  console.log(chalk.blue('\n🩺 ku-utils 项目健康检查\n'));

  const cwd = process.cwd();
  const results: CheckResult[] = [];

  const pkgPath = resolve(cwd, 'package.json');
  if (!existsSync(pkgPath)) {
    console.log(chalk.red('未找到 package.json'));
    return;
  }

  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

  results.push({
    name: 'ESLint 配置',
    status: allDeps['@ku-utils/eslint-config'] ? 'pass' : 'warn',
    message: allDeps['@ku-utils/eslint-config'] ? '已安装' : '未安装 @ku-utils/eslint-config',
  });

  results.push({
    name: 'Prettier 配置',
    status: allDeps['@ku-utils/prettier-config'] ? 'pass' : 'warn',
    message: allDeps['@ku-utils/prettier-config'] ? '已安装' : '未安装 @ku-utils/prettier-config',
  });

  results.push({
    name: 'TSConfig',
    status: allDeps['@ku-utils/tsconfig'] ? 'pass' : 'warn',
    message: allDeps['@ku-utils/tsconfig'] ? '已安装' : '未安装 @ku-utils/tsconfig',
  });

  results.push({
    name: 'eslint.config.js',
    status:
      existsSync(resolve(cwd, 'eslint.config.js')) || existsSync(resolve(cwd, 'eslint.config.mjs'))
        ? 'pass'
        : 'fail',
    message: existsSync(resolve(cwd, 'eslint.config.js')) ? '已配置' : '缺少 eslint.config.js',
  });

  results.push({
    name: '.editorconfig',
    status: existsSync(resolve(cwd, '.editorconfig')) ? 'pass' : 'warn',
    message: existsSync(resolve(cwd, '.editorconfig')) ? '已配置' : '建议添加 .editorconfig',
  });

  results.push({
    name: '.gitignore',
    status: existsSync(resolve(cwd, '.gitignore')) ? 'pass' : 'fail',
    message: existsSync(resolve(cwd, '.gitignore')) ? '已配置' : '缺少 .gitignore',
  });

  const icons = { pass: chalk.green('✓'), warn: chalk.yellow('⚠'), fail: chalk.red('✗') };
  for (const result of results) {
    console.log(`  ${icons[result.status]} ${result.name}: ${result.message}`);
  }

  const fails = results.filter((r) => r.status === 'fail').length;
  const warns = results.filter((r) => r.status === 'warn').length;
  console.log(
    `\n${fails === 0 ? chalk.green('总体健康') : chalk.red(`${fails} 项需修复`)}${warns > 0 ? chalk.yellow(`, ${warns} 项建议优化`) : ''}\n`,
  );
}
