#!/usr/bin/env node
/**
 * 构建期把 ng-zorro-antd 的 less 主题编译并换皮成 tome（`--ku-*`），产物：
 * src/assets/styles/generated/ng-zorro-ku.css（gitignore，predev / prebuild 生成）。
 *
 * 1. 尺寸 / 圆角 / 间距：`ng-zorro-antd.variable.less` + `modifyVars`（官方定制入口），
 *    取值与 kr `antdTheme.ts` 的组件 token 一一对应（均对齐 kv3 Element Plus）。
 * 2. 颜色：less 产物里中性色是定值（#fff / rgba(0,0,0,.85) …），按「属性语境 + 字面量」映射到 `--ku-*`；
 *    品牌 / 状态色走 variable 主题的 `--ant-*` 再桥到 `--ku-*`，明暗由 `html.dark` 的 `--ku-*` 联动。
 * less 变量表达不了的细节（选项内距、头尾间距等）在 `zorro-ku-bridge.scss`。
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APP_ROOT = resolve(__dirname, '..')
const OUT_FILE = resolve(APP_ROOT, 'src/assets/styles/generated/ng-zorro-ku.css')

const require = createRequire(import.meta.url)
const less = require('less')
const zorroRoot = dirname(require.resolve('ng-zorro-antd/package.json'))
const entry = resolve(zorroRoot, 'ng-zorro-antd.variable.less')

/** 对齐 kr `antdTheme.ts`（→ kv3 Element Plus）；颜色不在这里改，交给下方 `--ku-*` 映射 */
const MODIFY_VARS = {
  // skin el-base.css：--el-border-radius-base 8 / small 4；el 控件聚焦只描边、按钮无投影
  'border-radius-base': '8px',
  'border-radius-sm': '4px',
  'outline-width': '0',
  'outline-blur-size': '0',
  // el-button：默认态次级色、字重 500；small 12px / 11 内距 / 7 圆角
  'btn-default-color': '@text-color-secondary',
  'btn-font-weight': '500',
  'btn-font-size-sm': '12px',
  'btn-padding-horizontal-sm': '11px',
  'btn-border-radius-sm': '7px',
  'btn-shadow': 'none',
  'btn-primary-shadow': 'none',
  'btn-text-shadow': 'none',
  // el-card：54 头高、20 内距、14px 常规字重标题、4px 圆角
  'card-head-height': '54px',
  'card-head-padding': '20px',
  'card-head-font-size': '14px',
  'card-padding-base': '20px',
  'card-radius': '4px',
  // el-card 无尺寸档：small 与默认同值（kr headerHeightSM / bodyPaddingSM）
  'card-head-height-sm': '54px',
  'card-head-padding-sm': '20px',
  'card-head-font-size-sm': '14px',
  'card-padding-base-sm': '20px',
  // el-table：次级色正文、卡片底表头、悬停 hover 底、选中 primary-bg、8px 单元格
  'table-header-bg': '@component-background',
  'table-header-cell-split-color': 'transparent',
  'table-row-hover-bg': '@background-color-base',
  'table-padding-vertical-md': '8px',
  'table-padding-horizontal-md': '8px',
  // el-dialog：16 内边距、头尾无分隔线、18/24 标题
  'modal-header-padding': '16px 16px 0',
  'modal-body-padding': '16px',
  'modal-footer-padding-vertical': '0',
  'modal-footer-padding-horizontal': '16px',
  'modal-header-border-width': '0',
  'modal-footer-border-width': '0',
  'modal-header-title-font-size': '18px',
  'modal-header-title-line-height': '24px',
  // el-select-dropdown：34 高选项、选中品牌色粗体无底
  'select-dropdown-height': '34px',
  'select-dropdown-line-height': '34px',
  'select-item-selected-color': '@primary-color',
  'select-item-selected-font-weight': '700',
  'select-item-selected-bg': 'transparent',
  // el-checkbox 14px；el-form 项间距 18、标签次级色
  'checkbox-size': '14px',
  'form-item-margin-bottom': '18px',
  'label-color': '@text-color-secondary',
  // el-alert：8/16 内边距
  'alert-padding-vertical': '8px',
  'alert-padding-horizontal': '16px',
  // el-drawer：标题 24 行高；页脚不随 modal 归零，保持 8/16
  'drawer-title-line-height': '24px',
  'drawer-footer-padding-vertical': '8px',
  'drawer-footer-padding-horizontal': '16px',
  // antd v5 Tag：borderRadiusSM
  'tag-border-radius': '@border-radius-sm',
}

