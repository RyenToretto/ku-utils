# glb-lark — 本机飞书 / Lark CLI + Skills

> **参考接入**：指导**本机或其他机器**安装配置 `lark-cli` 与整套 `lark-*` Agent Skills，不是仓库运行时依赖。  
> **前缀 `glb-`**：Global（机器级 / 用户主目录），不进项目 `.cursor`，也**不**要求与本仓 rule/skill 双向同步。  
> **聚合模块**：本目录只讲「怎么装 / 怎么登录 / 怎么更新」；不拆成 28 个 skill 子文档。

**类型**：全局 CLI + Agents Skills（`~/.agents/skills/lark-*`）

官方来源：[larksuite/cli](https://github.com/larksuite/cli)（Agent Skills 一键安装）。

## 推进接入分数

| 维度         | 分         | 说明                                      |
| ------------ | ---------- | ----------------------------------------- |
| 覆盖度       | 20/25      | 官方 well-known skills；多机可复现        |
| 可执行性     | 23/25      | `npx skills add` + `config init` + `auth` |
| 可移植性     | 22/25      | 需 Node / 网络；企业应用权限因租户而异    |
| Agent 可触发 | 15/15      | 28 个 `lark-*` skill description 齐全     |
| 单一真源     | 9/10       | CLI 与 skills 用 `lark-cli update` 对齐   |
| **合计**     | **89/100** |                                           |

## 最佳实践（精炼）

1. **一次安装 skills（人类）**：`npx skills add larksuite/cli -g -y` → 落到 `~/.agents/skills/lark-*`。
2. **安装 / 更新 CLI**：按官方文档安装 `lark-cli`；之后统一 `lark-cli update`（同时更新 CLI + Skills）。
3. **首次配置应用**：`lark-cli config init --new`；出现授权 URL 时用 `lark-cli auth qrcode` 展示二维码，URL 原样转发。
4. **登录**：`lark-cli auth login`；日常用 `lark-cli auth status` / `lark-cli doctor` 体检。
5. **身份**：`--as user` vs `--as bot` 先搞清再写操作；高风险写入遇 exit 10 必须人工确认后再加确认 flag。
6. **禁止**把 appSecret / accessToken 打进终端或 commit。

## 本机落点（参考机）

| 项             | 路径 / 命令                               |
| -------------- | ----------------------------------------- |
| Skills 根      | `~/.agents/skills/lark-*`（约 28 个）     |
| Lock           | `~/.agents/.skill-lock.json`              |
| CLI            | `lark-cli`（PATH 可执行）                 |
| 共享底座 skill | `lark-shared`（鉴权 / 输出契约 / 高风险） |
| 更新           | `lark-cli update`                         |

### Skills 清单（安装后应存在）

`lark-approval` · `lark-apps` · `lark-attendance` · `lark-base` · `lark-calendar` · `lark-contact` · `lark-doc` · `lark-drive` · `lark-event` · `lark-im` · `lark-mail` · `lark-markdown` · `lark-meeting` · `lark-minutes` · `lark-note` · `lark-okr` · `lark-openapi-explorer` · `lark-shared` · `lark-sheets` · `lark-skill-maker` · `lark-slides` · `lark-task` · `lark-vc` · `lark-vc-agent` · `lark-whiteboard` · `lark-wiki` · `lark-workflow-meeting-summary` · `lark-workflow-standup-report`

（`lark-minutes` / `lark-note` / `lark-vc` / `lark-vc-agent` 等多为转发到 `lark-meeting` 的别名 skill。）

## 验收清单

- [ ] `which lark-cli` 有输出；`lark-cli doctor` 无致命错误
- [ ] `ls ~/.agents/skills/lark-*` 数量与清单大致一致（≥20）
- [ ] `lark-cli auth status` 显示已登录（或明确下一步 login）
- [ ] Agent 对话能按需触发 `lark-shared` / 业务域 skill（如 `lark-doc`）

## 相关

- 接入步骤：同目录 [INTEGRATION_PROMPT.md](./INTEGRATION_PROMPT.md)
- 命名约定见 [../README.md](../README.md) 的 `glb-*`
