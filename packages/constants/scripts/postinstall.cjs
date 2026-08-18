#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

if (process.env.CI) process.exit(0)

const projectRoot = process.env.INIT_CWD || path.resolve(__dirname, '../../../../')
const projectPkgPath = path.join(projectRoot, 'package.json')
if (!fs.existsSync(projectPkgPath)) process.exit(0)

const projectPkg = JSON.parse(fs.readFileSync(projectPkgPath, 'utf-8'))
if (projectPkg.name === 'ku-utils') process.exit(0)

const pkgRoot = path.resolve(__dirname, '..')

function copyIfNotExists(src, dest) {
  if (fs.existsSync(dest)) return
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
  console.log(`[@ku-utils/constants] ✅ 已安装: ${path.relative(projectRoot, dest)}`)
}

try {
  const rulesDir = path.join(pkgRoot, 'rules')
  const targetRulesDir = path.join(projectRoot, '.cursor', 'rules')
  for (const file of fs.readdirSync(rulesDir)) {
    if (!file.endsWith('.mdc')) continue
    copyIfNotExists(path.join(rulesDir, file), path.join(targetRulesDir, file))
  }
} catch (e) {}

try {
  const skillsDir = path.join(pkgRoot, 'skills', 'constants')
  const targetSkillsDir = path.join(projectRoot, '.cursor', 'skills', 'constants')
  copyIfNotExists(path.join(skillsDir, 'SKILL.md'), path.join(targetSkillsDir, 'SKILL.md'))
} catch (e) {}
