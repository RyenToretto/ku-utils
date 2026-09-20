# glb-chrome-debug-playwright — 本机 Chrome Debug + Playwright

> **参考接入**：指导**本机或其他机器**安装配置全局 skill / 启动脚本，不是仓库运行时依赖。  
> **前缀 `glb-`**：Global（机器级 / 用户主目录），不进项目 `.cursor`，也**不**要求与本仓 rule/skill 双向同步。

**类型**：全局 Skill + Shell 启动脚本

为 Playwright MCP / Chrome DevTools MCP 提供固定的非默认 Chrome Debug Profile（CDP `9222`），避免新版 Chrome 拒绝默认 Profile 远程调试。

## 推进接入分数

| 维度         | 分         | 说明                                       |
| ------------ | ---------- | ------------------------------------------ |
| 覆盖度       | 15/25      | 本机已验证；跨机需改 Chrome 路径           |
| 可执行性     | 24/25      | 脚本 + curl 验收清晰                       |
| 可移植性     | 18/25      | macOS 路径为主；Linux/Windows 需改路径     |
| Agent 可触发 | 14/15      | `~/.cursor/skills/chrome-debug-playwright` |
| 单一真源     | 9/10       | skill + `~/bin/chrome-debug`               |
| **合计**     | **80/100** |                                            |

## 最佳实践（精炼）

1. **永远**用 `~/bin/chrome-debug` 起调试 Chrome；禁止默认日常 Profile、禁止 `/tmp` 临时 user-data-dir。
2. 固定 Profile（macOS）：`$HOME/Library/Application Support/Google/Chrome-Debug`；端口默认 `9222`。
3. Agent 用 Playwright / CDP 前：先 `curl http://127.0.0.1:9222/json/version`；失败则请用户跑 `~/bin/chrome-debug`。
4. 截图 / HAR / trace 等产物放 `.playwright-mcp/logs/<topic>/`，**不要**堆在项目根。
5. 禁止 `pkill -f "Google Chrome"`；不要强杀用户日常 Chrome。

## 本机落点（参考机）

| 项            | 路径                                                |
| ------------- | --------------------------------------------------- |
| Skill         | `~/.cursor/skills/chrome-debug-playwright/SKILL.md` |
| 启动脚本      | `~/bin/chrome-debug`                                |
| Debug Profile | `~/Library/Application Support/Google/Chrome-Debug` |
| CDP           | `http://127.0.0.1:9222`                             |

## 验收清单

- [ ] `curl -s http://127.0.0.1:9222/json/version` 在启动脚本后返回 JSON
- [ ] `~/bin/chrome-debug` 可执行，且第二次调用显示 already running
- [ ] Agent 会话能加载 `chrome-debug-playwright` skill
- [ ] 无意把 `.png` / `.har` 提交进 git（验收用 `git status`）

## 相关

- 接入步骤：同目录 [INTEGRATION_PROMPT.md](./INTEGRATION_PROMPT.md)
- 命名约定见 [../README.md](../README.md) 的 `glb-*`
