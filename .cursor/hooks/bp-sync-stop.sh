#!/bin/sh
# Agent 结束时检查 .cursor rules/skills ↔ docs/best-practice 是否单边改动；不一致则追加 followup 让 agent 本任务内补齐
command -v node >/dev/null 2>&1 || . "$HOME/.nvm/nvm.sh" >/dev/null 2>&1
command -v node >/dev/null 2>&1 || { cat >/dev/null; echo '{}'; exit 0; }
exec node scripts/check-bp-sync.mjs --hook
