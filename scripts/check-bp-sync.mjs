#!/usr/bin/env node
/**
 * 校验 `.cursor` rules/skills ↔ `docs/best-practice` 双向同步（对照表真源：docs/best-practice/SYNC.md「已落地」表）。
 *
 * 1. 登记：仓内每个 rule/skill 都在 SYNC 登记、登记的文件都存在、引用的模块目录有 README 且在模块地图里。
 * 2. 内容：见 bp-content-lint.mjs（路径存在、globs 命中、技术栈不串、四生同名同节）。
 * 3. 配对：改了真源 → 必须同时改其 best-practice 模块；改了已落地模块 → 必须同时改至少一个真源。
 *    对侧已人工核对一致、只需改一侧时，在提交信息写 trailer `BP-Sync-Reviewed: <对侧路径>` 豁免该条。
 *
 * 用法：
 *   node scripts/check-bp-sync.mjs              # 暂存区登记 + 内容（pre-commit）
 *   node scripts/check-bp-sync.mjs --msg <file> # 暂存区配对，读提交信息里的 trailer（commit-msg）
 *   node scripts/check-bp-sync.mjs --worktree   # 全部未提交改动：登记 + 内容 + 配对
 *   node scripts/check-bp-sync.mjs --base <ref> # CI：HEAD 登记 + 内容，<ref>..HEAD 逐提交配对
 *   node scripts/check-bp-sync.mjs --hook       # Cursor stop 钩子：读 stdin，按 --worktree 检查，输出 followup JSON
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { lintContent } from './bp-content-lint.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BP = 'docs/best-practice';
const SYNC = `${BP}/SYNC.md`;
const MAP = `${BP}/README.md`;
const SOURCE_RE = /(^|\/)\.cursor\/(rules\/[^/]+\.mdc|skills\/.+\/SKILL\.md)$/;
const TRAILER = 'BP-Sync-Reviewed';

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf-8' });
const lines = (out) => out.split('\n').filter(Boolean);

/** 暂存区模式读索引里的版本（部分暂存时以将要提交的内容为准），其余读工作区 */
function createRepoView(staged) {
  if (!staged) {
    const files = lines(git('ls-files', '--cached', '--others', '--exclude-standard')).filter((f) =>
      existsSync(resolve(ROOT, f)),
    );
    return { files, read: (f) => readFileSync(resolve(ROOT, f), 'utf-8') };
  }
  return { files: lines(git('ls-files', '--cached')), read: (f) => git('show', `:${f}`) };
}

