#!/usr/bin/env node
/**
 * 构建期把 Element UI chalk 换皮成 tome，产物：
 * src/assets/styles/generated/element-ui-ku.css（gitignore，predev / prebuild 生成）。
 *
 * chalk 把颜色编译成定值（#409EFF 及其色阶、#303133 / #DCDFE6 / #FFF …），不读 CSS 变量，
 * 手写覆写层永远补不全（表格边框、radio 悬停、弹层底色……）。这里按「属性语境 + 字面量」
 * 把每一处颜色换成 skin 的 `--el-*` / `--ku-*`，明暗由 `html.dark` 联动：
 * 1. 状态色：Element UI 默认基色往白混 10%~90%（light-1..9）、往黑混 10%（active）→ `--el-color-*` 色阶；
 * 2. 中性色：文字 / 背景 / 边框各一张表，弹层类组件的白底走 overlay 底；
 * 3. 弹层 / 对话框 / 抽屉阴影整值换成 --el-box-shadow*；其余映射不到的字面量必须在 KEEP_LITERALS 里显式登记（细阴影、取色器色带等），否则生成失败。
 * 尺寸 / 圆角等对齐 Element Plus 的结构差异仍在 `element-ui-bridge.scss`。
 */

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APP_ROOT = resolve(__dirname, '..')
const OUT_FILE = resolve(APP_ROOT, 'src/assets/styles/generated/element-ui-ku.css')

const require = createRequire(import.meta.url)
const chalkDir = resolve(dirname(require.resolve('element-ui/package.json')), 'lib/theme-chalk')
const source = readFileSync(resolve(chalkDir, 'index.css'), 'utf-8')

/* ---------------- 状态色色阶 ---------------- */

const FAMILIES = {
  primary: '#409eff',
  success: '#67c23a',
  warning: '#e6a23c',
  danger: '#f56c6c',
  info: '#909399',
}