const { css: source } = await less.render(readFileSync(entry, 'utf-8'), {
  filename: entry,
  javascriptEnabled: true,
  modifyVars: MODIFY_VARS,
})

const mix = (color, percent, base = 'transparent') =>
  `color-mix(in srgb, ${color} ${percent}%, ${base})`

/** `--ant-*`（variable 主题）→ `--ku-*` */
const ANT_VARIABLES = {
  'primary-color': 'var(--ku-color-primary)',
  'primary-color-hover': 'var(--ku-color-primary-hover)',
  'primary-color-active': 'var(--ku-primary-700)',
  'primary-color-outline': mix('var(--ku-color-primary)', 20),
  'primary-1': 'var(--ku-color-primary-bg)',
  'primary-2': 'var(--ku-primary-100)',
  'primary-3': 'var(--ku-primary-200)',
  'primary-4': 'var(--ku-primary-300)',
  'primary-5': 'var(--ku-color-primary-hover)',
  'primary-6': 'var(--ku-color-primary)',
  'primary-7': 'var(--ku-primary-700)',
  'primary-color-deprecated-pure': '',
  'primary-color-deprecated-l-35': 'var(--ku-primary-200)',
  'primary-color-deprecated-l-20': 'var(--ku-primary-300)',
  'primary-color-deprecated-t-20': 'var(--ku-primary-400)',
  'primary-color-deprecated-t-50': 'var(--ku-primary-300)',
  'primary-color-deprecated-f-12': mix('var(--ku-color-primary)', 12),
  'primary-color-active-deprecated-f-30': mix('var(--ku-color-primary-bg)', 30),
  'primary-color-active-deprecated-d-02': 'var(--ku-color-primary-bg)',
  'success-color': 'var(--ku-color-success)',
  'success-color-hover': mix('var(--ku-color-success)', 80, 'white'),
  'success-color-active': 'var(--ku-success-600)',
  'success-color-outline': mix('var(--ku-color-success)', 20),
  'success-color-deprecated-bg': 'var(--ku-color-success-bg)',
  'success-color-deprecated-border': 'var(--ku-color-success-border)',
  'error-color': 'var(--ku-color-danger)',
  'error-color-hover': mix('var(--ku-color-danger)', 80, 'white'),
  'error-color-active': 'var(--ku-danger-600)',
  'error-color-outline': mix('var(--ku-color-danger)', 20),
  'error-color-deprecated-bg': 'var(--ku-color-danger-bg)',
  'error-color-deprecated-border': 'var(--ku-color-danger-border)',
  'warning-color': 'var(--ku-color-warning)',
  'warning-color-hover': mix('var(--ku-color-warning)', 80, 'white'),
  'warning-color-active': 'var(--ku-warning-600)',
  'warning-color-outline': mix('var(--ku-color-warning)', 20),
  'warning-color-deprecated-bg': 'var(--ku-color-warning-bg)',
  'warning-color-deprecated-border': 'var(--ku-color-warning-border)',
  'info-color': 'var(--ku-color-info)',
  'info-color-deprecated-bg': 'var(--ku-color-info-bg)',
  'info-color-deprecated-border': 'var(--ku-color-info-border)',
}

const norm = (literal) => literal.toLowerCase().replace(/\s+/g, '')

/** 文字类属性（color / fill / stroke …） */
const TEXT_COLORS = {
  'rgba(0,0,0,0.85)': 'var(--ku-text-primary)',
  'rgba(0,0,0,0.88)': 'var(--ku-text-primary)',
  '#262626': 'var(--ku-text-primary)',
  'rgba(0,0,0,0.75)': 'var(--ku-text-secondary)',
  'rgba(0,0,0,0.65)': 'var(--ku-text-secondary)',
  'rgba(0,0,0,0.45)': 'var(--ku-text-secondary)',
  '#8c8c8c': 'var(--ku-text-secondary)',
  'rgba(0,0,0,0.25)': 'var(--ku-text-disabled)',
  '#bfbfbf': 'var(--ku-text-placeholder)',
  '#a6a6a6': 'var(--ku-text-placeholder)',
}

