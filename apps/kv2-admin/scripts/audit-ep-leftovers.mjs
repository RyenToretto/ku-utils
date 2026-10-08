#!/usr/bin/env node
/**
 * 审计 kv2 源码里「从 kv3 搬来、Element UI 不存在」的写法（照抄即失效）：
 * 1. `.el-*` 类名在 Element UI chalk 里不存在（如 `.el-input__wrapper` / `.el-overlay-dialog`）；
 * 2. `var(--el-*)` 既不在 skin / 生成主题 / 本仓样式里声明（如 EP 才有的 `--el-border`）；
 * 3. 模板里的 EP 专有 prop（如 `show-after` / `teleported`），EU 静默忽略。
 * 有问题即退出 1；`prepare:assets` 之后、提交前跑。
 */

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, extname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const APP_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(import.meta.url)
const chalk = readFileSync(resolve(dirname(require.resolve('element-ui/package.json')), 'lib/theme-chalk/index.css'), 'utf-8')
const skin = readFileSync(require.resolve('@ku-utils/skin'), 'utf-8')

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const p = resolve(dir, name)
    if (statSync(p).isDirectory()) return name === 'generated' ? [] : walk(p)
    return ['.scss', '.css', '.vue', '.ts', '.tsx'].includes(extname(p)) ? [p] : []
  })

const files = walk(resolve(APP_ROOT, 'src'))
const sources = files.map((f) => [f, readFileSync(f, 'utf-8')])

/** 运行时由 Element UI 组件 JS 挂上的类（chalk 里没有选择器，但 DOM 上会出现） */
const RUNTIME_CLASSES = new Set(['el-popper', 'el-icon-loading', 'el-select-dropdown', 'el-scrollbar__view', 'el-form', 'el-table__row'])
/** 本仓自定义、以 el- 开头的类（不是 Element 的） */
const APP_CLASSES = new Set()
/** SCSS 插值拼出来的变量前缀（如 `--el-color-#{$type}`） */
const INTERPOLATED = /-$/
/** EP 专有 prop → EU 等价写法（EU 对未知 prop 静默忽略，搬过来不报错也不生效） */
const EP_ONLY_PROPS = {
  'show-after': 'open-delay',
  'hide-after': 'close-delay',
  'show-arrow': 'visible-arrow',
  teleported: 'append-to-body / popper-append-to-body',
  'align-center': '（EU 无；全局 .el-dialog__wrapper 已居中）',
  'fit-input-width': '（EU 无）',
  'collapse-tags-tooltip': '（EU 无）',
  'max-collapse-tags': '（EU 无）',
  'value-on-clear': '（EU 无）',
  'empty-values': '（EU 无）',
}
const EP_ONLY_PROP_RE = new RegExp(`<el-[\\w-]+[^>]*?\\s:?(${Object.keys(EP_ONLY_PROPS).join('|')})(?=[\\s=/>])`, 'g')

const chalkClasses = new Set(chalk.match(/\.el-[\w-]+/g)?.map((c) => c.slice(1)))
const declared = new Set(
  [skin, ...sources.map(([, s]) => s)].flatMap((s) => s.match(/--el-[\w-]+(?=\s*:)/g) ?? []),
)
const generated = readFileSync(resolve(APP_ROOT, 'src/assets/styles/generated/element-ui-ku.css'), 'utf-8')
for (const v of generated.match(/--el-[\w-]+(?=\s*:)/g) ?? []) declared.add(v)

const problems = []
for (const [file, text] of sources) {
  const styleText = extname(file) === '.vue' ? (text.match(/<style[\s\S]*?<\/style>/g) ?? []).join('\n') : text
  const isStyle = ['.scss', '.css'].includes(extname(file)) || extname(file) === '.vue'
  if (isStyle) {
    for (const m of styleText.matchAll(/\.(el-[\w-]+)/g)) {
      const cls = m[1].replace(/-+$/, '')
      if (chalkClasses.has(cls) || RUNTIME_CLASSES.has(cls) || APP_CLASSES.has(cls)) continue
      problems.push([file, `类名 .${cls} 在 Element UI 不存在`])
    }
  }
  if (extname(file) === '.vue') {
    const template = text.match(/<template>[\s\S]*<\/template>/)?.[0] ?? ''
    for (const m of template.matchAll(EP_ONLY_PROP_RE)) {
      problems.push([file, `EP 专有 prop「${m[1]}」→ ${EP_ONLY_PROPS[m[1]]}`])
    }
  }
  for (const m of text.matchAll(/(,\s*)?var\((--el-[\w-]+)(\s*,)?/g)) {
    // 自身带 fallback，或本身就是外层 var() 的 fallback：不会落空
    if (declared.has(m[2]) || m[1] || m[3] || INTERPOLATED.test(m[2])) continue
    problems.push([file, `变量 ${m[2]} 未声明且无 fallback`])
  }
}

const unique = [...new Map(problems.map((p) => [p.join('|'), p])).values()]
for (const [file, msg] of unique) console.log(`${relative(APP_ROOT, file)}  ${msg}`)
console.log(`[audit-ep-leftovers] ${unique.length} 处`)
process.exit(unique.length ? 1 : 0)