/** SYNC「已落地」表 → Map<真源路径, 模块落点[]>；落点为 `docs/best-practice/<模块>/` 或登记文件本身 */
function readMapping(view) {
  const text = view.read(SYNC);
  const section = text.split(/^## /m).find((s) => s.startsWith('已落地')) ?? '';
  const mapping = new Map();
  for (const row of section.split('\n')) {
    const source = row.match(/^\|\s*`([^`]+)`\s*\|/)?.[1];
    if (!source) continue;
    const targets = [...row.matchAll(/\]\(\.\/([^)]+)\)/g)].map(([, t]) => `${BP}/${t}`);
    mapping.set(source, targets);
  }
  return mapping;
}

function checkRegistry(view, mapping) {
  const problems = [];
  const existing = new Set(view.files);
  const moduleMap = view.read(MAP);
  for (const f of view.files.filter((x) => SOURCE_RE.test(x)))
    if (!mapping.has(f)) problems.push(`未登记：${f} 不在 ${SYNC}「已落地」表`);
  for (const [source, targets] of mapping) {
    if (!existing.has(source)) problems.push(`已失效：${SYNC} 登记的 ${source} 不存在`);
    for (const t of targets) {
      if (!t.endsWith('/')) continue;
      if (!existing.has(`${t}README.md`)) problems.push(`缺模块：${t}README.md 不存在`);
      const name = t.slice(BP.length + 1);
      if (!moduleMap.includes(`](./${name})`))
        problems.push(`缺地图：${MAP} 模块地图未登记 ${name}`);
    }
  }
  return problems;
}

function landedModules(mapping) {
  return new Set([...mapping.values()].flat().filter((t) => t.endsWith('/')));
}

function reviewedPaths(message) {
  const re = new RegExp(`^${TRAILER}:\\s*(\\S+)\\s*$`, 'gm');
  return new Set([...(message ?? '').matchAll(re)].map(([, p]) => p.replace(/^\.\//, '')));
}

function checkPairing(mapping, changed, message) {
  const problems = [];
  const reviewed = reviewedPaths(message);
  const isReviewed = (paths) => paths.some((p) => reviewed.has(p) || reviewed.has(p.replace(/\/$/, '')));
  const touched = (prefixOrFile) =>
    changed.some((f) => f === prefixOrFile || f.startsWith(prefixOrFile));
  for (const [source, targets] of mapping) {
    if (changed.includes(source) && !targets.some(touched) && !isReviewed(targets)) {
      problems.push(`单边改动：改了 ${source}，未同步 ${targets.join(' / ')}`);
    }
  }
  const sourcesByModule = new Map();
  for (const [source, targets] of mapping) {
    for (const t of targets)
      if (t.endsWith('/')) sourcesByModule.set(t, [...(sourcesByModule.get(t) ?? []), source]);
  }
  for (const [module, sources] of sourcesByModule) {
    if (touched(module) && !sources.some((s) => changed.includes(s)) && !isReviewed(sources)) {
      problems.push(`单边改动：改了 ${module}，未回写真源（任一）：${sources.join('、')}`);
    }
  }
  return problems;
}

function worktreeChanged() {
  return lines(git('status', '--porcelain', '-uall')).map((l) => {
    const path = l.slice(3);
    return path.includes(' -> ') ? path.split(' -> ')[1] : path;
  });
}

function check(mode, arg) {
  const view = createRepoView(mode === 'staged' || mode === 'msg');
  const mapping = readMapping(view);
  if (mode === 'msg') {
    const message = readFileSync(resolve(ROOT, arg), 'utf-8');
    return checkPairing(mapping, lines(git('diff', '--cached', '--name-only')), message);
  }
  const problems = [...checkRegistry(view, mapping), ...lintContent(view, landedModules(mapping))];
  if (mode === 'worktree') problems.push(...checkPairing(mapping, worktreeChanged(), ''));
  if (mode === 'base' && arg && !/^0+$/.test(arg)) {
    for (const sha of lines(git('rev-list', '--no-merges', `${arg}..HEAD`))) {
      const changed = lines(git('diff-tree', '--no-commit-id', '--name-only', '-r', sha));
      const message = git('log', '-1', '--format=%B', sha);
      for (const p of checkPairing(mapping, changed, message)) problems.push(`${sha.slice(0, 7)} ${p}`);
    }
  }
  return problems;
}

const HINT =
  `对侧确已人工核对一致、只需改一侧时，在提交信息末尾加 trailer：${TRAILER}: <对侧路径>（如 docs/best-practice/rule-xxx/）。`;

const args = process.argv.slice(2);
if (args.includes('--hook')) {
  let input = {};
  try {
    input = JSON.parse(readFileSync(0, 'utf-8') || '{}');
  } catch {}
  const problems = input.status && input.status !== 'completed' ? [] : check('worktree');
  const followup = problems.length
    ? `best-practice 同步检查未通过（.cursor/rules/best-practice-sync.mdc）。请在本任务内按真实代码补齐另一侧（内容对齐，不是改个字凑配对），再结束：\n- ${problems.join('\n- ')}\n${HINT}`
    : undefined;
  process.stdout.write(JSON.stringify(followup ? { followup_message: followup } : {}));
  process.exit(0);
}

const flag = ['--msg', '--base'].find((f) => args.includes(f));
const mode = flag ? flag.slice(2) : args.includes('--worktree') ? 'worktree' : 'staged';
const problems = check(mode, flag ? args[args.indexOf(flag) + 1] : undefined);
if (problems.length) {
  console.error(
    `[check-bp-sync] ${problems.length} 处问题（规则见 .cursor/rules/best-practice-sync.mdc）：`,
  );
  for (const p of problems) console.error(`  - ${p}`);
  if (problems.some((p) => p.includes('单边改动'))) console.error(`  ${HINT}`);
  process.exit(1);
}
process.stdout.write('[check-bp-sync] 通过\n');
