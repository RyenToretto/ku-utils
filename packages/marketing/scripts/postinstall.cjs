#!/usr/bin/env node
const fs = require('fs'), path = require('path')
if (process.env.CI) process.exit(0)
const projectRoot = process.env.INIT_CWD || path.resolve(__dirname, '../../../../')
const pkgPath = path.join(projectRoot, 'package.json')
if (!fs.existsSync(pkgPath)) process.exit(0)
if (JSON.parse(fs.readFileSync(pkgPath, 'utf-8')).name === 'ku-utils') process.exit(0)
const pkgRoot = path.resolve(__dirname, '..')
function copy(src, dest) {
  if (fs.existsSync(dest)) return
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
  console.log(`[@ku-utils/marketing] ✅ 已安装: ${path.relative(projectRoot, dest)}`)
}
try { for (const f of fs.readdirSync(path.join(pkgRoot,'rules'))) { if(f.endsWith('.mdc')) copy(path.join(pkgRoot,'rules',f), path.join(projectRoot,'.cursor','rules',f)) } } catch(e){}
try { copy(path.join(pkgRoot,'skills','marketing','SKILL.md'), path.join(projectRoot,'.cursor','skills','marketing','SKILL.md')) } catch(e){}
