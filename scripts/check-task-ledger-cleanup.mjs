#!/usr/bin/env node

/**
 * 台账清理巡检：列出可删的 {owner}{seq}-{slug}.md（全收口 + 不在活跃板 + ≥30 天）。
 *
 * 用法（仓根）：
 *   node scripts/check-task-ledger-cleanup.mjs
 *   node scripts/check-task-ledger-cleanup.mjs --app ka-admin
 *   node scripts/check-task-ledger-cleanup.mjs --owner koujianfeng
 *   node scripts/check-task-ledger-cleanup.mjs --days 30
 *   node scripts/check-task-ledger-cleanup.mjs --apply   # 真正删除；请同步改对应 TASK.md
 *
 * npm：pnpm taskledger:cleanup -- --app ka-admin --owner koujianfeng
 */

import { existsSync, readFileSync, readdirSync, unlinkSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const repoRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const APPS_DIR = resolve(repoRoot, 'apps');

/** 本仓暂无强制续作主题文件；业务仓可在此登记 */
const FORCED_THEME_FILES = new Set([]);

const OWNER_LEDGER = /^([a-z][a-z0-9]*)\d+-.+\.md$/;
/** 表格行内出现未完成态即可（兼容 3/4 列表格） */
const OPEN_STATUS_ROW = /^\|[^\n]*(⭕️|⚠️|⛔️)/m;

function parseArgs(argv) {
  const args = { owner: null, days: 30, apply: false, app: null };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--owner') args.owner = argv[++i];
    else if (a === '--days') args.days = Number(argv[++i]);
    else if (a === '--app') args.app = argv[++i];
    else if (a === '--apply') args.apply = true;
  }
  if (!Number.isFinite(args.days) || args.days < 0) {
    throw new Error('--days 必须是非负数字');
  }
  return args;
}

function listAppTaskDirs(appFilter) {
  const names = readdirSync(APPS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => !appFilter || name === appFilter);

  const dirs = [];
  for (const name of names) {
    const taskDir = resolve(APPS_DIR, name, 'docs/task');
    if (existsSync(taskDir)) dirs.push({ app: name, taskDir });
  }
  if (appFilter && dirs.length === 0) {
    throw new Error(`未找到 apps/${appFilter}/docs/task`);
  }
  return dirs;
}

/** 兼容 ### / #### 活跃子节 */
function activeBoardFiles(taskMd) {
  const files = new Set();
  const tableBlocks = taskMd.matchAll(/#{2,4}\s*(⭕️|⚠️|⛔️)[^\n]*\n+(?:\|[^\n]+\n)+/g);
  for (const match of tableBlocks) {
    for (const file of match[0].matchAll(/\]\(\.\/([^)]+\.md)\)/g)) {
      files.add(file[1]);
    }
  }
  return files;
}

function lastCommitAgeDays(filePath) {
  const result = spawnSync('git', ['log', '-1', '--format=%ct', '--', filePath], {
    cwd: repoRoot,
    encoding: 'utf8',
  });
  const ts = (result.stdout || '').trim();
  if (!ts) return null;
  return Math.floor((Date.now() / 1000 - Number(ts)) / 86400);
}

function analyzeApp({ app, taskDir }, { owner, days }) {
  const taskIndexPath = resolve(taskDir, 'TASK.md');
  if (!existsSync(taskIndexPath)) {
    return { app, taskDir, taskIndexPath, rows: [] };
  }

  const taskMd = readFileSync(taskIndexPath, 'utf8');
  const active = activeBoardFiles(taskMd);
  const rows = [];

  for (const name of readdirSync(taskDir).sort()) {
    if (!name.endsWith('.md') || name === 'TASK.md') continue;
    if (/^P\d/.test(name)) {
      rows.push({ name, action: 'KEEP', reasons: ['历史Pxx只读'], app });
      continue;
    }
    const ownerMatch = name.match(OWNER_LEDGER);
    if (!ownerMatch) {
      rows.push({ name, action: 'KEEP', reasons: ['非标准owner台账文件名'], app });
      continue;
    }
    if (owner && ownerMatch[1] !== owner) continue;

    const abs = resolve(taskDir, name);
    const text = readFileSync(abs, 'utf8');
    const reasons = [];
    const openMatches = text.match(new RegExp(OPEN_STATUS_ROW.source, 'gm')) ?? [];
    if (openMatches.length) reasons.push(`未完成状态×${openMatches.length}`);
    if (active.has(name)) reasons.push('仍在TASK活跃看板');
    if (FORCED_THEME_FILES.has(name)) reasons.push('主题续作强制表保留');
    const age = lastCommitAgeDays(abs);
    if (age == null) reasons.push('无git提交记录');
    else if (age < days) reasons.push(`距上次提交${age}天(<${days})`);

    const canDelete =
      openMatches.length === 0 &&
      !active.has(name) &&
      !FORCED_THEME_FILES.has(name) &&
      age != null &&
      age >= days;

    rows.push({
      name,
      app,
      owner: ownerMatch[1],
      age,
      action: canDelete ? 'DELETE' : 'KEEP',
      reasons: canDelete ? [`可删：全收口+不在活跃板+≥${days}天`] : reasons,
      abs,
    });
  }

  return { app, taskDir, taskIndexPath, rows };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const appDirs = listAppTaskDirs(args.app);
  const allRows = [];
  const byApp = [];

  for (const dir of appDirs) {
    const result = analyzeApp(dir, args);
    byApp.push(result);
    allRows.push(...result.rows);
  }

  const deletable = allRows.filter((r) => r.action === 'DELETE');
  const scope = [
    args.app ? `app=${args.app}` : 'apps/*',
    args.owner ? `owner=${args.owner}` : '全员',
    `阈值≥${args.days}天`,
  ].join('，');

  process.stdout.write(
    `taskledger cleanup（${scope}）：候选 ${deletable.length} / 扫描 ${allRows.length}\n`,
  );

  const printable = args.owner
    ? allRows.filter((r) => r.owner === args.owner || r.action === 'DELETE')
    : deletable;

  for (const row of printable) {
    if (!args.owner && row.action === 'KEEP') continue;
    process.stdout.write(
      `- [${row.action}] ${row.app}/${row.name}${row.age != null ? ` age=${row.age}d` : ''} ${row.reasons.join('；')}\n`,
    );
  }

  if (args.apply) {
    for (const row of deletable) {
      unlinkSync(row.abs);
      process.stdout.write(`deleted ${row.app}/${row.name}\n`);
    }
    if (deletable.length) {
      const touched = [
        ...new Set(deletable.map((r) => `${r.app}/docs/task/TASK.md`)),
      ];
      process.stdout.write(
        `请同步编辑：${touched.join('、')}（去掉对已删文件的链接，含「已收口」）。\n`,
      );
    }
  }

  if (deletable.length === 0) {
    process.stdout.write('台账清理：无满期限可删项。\n');
  }

  process.exitCode = 0;
}

try {
  main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 2;
}