const hexToRgb = (hex) => {
  const n = Number.parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const toHex = (rgb) => `#${rgb.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')}`
const mixHex = (a, b, weight) => {
  const [x, y] = [hexToRgb(a), hexToRgb(b)]
  return toHex(x.map((v, i) => v * (1 - weight) + y[i] * weight))
}

/** chalk 字面量 → 色阶变量（Element UI 的 hover / active 分别取 light-2 / 往黑 10%，与 EP 同名档位对应） */
const RAMP = new Map()
for (const [family, base] of Object.entries(FAMILIES)) {
  RAMP.set(base, `var(--el-color-${family})`)
  for (let i = 1; i <= 9; i += 1) RAMP.set(mixHex(base, '#ffffff', i / 10), `var(--el-color-${family}-light-${i})`)
  RAMP.set(mixHex(base, '#000000', 0.1), `var(--el-color-${family}-dark-2)`)
}

/* ---------------- 中性色 ---------------- */

/** 文字类属性 */
const TEXT_COLORS = {
  '#303133': 'var(--el-text-color-primary)',
  '#333': 'var(--el-text-color-primary)',
  '#606266': 'var(--el-text-color-regular)',
  '#666': 'var(--el-text-color-regular)',
  '#72767b': 'var(--el-text-color-regular)',
  '#909399': 'var(--el-text-color-secondary)',
  '#8c939d': 'var(--el-text-color-secondary)',
  '#999': 'var(--el-text-color-secondary)',
  '#c0c4cc': 'var(--el-text-color-placeholder)',
  '#bbb': 'var(--el-text-color-placeholder)',
  '#ccc': 'var(--el-text-color-disabled)',
  '#e4e7ed': 'var(--el-text-color-disabled)',
  '#d3dce6': 'var(--el-text-color-placeholder)',
  '#ececec': 'var(--el-border-color-light)',
  '#dcdde0': 'var(--el-border-color)',
  '#fff': 'var(--ku-text-on-primary)',
  white: 'var(--ku-text-on-primary)',
}

/** 背景类属性 */
const BG_COLORS = {
  '#fff': 'var(--el-bg-color)',
  white: 'var(--el-bg-color)',
  '#fbfdff': 'var(--el-bg-color)',
  '#f5f7fa': 'var(--el-fill-color-light)',
  '#fafafa': 'var(--el-fill-color-lighter)',
  '#f2f6fc': 'var(--el-fill-color-light)',
  '#f0f2f5': 'var(--el-fill-color)',
  '#f2f2f2': 'var(--el-fill-color)',
  '#f0f0f0': 'var(--el-fill-color)',
  '#ebeef5': 'var(--el-border-color-lighter)',
  '#e4e7ed': 'var(--el-border-color-light)',
  '#e4e4e4': 'var(--el-border-color-light)',
  '#e6e6e6': 'var(--el-border-color-light)',
  '#dcdfe6': 'var(--el-border-color)',
  '#c0c4cc': 'var(--el-text-color-placeholder)',
  '#b4bccc': 'var(--el-border-color-hover)',
  'rgba(220,223,230,.5)': 'var(--el-border-color-lighter)',
  '#303133': 'var(--ku-bg-tooltip)',
  '#edf2fc': 'var(--el-fill-color-light)',
  '#f2f8fe': 'var(--el-color-primary-light-9)',
  '#f0f7ff': 'var(--el-color-primary-light-9)',
  '#e6f1fe': 'var(--el-color-primary-light-9)',
  'rgba(255,255,255,.9)': 'var(--el-mask-color)',
  'rgba(255,255,255,.7)': 'var(--el-mask-color)',
  'rgba(32,159,255,.06)': 'var(--el-color-primary-light-9)',
  'rgba(144,147,153,.3)': 'color-mix(in srgb, var(--el-text-color-secondary) 30%, transparent)',
  'rgba(144,147,153,.5)': 'color-mix(in srgb, var(--el-text-color-secondary) 50%, transparent)',
}

/** 边框 / 描边类属性 */
const BORDER_COLORS = {
  '#dcdfe6': 'var(--el-border-color)',
  '#dcdcdc': 'var(--el-border-color)',
  '#dcdde0': 'var(--el-border-color)',
  '#d9d9d9': 'var(--el-border-color)',
  '#dfe4ed': 'var(--el-border-color)',
  '#d1dbe5': 'var(--el-border-color)',
  '#d3dce6': 'var(--el-border-color)',
  '#c0ccda': 'var(--el-border-color)',
  '#ccc': 'var(--el-border-color)',
  '#999': 'var(--el-text-color-secondary)',
  '#b4bccc': 'var(--el-border-color-hover)',
  '#c0c4cc': 'var(--el-border-color-hover)',
  '#e4e7ed': 'var(--el-border-color-light)',
  '#e4e4e4': 'var(--el-border-color-light)',
  '#e6e6e6': 'var(--el-border-color-light)',
  '#ececec': 'var(--el-border-color-light)',
  '#ebeef5': 'var(--el-border-color-lighter)',
  '#f2f6fc': 'var(--el-border-color-extra-light)',
  '#f0f0f0': 'var(--el-border-color-extra-light)',
  '#fff': 'var(--el-bg-color)',
  white: 'var(--el-bg-color)',
  '#303133': 'var(--ku-bg-tooltip)',
  '#909399': 'var(--el-text-color-secondary)',
  'rgba(220,223,230,.5)': 'var(--el-border-color-lighter)',
}

/** 弹层类组件：白底取 overlay 底（与 Element Plus --el-bg-color-overlay 一致） */
const OVERLAY_SELECTOR =
  /popper|dropdown|picker-panel|popover|dialog|message-box|notification|el-message\b|cascader-menus|cascader-panel|autocomplete-suggestion|time-panel|drawer|color-dropdown|el-select-dropdown/

/** 明确保留的字面量：阴影、透明、取色器色带 / 预设、#000 遮罩等与皮肤无关的值 */
const KEEP_LITERALS = new Set([
  'transparent',
  'black',
  '#000',
  'rgba(0,0,0,0)',
  'rgba(255,255,255,0)',
  '#ff0',
  '#0f0',
  '#0ff',
  '#00f',
  '#f0f',
  '#ff4d51',
  '#13ce66',
  'rgba(0,0,0,.12)',
  'rgba(0,0,0,.2)',
  'rgba(0,0,0,.3)',
  'rgba(0,0,0,.4)',
  'rgba(0,0,0,.5)',
  'rgba(0,0,0,.6)',
  'rgba(0,0,0,.72)',
  'rgba(0,0,0,.03)',
  'rgba(31,45,61,.11)',
  'rgba(31,45,61,.23)',
  'rgba(255,255,255,.5)',
  'rgba(255,255,255,.35)',
])

/** 字面量在这些选择器里保留：取色器的色相 / 透明度条，图片预览器（明暗下都是深色浮层） */
const KEEP_SELECTOR =
  /el-color-(svpanel|hue-slider|alpha-slider|picker__empty)|el-color-dropdown__main-wrapper|el-image-viewer/

/**
 * 按选择器定点覆写，先于色阶与通用表命中（首条匹配生效）。
 * Element Plus 的组件级变量（--el-input-bg-color 等）在组件选择器上重新声明，默认值就是通用中性色，
 * 所以通用表已与 kv3 一致；这里只放 chalk 与 Element Plus 取值不同、或通用表表达不了的语义。
 */
const SELECTOR_OVERRIDES = [
  // 分页按钮底：chalk 是 info-light-9，Element Plus 是 --el-pagination-button-bg-color: var(--el-fill-color)
  { selector: /el-pagination\.is-background/, prop: /^background(-color)?$/, literal: '#f4f4f5', value: 'var(--el-fill-color)' },
  // 开关圆钮 / 单选圆点 / 勾选对勾与半选横条 / 滑块按钮：Element Plus 明暗下都是 --el-color-white（恒白）
  {
    selector:
      /el-switch__core:after|el-radio__inner::after|el-checkbox__inner::after|is-indeterminate \.el-checkbox__inner::before|^\.el-slider__button$/,
    literal: '#fff',
    value: '#fff',
  },
  // 深色 tooltip：前景用反色文字
  { selector: /is-dark/, prop: /^color$/, literal: '#fff', value: 'var(--ku-text-inverse)' },
  // 弹层遮罩：skin overlay 已含透明度，换掉 chalk 的 #000（opacity .5 在生成末尾改 1）
  { selector: /^\.v-modal$/, prop: /^background$/, literal: '#000', value: 'var(--el-overlay-color)' },
]

/** 整值替换的阴影：弹层 / 对话框 / 抽屉走 skin 的 --el-box-shadow*（明暗各一套），其余细阴影保留 */
const SHADOWS = {
  '0 2px 12px 0 rgba(0,0,0,.1)': 'var(--el-box-shadow-light)',
  '0 2px 4px 0 rgba(0,0,0,.12),0 0 6px 0 rgba(0,0,0,.04)': 'var(--el-box-shadow-light)',
  '0 1px 3px rgba(0,0,0,.3)': 'var(--el-box-shadow)',
  '0 8px 10px -5px rgba(0,0,0,.2),0 16px 24px 2px rgba(0,0,0,.14),0 6px 30px 5px rgba(0,0,0,.12)':
    'var(--el-box-shadow)',
}

const COLOR_LITERAL = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]*\)|\bwhite\b|\bblack\b|\btransparent\b/g
const norm = (literal) => {
  const s = literal.toLowerCase().replace(/\s+/g, '')
  return /^#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3$/.test(s) ? `#${s[1]}${s[3]}${s[5]}` : s
}
const longHex = (literal) =>
  /^#[0-9a-f]{3}$/.test(literal) ? `#${[...literal.slice(1)].map((c) => c + c).join('')}` : literal

