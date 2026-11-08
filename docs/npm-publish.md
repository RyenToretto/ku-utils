# 发布到 npm

`@ku-utils/*` 以 **public** 包发布到 [npmjs.org/org/ku-utils](https://www.npmjs.com/org/ku-utils)。升版、CHANGELOG 与 git tag 由 Changesets + GitHub Actions 完成。

操作总览（修改 / 发版 / 部署 / 升依赖 / 新包）见 **[运维操作指引](/guide/ops)**。

## 日常流程

1. 开发完成后执行 `pnpm changeset`，选择受影响的包与 patch/minor/major。
2. 将 `.changeset/*.md` 与代码一起提交并发起 PR。
3. 合并到 `main` 后，`release.yml` 会打开 **Version Packages** PR（升 `version`、写 CHANGELOG）。
4. 合并 Version PR 后自动 `pnpm release`：构建 `packages/*` 与 `tools/*`，`changeset publish` 到 npm，并推送形如 `@ku-utils/utils@1.5.5` 的 git tag。

## 免 OTP：Granular Access Token（推荐）

npm 已主推 **Granular Access Token**（经典 Classic Automation 逐步受限）。  
创建页：<https://www.npmjs.com/settings/~/tokens/granular-access-tokens/new>

### 表单勾选（本地 Mac / CI 各建一个亦可）

| 项                                         | 建议                                                                                                                                    |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Token name                                 | 如 `macbookpro16`（本机）或 `github-actions-ku-utils`（CI）                                                                             |
| **Bypass two-factor authentication (2FA)** | **必须勾选**，否则发版仍要 OTP                                                                                                          |
| Allowed IP ranges                          | 本机可空；CI 一般空（Actions IP 不固定）                                                                                                |
| Expiration / **Expires**                   | Token **失效日期**（截图列）。到期后该串作废，发版会 401；须新建 token 并更新本机 `~/.npmrc` / Secret `NPM_TOKEN`（见下「到期怎么办」） |
| Permissions → Packages                     | **Read and write**                                                                                                                      |
| Packages 范围                              | 选组织 **ku-utils** 下全部包，或「All packages」中仅限你有权的 `@ku-utils/*`                                                            |
| Organizations（若有）                      | 对 `ku-utils` 至少能管理/发布包                                                                                                         |

生成后**只显示一次**，立刻保存。

> 黄条提示：npm 将收紧「绕过 2FA」的 token（账户变更 2026-08、直接发布 2027-01）。到期前改用官方推荐新方案；当前阶段发版仍依赖 Bypass 2FA。

### 本机配置（写入用户级 `~/.npmrc`，禁止提交进仓库）

```bash
npm config set //registry.npmjs.org/:_authToken "npm_XXXXXXXX"   # 粘贴 token
npm whoami
# 应输出 koujianfeng（或有 publish 权的机器人号）
```

验证免 OTP（任选一未占用版本或 dry-run）：

```bash
cd packages/eslint-config && npm publish --access public --dry-run
# 真正补发时不应再出现 EOTP
```

仓库根 `.npmrc` 只放 pnpm 策略，**不要**写 `_authToken`（有 `scripts/check-no-auth-token.sh` 守卫）。

### GitHub Actions（CI）

仓库 `RyenToretto/ku-utils` → Settings → Secrets and variables → Actions → 新建/更新：

| Name        | Value                                                                     |
| ----------- | ------------------------------------------------------------------------- |
| `NPM_TOKEN` | 上一步生成的 token（建议单独 `github-actions-ku-utils`，也勾 Bypass 2FA） |

### Expires 是什么？到期怎么办？

npm 列表里的 **Expires** = 该 token 的**过期日**（例如 `Feb 5, 2027`）。到期后：

- 用该 token 的 `npm publish` / Actions 发版会 **401 Unauthorized**
- 旧 token 无法续期，只能 **Generate New Token** 再替换

轮换步骤：

1. npm → Access Tokens → 新建（勾 Bypass 2FA，权限同前）→ 复制
2. 本机：`npm config set //registry.npmjs.org/:_authToken "新token"`（仅更新 macbook 那条）
3. CI：GitHub → Settings → Secrets → `NPM_TOKEN` → Update
4. 在 npm 上 **Delete** 旧 token（可选但推荐）
5. 日历提醒：到期前 1～2 周轮换

`release.yml` 已注入：

```yaml
env:
  NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
  NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

`actions/setup-node` 的 `registry-url: https://registry.npmjs.org` 会配合 `NODE_AUTH_TOKEN` 写临时 `.npmrc`。

## 本地紧急发版（仍可用交互 OTP）

未配 Bypass token 时：

```bash
npm whoami
pnpm changeset
pnpm version-packages
pnpm release
# 或：pnpm changeset publish --otp=123456
git push --follow-tags
```

一键：`NPM_OTP=xxxxxx bash scripts/publish.sh`

## 首次补发「从未上架」的包

若 `package.json` 版本已存在但 npm 404，**不必再 changeset version**，构建后直接 publish：

```bash
pnpm turbo build --filter='./packages/*' --filter='./tools/*'
pnpm changeset publish   # 已配 Bypass token 则无需 --otp
git push --follow-tags
```

核对：

```bash
npm view @ku-utils/<name> version
curl -sS "https://registry.npmjs.org/@ku-utils%2F<name>" | node -e 'let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>console.log(JSON.parse(d)["dist-tags"]))'
```

## 前置清单

- [ ] npm 组织 `ku-utils` 存在，账号有 publish 权（`npm whoami`）
- [ ] Granular token 已勾 **Bypass 2FA** + Packages Read and write
- [ ] 本机 `~/.npmrc` 含 `//registry.npmjs.org/:_authToken=…`
- [ ] GitHub Secret `NPM_TOKEN` 已配置
- [ ] 各包 `publishConfig.access` 为 `public`；Angular 包另需 `publishConfig.directory=dist`

## 消费方

```bash
pnpm add @ku-utils/utils @ku-utils/hooks
```

无需自定义 `.npmrc`。仅 custom-columns、v2-custom-columns 会在安装时拷贝 Cursor rules/skills；CI 环境设置 `CI=1` 时跳过。
