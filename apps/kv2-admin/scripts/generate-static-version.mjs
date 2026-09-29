#!/usr/bin/env node
/**
 * 构建期生成 public/data/version.json，供 @ku-utils/hooks useVersionUpdate 做更新检测。
 */

import { execSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const APP_ROOT = resolve(__dirname, '..')
const OUT_DIR = resolve(APP_ROOT, 'public/data')

function getGitVersion() {
  try {
    return execSync('git rev-parse --short HEAD', { cwd: APP_ROOT, encoding: 'utf-8' }).trim()
  } catch {
    return `local-${Date.now()}`
  }
}

function formatLocalDateTime(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    ` ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  )
}

const now = new Date()
const version = getGitVersion()
const content = JSON.stringify(
  {
    version,
    versionTime: formatLocalDateTime(now),
    versionTimeISO: now.toISOString()
  },
  null,
  2
)

mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(resolve(OUT_DIR, 'version.json'), content, 'utf-8')
console.log(`[generate-static-version] → ${resolve(OUT_DIR, 'version.json')} (${version})`)
