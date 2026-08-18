#!/usr/bin/env node
/**
 * @ku-utils/v2-custom-columns postinstall
 *
 * 将包内的 Cursor rules/skills 复制到业务项目的 .cursor/ 目录。
 * - CI 环境跳过（process.env.CI）
 * - 已存在的文件不覆盖（幂等）
 * - 在 ku-utils monorepo 内部执行时跳过（避免污染 monorepo 自身）
 */
const fs = require('fs')
const path = require('path')

if (process.env.CI) process.exit(0)

// INIT_CWD: npm/pnpm 安装命令发起的工作目录（业务项目根）
// 若无 INIT_CWD（如直接运行脚本），回退到 4 级目录上溯
const projectRoot =
  process.env.INIT_CWD || path.resolve(__dirname, '../../../../')

// 安全检查：找到 package.json 才继续
const projectPkgPath = path.join(projectRoot, 'package.json')
if (!fs.existsSync(projectPkgPath)) {
  process.exit(0)
}

const projectPkg = JSON.parse(fs.readFileSync(projectPkgPath, 'utf-8'))

// 在 ku-utils monorepo 内部时跳过
if (projectPkg.name === 'ku-utils') {
  process.exit(0)
}

const pkgRoot = path.resolve(__dirname, '..')

function copyIfNotExists(src, dest) {
  if (fs.existsSync(dest)) return
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
  const rel = path.relative(projectRoot, dest)
  console.log(`[v2-custom-columns] ✅ 已安装: ${rel}`)
}

// ── 安装 Cursor Rules ────────────────────────────────────────────────────────
const rulesDir = path.join(pkgRoot, 'rules')
const targetRulesDir = path.join(projectRoot, '.cursor', 'rules')

try {
  for (const file of fs.readdirSync(rulesDir)) {
    if (!file.endsWith('.mdc')) continue
    copyIfNotExists(
      path.join(rulesDir, file),
      path.join(targetRulesDir, file)
    )
  }
} catch (e) {
  // rules 目录不存在时静默跳过
}

// ── 安装 Cursor Skills ───────────────────────────────────────────────────────
const skillsDir = path.join(pkgRoot, 'skills', 'v2-custom-columns')
const targetSkillsDir = path.join(projectRoot, '.cursor', 'skills', 'v2-custom-columns')

try {
  copyIfNotExists(
    path.join(skillsDir, 'SKILL.md'),
    path.join(targetSkillsDir, 'SKILL.md')
  )
} catch (e) {
  // skills 目录不存在时静默跳过
}