function pickTable(prop) {
  if (prop === 'color' || prop === 'fill' || prop === 'stroke' || prop === 'caret-color') return TEXT_COLORS
  if (prop === 'background' || prop === 'background-color') return BG_COLORS
  if (prop.startsWith('border') || prop.startsWith('outline') || prop.endsWith('box-shadow')) return BORDER_COLORS
  return null
}

let replaced = 0
const unmapped = new Map()

function rewriteDeclaration(selector, prop, value) {
  if (KEEP_SELECTOR.test(selector)) return value
  if (prop.endsWith('box-shadow')) {
    const shadow = SHADOWS[value.trim().replace(/\s*,\s*/g, ',')]
    if (shadow) {
      replaced += 1
      return shadow
    }
  }
  return value.replace(COLOR_LITERAL, (literal) => {
    const key = norm(literal)
    const override = SELECTOR_OVERRIDES.find(
      (o) => o.literal === key && o.selector.test(selector) && (!o.prop || o.prop.test(prop)),
    )
    if (override) {
      replaced += 1
      return override.value
    }
    const ramp = RAMP.get(longHex(key))
    if (ramp && !(key === '#909399' && prop === 'color')) {
      replaced += 1
      return ramp
    }
    const table = pickTable(prop)
    let mapped = table?.[key]
    if (mapped === 'var(--el-bg-color)' && OVERLAY_SELECTOR.test(selector)) mapped = 'var(--el-bg-color-overlay)'
    if (mapped) {
      replaced += 1
      return mapped
    }
    if (!KEEP_LITERALS.has(key)) {
      const id = `${prop}: ${key}`
      unmapped.set(id, [...(unmapped.get(id) ?? []), selector.slice(0, 80)])
    }
    return literal
  })
}

