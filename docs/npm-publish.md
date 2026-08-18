# 发布到 npm

`@ku-utils/*` 以 **public** 包发布到 npmjs.org。升版、CHANGELOG 与 git tag 由 Changesets + GitHub Actions 完成。

## 日常流程

1. 开发完成后执行 `pnpm changeset`，选择受影响的包与 patch/minor/major。
2. 将 `.changeset/*.md` 与代码一起提交并发起 PR。
3. 合并到 `main` 后，`release.yml` 会打开 **Version Packages** PR（升 `version`、写 CHANGELOG）。
4. 合并 Version PR 后自动 `pnpm release`：构建 `packages/*` 与 `tools/*`，`changeset publish` 到 npm，并推送形如 `@ku-utils/utils@1.5.5` 的 git tag。

本地紧急发版：

```bash
pnpm changeset
pnpm version-packages
pnpm release
git push --follow-tags
```

## 前置

- npm organization `ku-utils` 已创建，发布账号对该 scope 有权限。
- GitHub Secrets 配置 `NPM_TOKEN`（Automation token）。
- 各包 `publishConfig.access` 为 `public`。

## 消费方

```bash
pnpm add @ku-utils/utils @ku-utils/hooks
```

无需自定义 `.npmrc`。仅 custom-columns、v2-custom-columns、report、landing-report、request、marketing、pay 会在安装时拷贝 Cursor rules/skills；CI 环境设置 `CI=1` 时跳过。
