# 修改 · 发版 · 部署 · 更新依赖 · 新增包

本页是 ku-utils **运维操作总入口**。细节交叉引用：

| 专题              | 文档                                |
| ----------------- | ----------------------------------- |
| Changesets 发 npm | [发布到 npm](/npm-publish)          |
| 文档站部署        | [VitePress 部署](/deploy-vitepress) |
| Commit / 新包模板 | [贡献指南](/contributing)           |
| 构建编排          | [Turborepo](/turborepo)             |
| 消费方安装        | [从 npm 安装](/guide/npm)           |

---

## 0. 可发包清单（对照 npm）

仅 `packages/*` 与 `tools/*` 中带 `"publishConfig.access": "public"` 的包会发到 npm；`apps/*`、根仓、`docs` **不发布**。

| 包名                                                                                       | 用途                                |
| ------------------------------------------------------------------------------------------ | ----------------------------------- |
| `@ku-utils/tsconfig` / `eslint-config` / `prettier-config` / `stylelint-config`            | 工程配置                            |
| `@ku-utils/utils` / `types` / `constants` / `i18n`                                         | 基础库                              |
| `@ku-utils/hooks` / `hooks-react` / `hooks-angular`                                        | 各栈 Hooks                          |
| `@ku-utils/directives` / `ui` / `ui-vue2` / `skin`                                         | UI 相关                             |
| `@ku-utils/custom-columns` / `v2-custom-columns` / `r-custom-columns` / `a-custom-columns` | 自定义列（Vue3/Vue2/React/Angular） |
| `@ku-utils/nuxt-module`                                                                    | Nuxt 模块                           |
| `@ku-utils/cli` / `create-app`                                                             | CLI / 脚手架                        |

核对本地 vs npm：

```bash
# 在 ku-utils 根目录
for p in packages/*/package.json tools/*/package.json; do
  name=$(node -p "require('./$p').name")
  ver=$(node -p "require('./$p').version")
  npmv=$(npm view "$name" version 2>/dev/null || echo MISSING)
  echo "$name  local=$ver  npm=$npmv"
done
```

首次补发未上架包（版本已在 `package.json`、无需再升版）：

```bash
pnpm turbo build --filter='./packages/*' --filter='./tools/*'
# 账号开了 2FA：需要 OTP 或改用 Automation token（见 /npm-publish）
pnpm changeset publish --otp=<一次性验证码>
git push --follow-tags
```

---

## 1. 日常修改代码

1. 在对应包改源码（`packages/<name>` 或 `tools/<name>`）。
2. 本地验证：

```bash
pnpm --filter @ku-utils/<name> build
# 需要时跑 playground / admin
pnpm dev:v3          # 或 dev:admin / dev:n4 …
```

3. 若改动需要发新版本：执行 `pnpm changeset`（见下节），与代码同一 PR 提交。
4. Commit 使用中文 subject，scope 为包名（见 [贡献指南](/contributing)）。

**禁止**：直接改消费仓里 `node_modules/@ku-utils/*`；也禁止用 `file:` / `workspace:` 把业务仓链到本仓源码（业务仓应只吃 npm 版本）。

---

## 2. 发版（npm）

### 推荐：GitHub Actions

```text
改代码 → pnpm changeset → PR 合入 main
      → bot 开 Version Packages PR（升 version + CHANGELOG）
      → 合并 Version PR → 自动 build + changeset publish + git tag
```

仓库 Secrets 需配置 **`NPM_TOKEN`**（npm **Automation** 类型，免交互 OTP）。详见 [发布到 npm](/npm-publish)。

### 本地紧急发版

```bash
npm whoami                    # 须对 @ku-utils 有 publish 权
pnpm changeset                # 选包 + patch/minor/major + 说明
pnpm version-packages         # 或 pnpm changeset version
pnpm release                  # build packages/tools + publish
# 若 2FA：pnpm changeset publish --otp=xxxxxx
git push --follow-tags
```