let css = source.replace(/([^{}]+)\{([^{}]*)\}/g, (_rule, rawSelector, body) => {
  const selector = rawSelector.trim()
  if (selector.startsWith('@font-face')) return _rule
  const nextBody = body.replace(/([{;\s]|^)([a-z-]+)\s*:\s*([^;{}]+)(?=;|$)/g, (_whole, lead, prop, value) => {
    return `${lead}${prop}:${rewriteDeclaration(selector, prop, value)}`
  })
  return `${rawSelector}{${nextBody}}`
})

const VMODAL = /(\.v-modal\{[^}]*?)opacity:\.5;/
if (!VMODAL.test(css)) {
  console.error('[generate-element-theme] 未找到 .v-modal 的 opacity:.5，chalk 结构变了，请核对遮罩写法')
  process.exit(1)
}
css = css.replace(VMODAL, '$1opacity:1;')

const fontsRel = relative(dirname(OUT_FILE), resolve(APP_ROOT, 'node_modules/element-ui/lib/theme-chalk/fonts'))
css = css.replace(/url\(fonts\//g, `url(${fontsRel}/`)

if (unmapped.size) {
  for (const [id, selectors] of unmapped) {
    console.error(`  ${id}  ← ${[...new Set(selectors)].slice(0, 3).join(' | ')}`)
  }
  console.error(`[generate-element-theme] ${unmapped.size} 个颜色字面量未映射，请补进映射表或 KEEP_LITERALS`)
  process.exit(1)
}

const header =
  '/* 由 scripts/generate-element-theme.mjs 生成，请勿手改。源：element-ui/lib/theme-chalk/index.css → tome(--el-* / --ku-*) */\n'

mkdirSync(dirname(OUT_FILE), { recursive: true })
writeFileSync(OUT_FILE, header + css, 'utf-8')
console.log(`[generate-element-theme] → ${relative(APP_ROOT, OUT_FILE)}（替换 ${replaced} 处颜色）`)