/** 背景类属性 */
const BG_COLORS = {
  '#fff': 'var(--ku-bg-card)',
  '#ffffff': 'var(--ku-bg-card)',
  '#fafafa': 'var(--ku-table-header-bg)',
  '#f5f5f5': 'var(--ku-bg-hover)',
  '#f0f0f0': 'var(--ku-bg-active)',
  '#f0f2f5': 'var(--ku-bg-page)',
  'rgba(0,0,0,0.018)': 'var(--ku-table-stripe-bg)',
  'rgba(0,0,0,0.028)': 'var(--ku-bg-hover)',
  'rgba(0,0,0,0.04)': 'var(--ku-bg-hover)',
  'rgba(0,0,0,0.06)': 'var(--ku-bg-hover)',
  'rgba(0,0,0,0.75)': 'var(--ku-bg-tooltip)',
  'rgba(0,0,0,0.45)': 'var(--ku-bg-overlay)',
  'rgba(190,190,190,0.2)': 'var(--ku-bg-hover)',
}

/** 边框 / 描边类属性 */
const BORDER_COLORS = {
  '#d9d9d9': 'var(--ku-border-default)',
  '#f0f0f0': 'var(--ku-border-light)',
  'rgba(0,0,0,0.06)': 'var(--ku-border-light)',
  'rgba(0,0,0,0.25)': 'var(--ku-border-hover)',
  '#f5f5f5': 'var(--ku-border-light)',
  '#fff': 'var(--ku-bg-card)',
}

const DROPDOWN_SHADOW =
  '0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05)'

const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)/g

function pickTable(prop) {
  if (prop === 'color' || prop === 'fill' || prop === 'stroke' || prop.endsWith('decoration-color')) {
    return TEXT_COLORS
  }
  if (prop === 'background' || prop === 'background-color' || prop.endsWith('-background-color')) {
    return BG_COLORS
  }
  if (prop.startsWith('border') || prop.startsWith('outline') || prop === 'scrollbar-color') {
    return BORDER_COLORS
  }
  return null
}

/** 前景白（开关手柄、暗色菜单箭头等）不是面板底色，保留字面量 */
const KEEP_LITERAL_SELECTOR = /ant-switch-handle|-dark\b/

/** 按选择器定点覆写：通用映射表表达不了的语义色 */
const SELECTOR_OVERRIDES = [
  { selector: /^\.ant-switch$/, prop: 'background-color', value: mix('var(--ku-text-primary)', 25) },
  // antd v5 Tag defaultBg = colorFillQuaternary 叠在卡片底上（不是表头色）
  { selector: /^\.ant-tag$/, prop: 'background', value: mix('var(--ku-text-primary)', 3, 'var(--ku-bg-card)') },
]

let replaced = 0

function rewriteDeclaration(selector, prop, value) {
  if (KEEP_LITERAL_SELECTOR.test(selector)) return value
  const override = SELECTOR_OVERRIDES.find((o) => o.prop === prop && o.selector.test(selector))
  if (override) {
    replaced += 1
    return override.value
  }
  if (prop === 'box-shadow' && value.trim() === DROPDOWN_SHADOW) {
    replaced += 1
    return 'var(--ku-shadow-dropdown)'
  }
  const table = pickTable(prop)
  if (!table) return value
  return value.replace(COLOR_LITERAL, (literal) => {
    const mapped = table[norm(literal)]
    if (!mapped) return literal
    replaced += 1
    return mapped
  })
}

const rootVars = Object.entries(ANT_VARIABLES)
  .map(([name, value]) => `  --ant-${name}: ${value};`)
  .join('\n')

let css = source.replace(/^html\s*\{[^}]*--ant-primary-color:[^}]*\}/m, `html {\n${rootVars}\n}`)

css = css.replace(/([^{}]+)\{([^{}]*)\}/g, (_rule, rawSelector, body) => {
  const selector = rawSelector.trim()
  const nextBody = body.replace(/([{;\s])([a-z-]+)\s*:\s*([^;{}]+)(?=;|$)/g, (whole, lead, prop, value) => {
    if (prop.startsWith('--ant-')) return whole
    return `${lead}${prop}: ${rewriteDeclaration(selector, prop, value)}`
  })
  return `${rawSelector}{${nextBody}}`
})

const header =
  '/* 由 scripts/generate-zorro-theme.mjs 生成，请勿手改。源：ng-zorro-antd.variable.css → tome(--ku-*) */\n'

mkdirSync(dirname(OUT_FILE), { recursive: true })
writeFileSync(OUT_FILE, header + css, 'utf-8')
console.log(`[generate-zorro-theme] → ${OUT_FILE}（替换 ${replaced} 处中性色）`)
