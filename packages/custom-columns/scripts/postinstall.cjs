#!/usr/bin/env node
/**
 * @ku-utils/custom-columns postinstall
 *
 * 将包内的 Cursor rules/skills 复制到业务项目的 .cursor/ 目录。
 * - CI 环境跳过（process.env.CI）
 * - 已存在的文件不覆盖（幂等）
 * - 在 ku-utils monorepo 内部执行时跳过（避免污染 monorepo 自身）
 */
const fs = require('fs')
const path = require('path')

if (process.env.CI) process.exit(0)

const projectRoot = process.env.INIT_CWD || path.resolve(__dirname, '../../../../')

const projectPkgPath = path.join(projectRoot, 'package.json')
if (!fs.existsSync(projectPkgPath)) {
  process.exit(0)
}

const projectPkg = JSON.parse(fs.readFileSync(projectPkgPath, 'utf-8'))

if (projectPkg.name === 'ku-utils') {
  process.exit(0)
}

const pkgRoot = path.resolve(__dirname, '..')

function copyIfNotExists(src, dest) {
  if (fs.existsSync(dest)) return
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
  const rel = path.relative(projectRoot, dest)
  console.log(`[custom-columns] ✅ 已安装: ${rel}`)
}

const rulesDir = path.join(pkgRoot, 'rules')
const targetRulesDir = path.join(projectRoot, '.cursor', 'rules')

try {
  for (const file of fs.readdirSync(rulesDir)) {
    if (!file.endsWith('.mdc')) continue
    copyIfNotExists(path.join(rulesDir, file), path.join(targetRulesDir, file))
  }
} catch (e) {}

const skillsDir = path.join(pkgRoot, 'skills', 'custom-columns')
const targetSkillsDir = path.join(projectRoot, '.cursor', 'skills', 'custom-columns')

try {
  copyIfNotExists(
    path.join(skillsDir, 'SKILL.md'),
    path.join(targetSkillsDir, 'SKILL.md')
  )
} catch (e) {}