一键脚本：`bash scripts/publish.sh`（内部同样走 changeset）。

SemVer：`patch` 修 bug；`minor` 兼容新能力；`major` 破坏性变更。

---

## 3. 部署文档站

文档是 VitePress（`docs/`，包名 `@ku-utils/docs`）。

```bash
pnpm start                              # 本地预览
pnpm --filter @ku-utils/docs build      # 产物 docs/.vitepress/dist
bash scripts/deploy-docs.sh             # 仅构建并打印路径
```

线上：GitHub Pages / 任意静态托管，步骤见 [VitePress 部署](/deploy-vitepress)。  
发版 npm **不会**自动部署文档；文档与包版本可分开发，但接口/API 变更应同步改 docs。

---

## 4. 消费方更新依赖

业务仓（如 hmake）只依赖 npm 上的 `@ku-utils/*`：

```bash
# 升到最新
pnpm update @ku-utils/hooks @ku-utils/utils @ku-utils/skin @ku-utils/custom-columns

# 或钉死版本后改 package.json 再
pnpm install
```

建议：

1. 看对应包 CHANGELOG / GitHub Release tag（`@ku-utils/hooks@x.y.z`）。
2. major 升级先读迁移说明（[存量迁移](/guide/migration)）。
3. 锁文件一并提交；CI 与本地用同一 `pnpm` 大版本。

---

## 5. 新增包教程

### 5.1 是否该新建包

- 能力属于现有包职责 → **扩现有包** + changeset。
- 独立发布单元、不同 peer（如另一框架）→ 新建 `@ku-utils/<name>`。

### 5.2 步骤清单

1. **建目录**：`packages/<name>/`（CLI 类放 `tools/<name>/`）。
2. **package.json**（必填）：

```json
{
  "name": "@ku-utils/my-lib",
  "version": "0.0.1",
  "description": "一句话说明",
  "publishConfig": { "access": "public" },
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup",
    "dev": "tsup --watch",
    "clean": "rm -rf dist",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@ku-utils/tsconfig": "workspace:*",
    "tsup": "^8.5.0",
    "typescript": "^5.8.3"
  }
}
```

3. **tsconfig**：继承 `@ku-utils/tsconfig/library.json`（或仓内同类模板）。
4. **README**：包根说明用途、安装、最小示例。
5. **接入 workspace**：确认 `pnpm-workspace.yaml` 已含 `packages/*`（默认已覆盖）。
6. **commitlint**：`commitlint.config.js` 的 `scope-enum` 增加 `my-lib`。
7. **文档站**：
   - 新增 `docs/packages/my-lib.md`（或 `docs/config/…`）
   - 在 `docs/.vitepress/config.ts` sidebar / nav 挂上链接
8. **首次发版**：

```bash
pnpm changeset          # 选新包，一般 minor 或 从 0.0.1 patch
# 合入 main 走 Actions；或本地：
pnpm version-packages
pnpm release
```

9. **消费验证**：另开业务仓 `pnpm add @ku-utils/my-lib@0.0.1`，确认能装能 import。

Angular 包（`ng-packagr`）须设 `publishConfig.directory=dist`，参考 `@ku-utils/hooks-angular` / `a-custom-columns`。

### 5.3 验收清单

- [ ] `publishConfig.access=public`
- [ ] `pnpm --filter @ku-utils/my-lib build` 成功
- [ ] README + docs 页面 + sidebar
- [ ] commitlint scope 已加
- [ ] `npm view @ku-utils/my-lib version` 有结果

---

## 6. 推荐顺序（一张图）

```text
改包源码 ──► pnpm changeset ──► PR → main
                │
                ▼
         Version Packages PR
                │
                ▼
         npm 上架 + git tag
                │
        ┌───────┴────────┐
        ▼                ▼
  业务仓 pnpm update   文档站部署（可选同步）
```
