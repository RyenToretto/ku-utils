# 发布到 npm

`@ku-utils/*` 以 **public** 包发布到 [npmjs.org/org/ku-utils](https://www.npmjs.com/org/ku-utils)。升版、CHANGELOG 与 git tag 由 Changesets + GitHub Actions 完成。

操作总览（修改 / 发版 / 部署 / 升依赖 / 新包）见 **[运维操作指引](/guide/ops)**。

## 日常流程

1. 开发完成后执行 `pnpm changeset`，选择受影响的包与 patch/minor/major。
2. 将 `.changeset/*.md` 与代码一起提交并发起 PR。
3. 合并到 `main` 后，`release.yml` 会打开 **Version Packages** PR（升 `version`、写 CHANGELOG）。
4. 合并 Version PR 后自动 `pnpm release`：构建 `packages/*` 与 `tools/*`，`changeset publish` 到 npm，并推送形如 `@ku-utils/utils@1.5.5` 的 git tag。

## 本地紧急发版

```bash
npm whoami
pnpm changeset
pnpm version-packages
pnpm release
git push --follow-tags
```

账号开启 **2FA** 时，交互式登录会话发布需要 OTP：

```bash
pnpm changeset publish --otp=123456
```

或改用 **Automation token**（推荐 CI / 本地免 OTP）：

1. npmjs → Access Tokens → Generate new token → **Automation**
2. 本地：`npm config set //registry.npmjs.org/:_authToken <token>`（勿提交到 git）
3. CI：仓库 Secret `NPM_TOKEN` = 同一 Automation token（`release.yml` 已读取）

一键脚本：`bash scripts/publish.sh`。

## 首次补发「从未上架」的包

若 `package.json` 版本已存在但 npm 404，**不必再 changeset version**，构建后直接 publish：

```bash
pnpm turbo build --filter='./packages/*' --filter='./tools/*'
pnpm changeset publish --otp=<code>   # 或 Automation token 免 OTP
git push --follow-tags
```

核对：

```bash
npm view @ku-utils/<name> version
```

## 前置

- npm organization `ku-utils` 已创建，发布账号对该 scope 有权限（`npm whoami`）。
- GitHub Secrets 配置 `NPM_TOKEN`（**Automation** token，避免 CI 卡在 OTP）。
- 各包 `publishConfig.access` 为 `public`；Angular 包另需 `publishConfig.directory=dist`。

## 消费方

```bash
pnpm add @ku-utils/utils @ku-utils/hooks
```

无需自定义 `.npmrc`。仅 custom-columns、v2-custom-columns 会在安装时拷贝 Cursor rules/skills；CI 环境设置 `CI=1` 时跳过。
