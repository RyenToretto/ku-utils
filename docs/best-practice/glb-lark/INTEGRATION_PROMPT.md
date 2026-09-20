# 接入 Prompt：glb-lark

> 本 Prompt 供 **本机或其他机器** 安装配置飞书 / Lark CLI 与全局 `lark-*` Skills 用。  
> 来源：ku-utils `docs/best-practice/glb-lark`。  
> 官方仓库：https://github.com/larksuite/cli

请在当前用户环境落实 Lark CLI + Agent Skills，不要把密钥写入任何 git 仓库。

## 目标

1. 确认 Node.js 可用（建议 ≥ 18），网络可访问 GitHub / `open.feishu.cn`。
2. **安装全局 Skills**（人类一键，官方推荐）：

```bash
npx skills add larksuite/cli -g -y
```

预期目录：`~/.agents/skills/lark-*`，并生成/更新 `~/.agents/.skill-lock.json`。

3. **安装 `lark-cli`**（若尚未在 PATH）：按 https://github.com/larksuite/cli 当前文档安装；装完验证：

```bash
which lark-cli
lark-cli --help
```

4. **首次应用配置**（阻塞式，需用户扫码/打开链接）：

```bash
lark-cli config init --new
```

若输出含 `verification_url` / `console_url` 等：必须 `lark-cli auth qrcode` 生成二维码并与原始 URL 一并展示给用户；**禁止改写 URL**。

5. **用户登录**（按需）：

```bash
lark-cli auth login
lark-cli auth status
lark-cli doctor
```

6. **更新约定**：以后只用 `lark-cli update` 同时更新 CLI 与 Skills；看到 `_notice.skills` 不同步时同样走 update，不要手动东拼西凑拷贝 skill。

7. 向用户说明：业务操作走对应 `lark-*` skill；鉴权/身份/高风险一律先遵循 `lark-shared`。写入/删除前要确认；禁止打印 appSecret / token。

## 可选抽检

```bash
ls -d ~/.agents/skills/lark-* | wc -l
lark-cli calendar --help
# 只读探测（已登录时）：
# lark-cli auth status
```

## 不要做

- 不要把企业 appSecret 写进 `docs/` 或项目 `.env` 示例并提交。
- 不要在未获用户同意时执行 high-risk-write，或静默加 `--yes` 绕过 exit 10。
- 不要为「装 skills」去改业务仓库的 `.cursor/skills`（这是**全局** `~/.agents/skills`）。

## 完成后

给出：`lark-cli` 路径、`~/.agents/skills/lark-*` 数量、`auth status` / `doctor` 摘要（可打码）、以及用户下一步若要用文档/日历该触发哪个 skill 名。
