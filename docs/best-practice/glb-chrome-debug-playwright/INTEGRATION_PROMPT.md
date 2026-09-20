# 接入 Prompt：glb-chrome-debug-playwright

> 本 Prompt 供 **本机或其他机器** 安装配置用（全局用户目录），不是某个业务仓库的依赖。  
> 来源：ku-utils `docs/best-practice/glb-chrome-debug-playwright`。

请在当前用户环境落实 Chrome Debug + Playwright MCP 约定。

## 目标

1. 安装全局 skill 到 `~/.cursor/skills/chrome-debug-playwright/SKILL.md`（可从本模块参考机拷贝，或按下方「Skill 正文要点」新建）。
2. 安装可执行脚本 `~/bin/chrome-debug`（`chmod +x`），保证 `PATH` 含 `$HOME/bin`。
3. 验证 CDP：启动后 `curl -s http://127.0.0.1:9222/json/version` 有 JSON。
4. 配置或确认 Playwright MCP / Chrome DevTools MCP 连接 `127.0.0.1:9222`（按本机 Cursor MCP 配置改，勿猜密钥写进文档）。
5. **不要**把日常 Chrome Profile 用于 remote debugging；**不要**用 `/tmp/...` 当 user-data-dir。

## Skill 正文要点（须写入 SKILL.md）

- description 含：chrome-debug、9222、Playwright、remote debugging
- Core Rule：只用 `~/bin/chrome-debug`；Profile 固定为非默认目录
- 启动前检查 `/json/version`；失败再启动脚本
- Forbidden：临时 dir、默认 Profile、`pkill` Chrome、产物堆项目根
- 产物目录：`.playwright-mcp/logs/<topic>/`

## 启动脚本模板（macOS）

将下列内容写入 `~/bin/chrome-debug` 后 `chmod +x`。若 Chrome 不在 `/Applications/Google Chrome.app`，用环境变量 `CHROME_BIN` 覆盖。

```bash
#!/bin/bash
# 以远程调试模式启动 Chrome，供 Playwright MCP / Chrome DevTools MCP 连接。
set -euo pipefail

CHROME="${CHROME_BIN:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
DEBUG_PORT="${CHROME_DEBUG_PORT:-9222}"
DEBUG_USER_DATA_DIR="${CHROME_DEBUG_USER_DATA_DIR:-$HOME/Library/Application Support/Google/Chrome-Debug}"
VERSION_URL="http://127.0.0.1:${DEBUG_PORT}/json/version"

print_version() {
  curl -s "$VERSION_URL" | python3 -m json.tool 2>/dev/null || curl -s "$VERSION_URL"
}

if curl -sf "$VERSION_URL" >/dev/null 2>&1; then
  echo "[ok] Chrome debug already running on port ${DEBUG_PORT}"
  print_version
  exit 0
fi

if [ ! -x "$CHROME" ]; then
  echo "[error] Chrome binary not found: ${CHROME}"
  exit 1
fi

mkdir -p "$DEBUG_USER_DATA_DIR"

LAUNCH=()
if [ "$(/usr/sbin/sysctl -n hw.optional.arm64 2>/dev/null || echo 0)" = "1" ]; then
  LAUNCH=(/usr/bin/arch -arm64)
fi

LOG_FILE="${DEBUG_USER_DATA_DIR}/chrome-debug-launch.log"
"${LAUNCH[@]}" "$CHROME" \
  --remote-debugging-port="$DEBUG_PORT" \
  --user-data-dir="$DEBUG_USER_DATA_DIR" \
  --profile-directory=Default \
  --no-first-run \
  --no-default-browser-check \
  "$@" >>"$LOG_FILE" 2>&1 &

CHROME_PID=$!
for _ in $(seq 1 25); do
  sleep 1
  if curl -sf "$VERSION_URL" >/dev/null 2>&1; then
    echo "[ok] Chrome debug ready (pid ${CHROME_PID})"
    print_version
    exit 0
  fi
  if ! kill -0 "$CHROME_PID" 2>/dev/null; then
    echo "[error] Chrome exited early; log: ${LOG_FILE}"
    exit 1
  fi
done
echo "[error] Timeout waiting for port ${DEBUG_PORT}; log: ${LOG_FILE}"
exit 1
```

Linux：改 `CHROME` 为本机 chromium/google-chrome 路径，Profile 建议 `$HOME/.config/chrome-debug`。  
Windows：用等价 PowerShell / 批处理暴露 `9222` + 非默认 user-data-dir（自行适配，原则不变）。

## 用户提示文案（CDP 不可用时）

```text
请运行 ~/bin/chrome-debug。新版 Chrome 远程调试需要固定的非默认 Profile，首次使用可能要重新登录，之后登录态会保存在 Chrome-Debug 目录中。
```

## 完成后

列出：skill 路径、脚本路径、一次成功的 `/json/version` 摘要（可打码）、MCP 是否已指向 9222。
