/**
 * @ku-utils/skin 生成器
 *
 * 皮肤是数据（src/themes/*.js），CSS 是产物。本脚本：
 * 1. 读 src/base-tokens.js + src/el-base.css，拼成与皮肤无关的基础层；
 * 2. 读每套 src/themes/*.js 的品牌语义色（light/dark 各一份），转成 --ku-*；
 * 3. 用 mix() 从品牌基色现算 Element Plus 的 --el-color-* 全套色阶（light-1..9 /
 *    dark-2 / rgb），不手写第二套色板；
 * 4. Element Plus 的结构类变量（bg/text/border/fill/menu/table/... ）统一写成
 *    var(--ku-*) 引用，只需在 :root 声明一次——html.dark 只要重新声明对应的
 *    --ku-* 原值，这些 --el-* 会通过变量引用自动跟着换，不必在 html.dark 里
 *    重复声明第二遍。
 *
 * 新增皮肤：新建 src/themes/<name>.js（照抄 lark.js 的形状改色值），重跑本脚本即可
 * 多出一个 dist/<name>.css，不需要改这个文件。
 */
import { mkdirSync, readFileSync, watch, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const srcDir = resolve(__dirname, '..', 'src');
const distDir = resolve(__dirname, '..', 'dist');
const watchMode = process.argv.includes('--watch');

const THEME_FILES = [
  'lark',
  'breeze',
  'dusk',
  'ember',
  'glen',
  'hextech',
  'honey',
  'indigo',
  'iris',
  'orchid',
  'sky',
  'tome',
];
const DEFAULT_THEME = 'lark';

/* ---------------------------------------------------------------- */
/* 颜色工具：纯 RGB 线性混合，用来现算 Element Plus 的色阶            */
/* ---------------------------------------------------------------- */

function hexToRgb(hex) {
  const normalized = hex.replace('#', '');
  const full =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized;
  const int = Number.parseInt(full, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}

function rgbToHex({ r, g, b }) {
  const toHex = (n) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/** mix(colorA, colorB, weight)：weight 为 0~1，表示 colorB 混入的比例 */
function mix(hexA, hexB, weight) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({
    r: a.r * (1 - weight) + b.r * weight,
    g: a.g * (1 - weight) + b.g * weight,
    b: a.b * (1 - weight) + b.b * weight,
  });
}

function tint(hex, ratio) {
  return mix(hex, '#ffffff', ratio);
}

function shade(hex, ratio) {
  return mix(hex, '#000000', ratio);
}

function rgbTriple(hex) {
  const { r, g, b } = hexToRgb(hex);
  return `${r}, ${g}, ${b}`;
}

/**
 * 现算 Element Plus 单个颜色家族的完整色阶。
 * light 模式往白混、深 2 档往黑混；dark 模式反过来（往 EP 官方深色背景 #141414
 * 混），近似 Element Plus 官方暗色算法。
 */
function buildElRamp(baseHex, { dark = false } = {}) {
  const ramp = {};
  for (let i = 1; i <= 9; i += 1) {
    ramp[`light-${i}`] = dark ? mix(baseHex, '#141414', i / 10) : tint(baseHex, i / 10);
  }
  ramp['dark-2'] = dark ? tint(baseHex, 0.2) : shade(baseHex, 0.2);
  ramp.rgb = rgbTriple(baseHex);
  return ramp;
}

/* ---------------------------------------------------------------- */
/* key 转换 + CSS 组装                                                */
/* ---------------------------------------------------------------- */

function toVarLines(prefix, obj, indent = '  ') {
  return Object.entries(obj)
    .map(([key, value]) => `${indent}--${prefix}-${key}: ${value};`)
    .join('\n');
}

/** theme.light / theme.dark 的 key 已经是最终 --ku-<key> 的 kebab-case 后缀，直接拼。 */
function semanticToVarLines(semantic, indent = '  ') {
  return Object.entries(semantic)
    .filter(([key]) => key !== 'primaryScale')
    .map(([key, value]) => `${indent}--ku-${key}: ${value};`)
    .join('\n');
}

function primaryScaleToVarLines(scale, indent = '  ') {
  return Object.entries(scale)
    .map(([step, value]) => `${indent}--ku-primary-${step}: ${value};`)
    .join('\n');
}

function elColorRampToVarLines(name, ramp, indent = '  ') {
  const lines = [`${indent}--el-color-${name}: var(--ku-color-${name}-ramp-base);`];
  for (let i = 1; i <= 9; i += 1) {
    lines.push(`${indent}--el-color-${name}-light-${i}: ${ramp[`light-${i}`]};`);
  }
  lines.push(`${indent}--el-color-${name}-dark-2: ${ramp['dark-2']};`);
  lines.push(`${indent}--el-color-${name}-rgb: ${ramp.rgb};`);
  return lines.join('\n');
}

/** Element Plus 结构类变量：全部转发到 --ku-*，只需要声明一次。 */
const EL_STRUCTURAL_BLOCK = `\
  --el-bg-color: var(--ku-bg-card);
  --el-bg-color-page: var(--ku-bg-page-from);
  --el-bg-color-overlay: var(--ku-bg-card-elevated);
  --el-text-color-primary: var(--ku-text-primary);
  --el-text-color-regular: var(--ku-text-secondary);
  --el-text-color-secondary: var(--ku-text-placeholder);
  --el-text-color-placeholder: var(--ku-text-placeholder);
  --el-text-color-disabled: var(--ku-text-disabled);
  --el-border-color: var(--ku-border-default);
  --el-border-color-light: var(--ku-border-light);
  --el-border-color-lighter: var(--ku-border-light);
  --el-border-color-extra-light: var(--ku-border-light);
  --el-border-color-hover: var(--ku-border-hover);
  /* 中性填充是内容区浅底，不能用侧栏：侧栏是饰带，深色侧栏会让文字按钮 / 表格 hover 字色消失 */
  --el-fill-color: var(--ku-table-header-bg);
  --el-fill-color-light: var(--ku-table-stripe-bg);
  --el-fill-color-lighter: var(--ku-bg-card);
  --el-fill-color-blank: var(--el-bg-color);
  --el-box-shadow: var(--ku-shadow-modal);
  --el-box-shadow-light: var(--ku-shadow-dropdown);
  --el-box-shadow-base: var(--ku-shadow-dropdown);
  /* v-loading 用浅色磨砂；弹层遮罩走 --el-overlay-color → --ku-bg-overlay */
  --el-mask-color: var(--ku-loading-bg);
  --el-mask-color-extra-light: var(--ku-loading-bg);

  --el-menu-bg-color: transparent;
  --el-menu-text-color: var(--ku-text-secondary);
  --el-menu-active-color: var(--ku-color-primary-hover);
  --el-menu-hover-bg-color: var(--ku-bg-hover);
  --el-menu-border-color: transparent;
  --el-menu-item-height: 48px;

  --el-table-bg-color: var(--ku-bg-card);
  --el-table-tr-bg-color: var(--ku-bg-card);
  --el-table-header-bg-color: var(--ku-table-header-bg);
  --el-table-row-hover-bg-color: var(--ku-bg-hover);
  --el-table-border-color: var(--ku-border-light);
  --el-table-header-text-color: var(--ku-text-secondary);

  --el-input-bg-color: var(--ku-bg-input);
  --el-input-border-color: var(--ku-border-default);
  --el-input-hover-border-color: var(--ku-border-hover);
  --el-input-focus-border-color: var(--ku-border-focus);
  --el-input-text-color: var(--ku-text-primary);
  --el-input-placeholder-color: var(--ku-text-placeholder);

  --el-card-bg-color: var(--ku-bg-card);
  --el-card-border-color: var(--ku-border-light);

  --el-tag-bg-color: var(--ku-bg-tag);
  --el-tag-border-color: var(--ku-primary-200);
  --el-tag-text-color: var(--ku-color-primary-hover);

  --el-dialog-bg-color: var(--ku-bg-card);
  --el-overlay-color: var(--ku-bg-overlay);
  --el-overlay-color-lighter: var(--ku-bg-overlay);

  --el-pagination-bg-color: var(--ku-bg-card);
  --el-pagination-button-bg-color: var(--ku-bg-tag);

  --el-switch-on-color: var(--ku-color-primary);
  --el-switch-off-color: var(--ku-border-default);
`.trimEnd();

const COLOR_FAMILIES = ['primary', 'success', 'warning', 'danger', 'info'];

function resolveBase(theme, mode, family) {
  const key = `color-${family}`;
  if (mode === 'dark' && theme.dark[key] !== undefined) return theme.dark[key];
  return theme.light[key];
}

function buildRampBlock(theme, mode) {
  const lines = COLOR_FAMILIES.map((family) => {
    const base = resolveBase(theme, mode, family);
    const ramp = buildElRamp(base, { dark: mode === 'dark' });
    const block = [elColorRampToVarLines(family, ramp)];
    if (family === 'danger') {
      // Element Plus 同时使用 danger / error 两个别名，值完全一致。
      block.push(elColorRampToVarLines('error', ramp));
    }
    return block.join('\n');
  });
  return lines.join('\n\n');
}

function buildRampBaseVars(theme, mode) {
  return COLOR_FAMILIES.map((family) => {
    const base = resolveBase(theme, mode, family);
    const alias = family === 'danger' ? ['danger', 'error'] : [family];
    return alias.map((name) => `  --ku-color-${name}-ramp-base: ${base};`).join('\n');
  }).join('\n');
}

/**
 * success/warning/danger 的「深一档」（按钮 hover 底色、Tag 文字色），primary
 * 已经有手写的 --ku-primary-600，这里只补状态色，且不手写第二套色板：
 * light 模式往黑混深一点，dark 模式往白混浅一点（同 --ku-color-primary-hover
 * 在 dark 下变浅的思路一致）。
 */
const HOVER_SHADE_FAMILIES = ['success', 'warning', 'danger'];

function buildStatusHoverVars(theme, mode) {
  return HOVER_SHADE_FAMILIES.map((family) => {
    const base = resolveBase(theme, mode, family);
    const value = mode === 'dark' ? tint(base, 0.15) : shade(base, 0.15);
    return `  --ku-${family}-600: ${value};`;
  }).join('\n');
}

function buildScrollbarAndSelectionRules() {
  return `
::-webkit-scrollbar {
  width: var(--ku-scrollbar-width);
  height: var(--ku-scrollbar-width);
}

::-webkit-scrollbar-track {
  background: var(--ku-scrollbar-track);
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb {
  background-color: var(--ku-scrollbar-thumb);
  border-radius: 9999px;
  border: 1px solid var(--ku-scrollbar-track);
}

::-webkit-scrollbar-thumb:hover {
  background-color: var(--ku-scrollbar-thumb-hover);
}

::-webkit-scrollbar-corner {
  background: var(--ku-scrollbar-track);
}

::selection {
  background: var(--ku-selection-bg);
  color: var(--ku-selection-text);
}

::-moz-selection {
  background: var(--ku-selection-bg);
  color: var(--ku-selection-text);
}
`.trim();
}

function buildThemeCss(theme, { baseTokens, elBaseCss }) {
  const rootLines = [
    toVarLines('ku', baseTokens),
    '',
    `  /* ---- ${theme.label} · 品牌语义色（Light） ---- */`,
    primaryScaleToVarLines(theme.light.primaryScale),
    semanticToVarLines(theme.light),
    `  --ku-bg-page: var(--ku-bg-page-from);`,
    `  --ku-bg-page-gradient: linear-gradient(135deg, var(--ku-bg-page-from) 0%, var(--ku-bg-page-to) 100%);`,
    `  --ku-scrollbar-width: ${theme.layout.scrollbarWidth};`,
    `  --ku-layout-aside-width: ${theme.layout.asideWidth};`,
    '',
    `  /* ---- Element Plus 桥接（结构类，转发到 --ku-*） ---- */`,
    EL_STRUCTURAL_BLOCK,
    '',
    '',
    `  /* ---- 状态色深一档（按钮 hover / Tag 文字，由品牌基色现算） ---- */`,
    buildStatusHoverVars(theme, 'light'),
    '',
    `  /* ---- Element Plus 桥接（色阶，由品牌基色现算） ---- */`,
    buildRampBaseVars(theme, 'light'),
    buildRampBlock(theme, 'light'),
  ].join('\n');

  const darkLines = [
    '  color-scheme: dark;',
    '',
    `  /* ---- ${theme.label} · 品牌语义色（Dark 覆写） ---- */`,
    semanticToVarLines(theme.dark),
    '',
    `  /* ---- 状态色深一档（Dark 覆写，由品牌基色现算） ---- */`,
    buildStatusHoverVars(theme, 'dark'),
    '',
    `  /* ---- Element Plus 桥接（色阶，Dark 覆写） ---- */`,
    buildRampBaseVars(theme, 'dark'),
    buildRampBlock(theme, 'dark'),
  ].join('\n');

  return `/*
 * @ku-utils/skin — ${theme.id} (${theme.label})
 * 由 scripts/generate.mjs 生成，请勿手改；改 src/themes/${theme.id}.js 后重新 build。
 * ${theme.description}
 */

${elBaseCss.trim()}

:root {
${rootLines}
}

${buildScrollbarAndSelectionRules()}

html.dark {
${darkLines}
}
`;
}

async function loadThemes() {
  const themes = [];
  for (const id of THEME_FILES) {
    const mod = await import(resolve(srcDir, 'themes', `${id}.js`));
    themes.push(mod.default);
  }
  return themes;
}

async function build() {
  mkdirSync(distDir, { recursive: true });

  const { default: baseTokens } = await import(resolve(srcDir, 'base-tokens.js'));
  const elBaseCss = readFileSync(resolve(srcDir, 'el-base.css'), 'utf-8');
  const themes = await loadThemes();

  for (const theme of themes) {
    const css = buildThemeCss(theme, { baseTokens, elBaseCss });
    writeFileSync(resolve(distDir, `${theme.id}.css`), css);
    if (theme.id === DEFAULT_THEME) {
      writeFileSync(resolve(distDir, 'index.css'), css);
    }
  }

  const baseOnlyCss = `${elBaseCss.trim()}\n\n:root {\n${toVarLines('ku', baseTokens)}\n}\n`;
  writeFileSync(resolve(distDir, 'base.css'), baseOnlyCss);

  // eslint-disable-next-line no-console
  console.log(`@ku-utils/skin built: ${themes.map((t) => t.id).join(', ')}`);
}

function startWatch() {
  build().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
  watch(srcDir, { recursive: true }, (_eventType, filename) => {
    if (filename) {
      console.warn(`[watch] ${filename} changed, rebuilding...`);
    }
    build().catch(console.error);
  });
  console.warn(`Watching ${srcDir} for changes...`);
}

if (watchMode) {
  startWatch();
} else {
  build().catch((err) => {
    console.error(err);
    process.exitCode = 1;
  });
}
