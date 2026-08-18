# xh-report 迁移映射

## 概览

xh-report 是 npm workspaces monorepo，含两个发布包：

| 旧包                      | 新位置                     | 新版本 |
| ------------------------- | -------------------------- | ------ |
| `xh-report` (v3.0.1)      | `@ku-utils/report`         | 1.1.1  |
| `landing-report` (v3.0.1) | `@ku-utils/landing-report` | 1.1.1  |

依赖链变更：`du-utils` (file tar.gz) → `@ku-utils/utils` (workspace)

## packages/sdk/ → @ku-utils/report

| 源文件                                              | 处理 | 去向                                                                             |
| --------------------------------------------------- | ---- | -------------------------------------------------------------------------------- |
| `src/index.ts`                                      | ✅   | `@ku-utils/report/src/index.ts`（聚合导出）                                      |
| `src/types.ts`                                      | ✅   | `src/types.ts`（`any` 改为 `unknown`）                                           |
| `src/version.ts → SDK_VERSION`                      | ✅   | `src/version.ts`（保留 '3.0.1'）                                                 |
| `src/createXhReport.ts`                             | ✅   | `src/createXhReport.ts`（du-utils 的 `doExtendAll` 改从 @ku-utils/utils 导入）   |
| `src/core/index.ts → CoreTracker`                   | ✅   | `src/core/index.ts`（含全部 du-utils 函数替换 + `isClient()` → `isClient` 常量） |
| `src/core/defaultReportFetch.ts`                    | ✅   | `src/core/defaultReportFetch.ts`                                                 |
| `src/core/reportContext.ts → buildMergedExtPayload` | ✅   | `src/core/reportContext.ts`                                                      |
| `src/core/reportGuards.ts`                          | ✅   | `src/core/reportGuards.ts`（含 5 个守卫函数 + StorageAccessor 类型）             |

### du-utils → @ku-utils/utils 替换映射

| 原 du-utils 函数  | 新 @ku-utils/utils 位置 | 备注                                        |
| ----------------- | ----------------------- | ------------------------------------------- |
| `getBrowserInfo`  | `device.ts`             |                                             |
| `doDate`          | `date.ts`               |                                             |
| `getPageParams`   | `url.ts`                |                                             |
| `makeVersionCode` | `uuid.ts`               |                                             |
| `ktk`             | `uuid.ts`               |                                             |
| `uuid`            | `uuid.ts`               |                                             |
| `useToken`        | `uuid.ts`               |                                             |
| `isClient`        | `is.ts`                 | **由函数 `isClient()` 改为常量 `isClient`** |
| `safeParseJson`   | `is.ts`                 |                                             |
| `isDefined`       | `is.ts`                 |                                             |
| `doExtendAll`     | `object.ts`             |                                             |

## packages/landing/ → @ku-utils/landing-report

| 源文件                       | 处理 | 去向                                                                    |
| ---------------------------- | ---- | ----------------------------------------------------------------------- |
| `src/index.ts`               | ✅   | `@ku-utils/landing-report/src/index.ts`（重导出 @ku-utils/report 类型） |
| `src/LandingTracker.ts`      | ✅   | `src/LandingTracker.ts`（继承 @ku-utils/report 的 CoreTracker）         |
| `src/createLandingReport.ts` | ✅   | `src/createLandingReport.ts`（du-utils → @ku-utils/utils）              |

## 工程层处理

| 项                                               | 处理 | 原因                                            |
| ------------------------------------------------ | ---- | ----------------------------------------------- |
| `playground/`（Vue 3 + Vite）                    | ⏭    | ku-utils 已有 `apps/playground-vue3` 可用于验证 |
| `scripts/release.mjs` / `scripts/pack.mjs`       | ⏭    | ku-utils 使用 changeset / pnpm publish 发版     |
| `.cursor/rules/du-utils.mdc`                     | ⏭    | 项目专属规则                                    |
| `build.config.ts`（unbuild）                     | ⏭    | ku-utils 统一使用 tsup                          |
| `package.json` 中 `du-utils` 的 file tar.gz 依赖 | 🔁   | 替换为 `"@ku-utils/utils": "workspace:*"`       |

---

## 校对补漏（2026-04-17 二轮校对）

对 xh-report 全部 14 个 .ts 文件做了一次完整 find 比对，补充以下条目：

### 工程配置类（已在工程层处理列表，此处展开）

| 源                                 | 处理 | 说明                                                |
| ---------------------------------- | ---- | --------------------------------------------------- |
| `packages/sdk/build.config.ts`     | ⏭    | unbuild 配置，已被 tsup 取代                        |
| `packages/landing/build.config.ts` | ⏭    | 同上                                                |
| `packages/sdk/vitest.config.ts`    | ⏭    | xh-report 原本无实际测试用例（vitest 配置但未执行） |

### 重构后二轮发现（2026-04-17 三轮）

`createXhReport.ts` 与 `createLandingReport.ts` 在初版迁移中各保留了 30+ 行重复代码。本轮代码审查中已抽出 `createTrackerFactory` 泛型工厂作为公共能力：

- 详见 [`code-review-new-packages.md`](./code-review-new-packages.md) 问题 A
- 涉及发版：`@ku-utils/report` 1.1.2、`@ku-utils/landing-report` 1.1.2

### `package.json` 替换细节

```diff
// xh-report 原 packages/sdk/package.json
- "dependencies": {
-   "du-utils": "file:../../du-utils-x.x.x.tgz"
- }

// 迁入后 @ku-utils/report/package.json
+ "dependencies": {
+   "@ku-utils/utils": "workspace:*"
+ }
```

`@ku-utils/landing-report` 同理增加 `"@ku-utils/report": "workspace:*"`。

### 一致性检查结论

- ✅ 14 个源文件全部覆盖
- ✅ du-utils 11 个函数引用已全部替换为 @ku-utils/utils
- ✅ 重复代码（createXhReport / createLandingReport）已在 1.1.2 重构去除
