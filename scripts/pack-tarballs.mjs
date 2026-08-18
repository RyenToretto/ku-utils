#!/usr/bin/env node
/**
 * pack-tarballs.mjs
 *
 * 为 ku-utils 所有可发布包打 tarball，输出到 <root>/tarballs/。
 * 每次执行前清空旧 .tgz，保证目录内每个包只保留当前版本最新产物。
 *
 * 用法：
 *   pnpm pack:tarballs:only   # 只打包，不重新 build
 *   pnpm pack:tarballs        # build + 打包（见 package.json scripts）
 *
 * 外包项目离线使用方式见 tarballs/README.md（每次执行后自动生成）。
 */

import { readFileSync, readdirSync, mkdirSync, rmSync, existsSync, writeFileSync } from 'node:fs'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')
const PACKAGES_DIR = join(ROOT, 'packages')
const TARBALLS_DIR = join(ROOT, 'tarballs')

// ──────────────────────────────────────────────
// 1. 扫描所有 packages/* 下的 package.json
// ──────────────────────────────────────────────
const pkgDirs = readdirSync(PACKAGES_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => join(PACKAGES_DIR, e.name))

const packages = pkgDirs
  .map((dir) => {
    const pkgJsonPath = join(dir, 'package.json')
    if (!existsSync(pkgJsonPath)) return null
    const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'))
    // 跳过私有包和非 @ku-utils scope
    if (pkg.private) return null
    if (!pkg.name?.startsWith('@ku-utils/')) return null
    return { name: pkg.name, version: pkg.version, dir }
  })
  .filter(Boolean)

if (packages.length === 0) {
  console.error('[pack-tarballs] 未找到可发布包，退出。')
  process.exit(1)
}

console.log(`[pack-tarballs] 共找到 ${packages.length} 个可发布包：`)
packages.forEach((p) => console.log(`  ${p.name}@${p.version}`))

// ──────────────────────────────────────────────
// 2. 清理 tarballs/ 中全部旧 .tgz
// ──────────────────────────────────────────────
mkdirSync(TARBALLS_DIR, { recursive: true })
const existing = readdirSync(TARBALLS_DIR).filter((f) => f.endsWith('.tgz'))
if (existing.length > 0) {
  console.log(`\n[pack-tarballs] 清理旧 tarballs（${existing.length} 个）...`)
  existing.forEach((f) => {
    rmSync(join(TARBALLS_DIR, f))
    console.log(`  deleted  ${f}`)
  })
}

// ──────────────────────────────────────────────
// 3. 逐包执行 pnpm pack
// ──────────────────────────────────────────────
console.log('\n[pack-tarballs] 开始打包...\n')

const results = []
let failed = 0

for (const pkg of packages) {
  const label = `${pkg.name}@${pkg.version}`
  process.stdout.write(`  packing  ${label} ... `)

  const res = spawnSync(
    'pnpm',
    ['pack', '--pack-destination', TARBALLS_DIR],
    { cwd: pkg.dir, encoding: 'utf8' }
  )

  if (res.status !== 0) {
    console.log('FAILED')
    console.error(res.stderr || res.stdout)
    failed++
    results.push({ ...pkg, tgz: null, ok: false })
    continue
  }

  // pnpm pack 输出 tarball 绝对路径（最后一行），取 basename
  const lines = (res.stdout || '').trim().split('\n').filter(Boolean)
  const tgzAbsPath = lines.at(-1)?.trim()
  const tgzName = tgzAbsPath ? tgzAbsPath.split('/').at(-1) : null
  console.log(`OK  →  ${tgzName ?? '?'}`)
  results.push({ ...pkg, tgz: tgzName ?? null, ok: true })
}

// ──────────────────────────────────────────────
// 4. 生成 tarballs/README.md
// ──────────────────────────────────────────────
const successResults = results.filter((r) => r.ok && r.tgz)
const reportStandaloneVersion =
  packages.find((p) => p.name === '@ku-utils/report-standalone')?.version ?? '<version>'
