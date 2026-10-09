/**
 * `.cursor` rules/skills 与 best-practice 的内容级校验（登记对齐 ≠ 内容对齐，能机械判定的都在这里兜住）：
 * 1. 路径：正文反引号里的路径必须真实存在（app 内规则先在本 app 内找，再找全仓）。
 * 2. globs：每个 glob 至少命中一个文件；app 内规则相对 app 目录书写。
 * 3. 技术栈：各 app 规则与随包副本不得出现别栈专有写法（照抄金标端最常见的失真）。
 * 4. 四生结构：四端同名 rule/skill（含随包副本）的二级标题集合一致（缺节即缺约束）。
 * 例外：`<!-- bp-lint-ignore-start/end -->` 包住的行跳过技术栈检查（两栈对照表）；写了技术栈名的小节不参与四生结构比较。
 */

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ADMINS = ['kv3-admin', 'kv2-admin', 'kr-admin', 'ka-admin'];
/** 真源：仓内 `.cursor` rules/skills，以及随包分发（postinstall 复制到消费方 `.cursor/`）的 `packages/<包>/rules|skills` */
const RULE_OR_SKILL = String.raw`(rules\/[^/]+\.mdc|skills\/.+\/SKILL\.md)`;
export const SOURCE_RE = new RegExp(
  String.raw`(^|\/)\.cursor\/${RULE_OR_SKILL}$|^packages\/[^/]+\/${RULE_OR_SKILL}$`,
);
/** 随包分发的副本按目标技术栈套用对应 app 的禁用写法 */
const PACKAGE_STACK = {
  'custom-columns': 'kv3-admin',
  'v2-custom-columns': 'kv2-admin',
  'r-custom-columns': 'kr-admin',
  'a-custom-columns': 'ka-admin',
};
const BP_README_RE = /^docs\/best-practice\/[^/_][^/]*\/README\.md$/;

const VUE_ONLY = [
  /\.vue\b/,
  /\bv-(loading|model|if|for|show)\b/,
  /\$MAPS\b/,
  /\bdefine(Expose|Props|Emits)\b/,
  /<script setup/,
  /\bel-(table|dialog|drawer|select|form|form-item|button|input|pagination|radio|checkbox)\b/,
  /globalComponents/,
];
const STACK_FORBIDDEN = {
  'kv3-admin': [
    /\.tsx\b/,
    /\b(custom-class|wrapper-closable|visible-arrow|open-delay|close-delay)\b/,
    /\.el-dialog__wrapper|\.popper__arrow/,
  ],
  'kv2-admin': [
    /\.tsx\b/,
    /\.el-(input__wrapper|select__wrapper|select__popper|overlay-dialog|tooltip__trigger|popper__arrow)\b/,
    /\b(show-after|hide-after|show-arrow|teleported|align-center|fit-input-width|collapse-tags-tooltip|value-on-clear)\b/,
    /--el-(border|disabled-bg-color|color-white)\b/,
    /useSchemaColumnConfig\(\{/,
  ],
  'kr-admin': [...VUE_ONLY, /\bwatch\(/],
  'ka-admin': [...VUE_ONLY, /\.tsx\b/, /\buse(Effect|State|Memo|Callback)\b/],
};

function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*' && glob[i + 1] === '*') {
      const slash = glob[i + 2] === '/';
      re += slash ? '(?:.*/)?' : '.*';
      i += slash ? 2 : 1;
    } else if (c === '*') re += '[^/]*';
    else if (c === '?') re += '[^/]';
    else if (c === '{') {
      const end = glob.indexOf('}', i);
      re += `(?:${glob
        .slice(i + 1, end)
        .split(',')
        .map((s) => s.replace(/[.+^$()|[\]\\]/g, '\\$&'))
        .join('|')})`;
      i = end;
    } else re += c.replace(/[.+^$()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`);
}

const expandBraces = (s) => {
  const m = s.match(/\{([^{}]*,[^{}]*)\}/);
  return m ? m[1].split(',').flatMap((alt) => expandBraces(s.replace(m[0], alt))) : [s];
};

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return { globs: [] };
  const lines = m[1].split('\n');
  const idx = lines.findIndex((l) => l.startsWith('globs:'));
  if (idx < 0) return { globs: [] };
  const inline = lines[idx].slice('globs:'.length).trim();
  if (inline) return { globs: inline.split(/,(?![^{]*\})/).map((g) => g.trim()).filter(Boolean) };
  const globs = [];
  for (const l of lines.slice(idx + 1)) {
    const item = l.match(/^\s+-\s+['"]?(.+?)['"]?\s*$/);
    if (!item) break;
    globs.push(item[1]);
  }
  return { globs };
}

/** 去掉 frontmatter 与围栏代码块（示例代码里的 import 路径不当作落点） */
const bodyLines = (text) => {
  let fenced = false;
  return text
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .split('\n')
    .filter((line) => {
      if (/^\s*```/.test(line)) fenced = !fenced;
      else return !fenced;
      return false;
    });
};

