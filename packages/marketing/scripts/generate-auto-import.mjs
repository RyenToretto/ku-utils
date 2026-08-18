#!/usr/bin/env node
/**
 * 根据 dist/index.js 自动生成 src/auto-import.ts 的导出符号列表。
 *
 * 与 packages/utils/scripts/generate-auto-import.mjs 同构，详见其注释。
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const distEntry = join(rootDir, 'dist', 'index.js');
const autoImportSrc = join(rootDir, 'src', 'auto-import.ts');
const pkgPath = join(rootDir, 'package.json');

function constName(pkgName) {
  const base = pkgName.replace(/^@/, '').replace(/[\/-](\w)/g, (_, c) => c.toUpperCase());
  return `${base}Imports`;
}

function presetName(pkgName) {
  const base = pkgName.replace(/^@/, '').replace(/[\/-](\w)/g, (_, c) => c.toUpperCase());
  return `${base}Preset`;
}

async function main() {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
  const pkgName = pkg.name;

  let mod;
  try {
    mod = await import(pathToFileURL(distEntry).href);
  } catch (err) {
    console.warn(
      `⚠️  generate-auto-import: 无法 import ${distEntry}，跳过（请先 tsup 出 dist/index.js）`
    );
    console.warn(err?.message || err);
    process.exit(0);
  }

  const names = Object.keys(mod)
    .filter((k) => k !== 'default' && !k.startsWith('_'))
    .sort((a, b) => a.localeCompare(b));

  if (names.length === 0) {
    console.warn('⚠️  generate-auto-import: 未解析到任何命名导出，跳过');
    process.exit(0);
  }

  const itemsStr = names.map((n) => `    '${n}',`).join('\n');
  const importsConst = constName(pkgName);
  const presetConst = presetName(pkgName);

  const content = `/**
 * auto-import preset 类型定义
 * ⚠️ 不要从 'unplugin-auto-import/types' 引入 ImportsMap —— 该依赖属于消费方项目，
 *    本库不应依赖它。此处直接内联等价类型即可。
 */
type ImportsMap = Record<string, (string | string[])[]>;

/**
 * 由 scripts/generate-auto-import.mjs 自动生成，勿手动编辑。
 * 共 ${names.length} 个命名导出。
 */
export const ${importsConst}: ImportsMap = {
  '${pkgName}': [
${itemsStr}
  ],
};

export const ${presetConst} = ${importsConst};
`;

  writeFileSync(autoImportSrc, content, 'utf-8');
  console.log(
    `✅ ${pkgName} auto-import: 已同步 ${names.length} 个命名导出 → src/auto-import.ts`
  );
}

main();