const landingReportStandaloneVersion =
  packages.find((p) => p.name === '@ku-utils/landing-report-standalone')?.version ??
  '<version>'

let readmeContent = `# @ku-utils/* 离线 tarball 包

> 供无法访问 npm、需要离线安装的项目使用（如内网、外包交付）。  
> 每次执行 \`pnpm pack:tarballs\` 后自动更新，每个包仅保留最新版本。

## Report 单包离线交付

只需要埋点 SDK 时，优先交付
\`ku-utils-report-standalone-${reportStandaloneVersion}.tgz\`。
该包已内联 \`@ku-utils/report\` 和 \`@ku-utils/utils\`，消费方不需要安装其他 tarball：

\`\`\`bash
pnpm add ./vendor/ku-utils/ku-utils-report-standalone-${reportStandaloneVersion}.tgz
\`\`\`

## Landing Report 单包离线交付

只需要落地页埋点 SDK 时，优先交付
\`ku-utils-landing-report-standalone-${landingReportStandaloneVersion}.tgz\`。
该包已内联 \`@ku-utils/landing-report\`、\`@ku-utils/report\` 和
\`@ku-utils/utils\`，消费方不需要安装其他 tarball：

\`\`\`bash
pnpm add ./vendor/ku-utils/ku-utils-landing-report-standalone-${landingReportStandaloneVersion}.tgz
\`\`\`

## 安装方式

将 \`tarballs/\` 目录复制到目标项目，按需在 \`package.json\` 中用 \`file:\` 路径声明依赖：

\`\`\`jsonc
{
  "dependencies": {
${successResults
  .map((r) => `    "${r.name}": "file:./vendor/ku-utils/${r.tgz}"`)
  .join(',\n')}
  }
}
\`\`\`

> 建议将 tarball 放到目标项目的 \`vendor/ku-utils/\` 目录，并提交到 git，确保团队成员无需额外配置即可安装。

## 包列表

| 包名 | 版本 | Tarball 文件 |
|------|------|-------------|
${successResults.map((r) => `| \`${r.name}\` | \`${r.version}\` | \`${r.tgz}\` |`).join('\n')}

## 注意事项

- \`@ku-utils/report-standalone\` 和 \`@ku-utils/landing-report-standalone\` 是零运行时依赖的离线交付包，只需单独引入对应包。
- 标准版 \`@ku-utils/report\` 和 \`@ku-utils/landing-report\` 仍有内部依赖；离线交付时不要只提供标准版 tarball。
- \`@ku-utils/hooks\`、\`@ku-utils/marketing\`、\`@ku-utils/nuxt-module\` 等标准包仍依赖 \`@ku-utils/utils\`，请务必同时引入。
- 配置包（\`eslint-config\`、\`prettier-config\`、\`tsconfig\`、\`stylelint-config\`）不含运行时代码，只需项目开发依赖引入时才需要。
- tarball 安装与从 npm 安装行为一致。仅 custom-columns / v2-custom-columns 带 Cursor rules/skills 的 \`postinstall\`，\`CI=1\` 时不会拷贝。

## 更新

当 ku-utils 发布新版时，在 ku-utils 仓库根目录执行：

\`\`\`bash
pnpm pack:tarballs
\`\`\`

将新生成的 \`tarballs/\` 目录拷贝给外包同学替换旧版即可。
`

writeFileSync(join(TARBALLS_DIR, 'README.md'), readmeContent, 'utf8')
console.log('\n[pack-tarballs] 已生成 tarballs/README.md')

// ──────────────────────────────────────────────
// 5. 汇总
// ──────────────────────────────────────────────
console.log(`\n[pack-tarballs] 完成：${successResults.length} 成功 / ${failed} 失败\n`)
if (failed > 0) {
  console.error('[pack-tarballs] 以下包打包失败：')
  results.filter((r) => !r.ok).forEach((r) => console.error(`  ${r.name}`))
  process.exit(1)
}