/** `<!-- bp-lint-ignore-start -->` … `<!-- bp-lint-ignore-end -->` 之间的行不做技术栈检查（两栈对照表） */
const stackCheckedLines = (lines) => {
  let ignored = false;
  return lines.filter((line) => {
    if (line.includes('bp-lint-ignore-start')) ignored = true;
    else if (line.includes('bp-lint-ignore-end')) ignored = false;
    else return !ignored;
    return false;
  });
};

const STACK_HEADING = /Angular|React|Vue|ng-zorro|Ant Design|antd|Element/i;
/** 四生标题归一：Step 只比序号；app 名抹平；只比中文（各栈命名不同的英文词不算差异） */
const normalizeHeading = (h) => {
  const step = h.match(/^Step\s*\d+/i);
  if (step) return step[0].replace(/\s+/g, ' ');
  const plain = h.replace(/(kv3|kv2|kr|ka)-admin/g, '端').replace(/`[^`]*`/g, '');
  const cjk = plain.match(/[\u4e00-\u9fa5]+/g)?.join('') ?? '';
  return cjk || plain.toLowerCase().trim();
};

const PATH_TOKEN = /^[\w@.~][\w@./{},-]*$/;
const SKIP_TOKEN = /[*<>$]|\.\.\.|xxx|Xxx|XXX|\{id\}|^https?:|^@ku-utils\/|^\.\.?\/|^~/;

function isPathLike(token) {
  if (!PATH_TOKEN.test(token) || SKIP_TOKEN.test(token) || !token.includes('/')) return false;
  return token.endsWith('/') || /\.[a-z]{1,5}$/i.test(token);
}

const isIgnored = (p) => {
  try {
    execFileSync('git', ['check-ignore', '-q', p]);
    return true;
  } catch {
    return false;
  }
};

/** @param view 仓库视图；@param landedModules 已落地 best-practice 模块目录（参考模块 / glb-* 的路径指向他仓或本机，不校验） */
export function lintContent(view, landedModules) {
  const problems = [];
  const files = view.files;
  const fileSet = new Set(files);
  const appOf = (f) => f.match(/^apps\/([^/]+)\//)?.[1];
  const packageOf = (f) => f.match(/^packages\/([^/]+)\/(?:rules|skills)\//)?.[1];
  const filesByApp = new Map();
  for (const f of files) {
    const app = appOf(f);
    if (app) filesByApp.set(app, [...(filesByApp.get(app) ?? []), f.slice(`apps/${app}/`.length)]);
  }

  const roots = ['', ...ADMINS.map((a) => `apps/${a}/`)];
  const exists = (token, app) =>
    expandBraces(token).every((raw) => {
      const p = raw.replace(/^@\//, 'src/');
      const scopes = app ? [[`apps/${app}/`, filesByApp.get(app) ?? []]] : [];
      scopes.push(['', files]);
      for (const [prefix, list] of scopes) {
        if (p.endsWith('/')) {
          if (list.some((f) => f.startsWith(p) || f.includes(`/${p}`))) return true;
        } else if (fileSet.has(prefix + p) || list.some((f) => f === p || f.endsWith(`/${p}`))) return true;
      }
      const bases = app ? [`apps/${app}/`, `apps/${app}/src/`, ''] : roots;
      return bases.some(
        (b) =>
          existsSync(resolve(b || '.', p)) || existsSync(resolve(b || '.', 'node_modules', p)) || isIgnored(b + p),
      );
    });

  const isLandedReadme = (f) => BP_README_RE.test(f) && landedModules.has(f.replace(/README\.md$/, ''));
  const targets = files.filter((f) => SOURCE_RE.test(f) || isLandedReadme(f));
  for (const f of targets) {
    const text = view.read(f);
    const app = appOf(f);
    const isSource = SOURCE_RE.test(f);
    const lines = bodyLines(text);

    for (const line of lines) {
      for (const [, token] of line.matchAll(/`([^`\n]+)`/g)) {
        if (isPathLike(token) && !exists(token, app)) problems.push(`路径不存在：${f} 引用 \`${token}\``);
      }
    }

    if (isSource) {
      const { globs } = frontmatter(text);
      const list = app ? (filesByApp.get(app) ?? []) : files;
      for (const g of globs) {
        if (app && g.startsWith(`apps/${app}/`)) {
          problems.push(`globs 写法：${f} 的 \`${g}\` 应相对 app 目录（去掉 apps/${app}/ 前缀）`);
          continue;
        }
        const re = globToRegExp(g.includes('/') ? g : `**/${g}`);
        if (!list.some((p) => re.test(p))) problems.push(`globs 落空：${f} 的 \`${g}\` 未命中任何文件`);
      }

      const stack = app ?? PACKAGE_STACK[packageOf(f)];
      const forbidden = stack ? STACK_FORBIDDEN[stack] : undefined;
      if (forbidden) {
        for (const line of stackCheckedLines(lines)) {
          const hit = forbidden.find((re) => re.test(line));
          if (hit) problems.push(`技术栈失真：${f} 出现 ${stack} 不存在的写法 ${hit.exec(line)[0]}：${line.trim().slice(0, 80)}`);
        }
      }
    }
  }

  /** 四端 app 与随包副本的同名 rule/skill 归到同一组比较结构 */
  const sameNameKey = (f) =>
    f
      .replace(/^apps\/[^/]+\/\.cursor\//, '')
      .replace(/^packages\/[^/]+\//, '')
      .replace(/\b(?:v2|r|a)-custom-columns/g, 'custom-columns')
      .replace(/custom-columns-[a-z0-9]+-pattern/, 'custom-columns-pattern');
  const sameName = new Map();
  const comparable = (x) => SOURCE_RE.test(x) && (ADMINS.includes(appOf(x)) || packageOf(x));
  for (const f of files.filter(comparable)) {
    const key = sameNameKey(f);
    sameName.set(key, [...(sameName.get(key) ?? []), f]);
  }
  for (const [key, group] of sameName) {
    if (group.length < 2) continue;
    const headingsOf = (f) =>
      new Set(
        bodyLines(view.read(f))
          .filter((l) => /^## /.test(l) && !STACK_HEADING.test(l))
          .map((l) => normalizeHeading(l.replace(/^## /, '').trim())),
      );
    const all = group.map((f) => [f, headingsOf(f)]);
    const union = new Set(all.flatMap(([, h]) => [...h]));
    for (const [f, h] of all) {
      const missing = [...union].filter((x) => !h.has(x));
      if (missing.length) problems.push(`四生缺节：${f} 缺少同名 ${key} 其他端有的「${missing.join('」「')}」`);
    }
  }
  return problems;
}
