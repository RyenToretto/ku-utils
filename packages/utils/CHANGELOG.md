# @ku-utils/utils

## 1.5.4

### Patch Changes

- 修复 `downloadBlobByFetch` headers 类型过严问题：将 fetcher 返回值的 `headers` 类型从 `Record<string, string>` 放宽为 `Record<string, unknown>`，与 Axios `AxiosResponseHeaders` 兼容，避免 TypeScript 编译报错。

## 1.5.3

### Patch Changes

- 新增 `downloadBlobByFetch`：通过 fetcher 函数获取 Blob 并触发浏览器下载，适用于需要携带 Authorization 请求头的 Bearer token 文件下载场景，支持 preCheck 前置校验与 Content-Disposition 自动解析文件名。

## 1.5.1

### Patch Changes

- 修复共享组件和日期工具的多语言文案能力：custom-columns 内置文案支持 messages 覆盖且默认中文兜底，utils 相对时间和时长格式支持 locale/messages 且默认中文兜底。

## 1.5.0

### Minor Changes

- 1d8c8cf: Add generic SEO DOM helpers: `setMeta`, `setFavicon`, `setApplicationInfo`, and `setJsonLd`.

## 1.4.4

### Patch Changes

- Add `encodeShiftHex` for shift-then-hex string encoding.

## 1.4.3

### Patch Changes

- Copy render formatter docs into consuming projects during postinstall.

## 1.4.2

### Patch Changes

- Add shared display formatting helpers for legacy filter migration.

## 1.4.1

### Patch Changes

- Add compact number formatting for token-style large values.

## 1.3.2

### Patch Changes

- feat(utils): 新增 Cursor rules/skills 自动安装（postinstall）

## 1.3.1

### Patch Changes

- refactor(v2-custom-columns): transferTF 迁移至 @ku-utils/utils，新增 Cursor rules/skills 自动安装

  ### @ku-utils/v2-custom-columns
  - `transferTF` 从包内 `src/utils/helpers.js` 迁移至 `@ku-utils/utils`，通过 `workspace:*` 引用
  - 新增 `rules/`：`custom-columns-pattern.mdc`（接入规范）
  - 新增 `skills/custom-columns/SKILL.md`：完整接入 Skill，涵盖 schema 定义/模板/版本管理/FAQ
  - 新增 `scripts/postinstall.cjs`：业务项目 `npm install` 时自动将 rules/skills 复制到 `.cursor/` 目录

  ### @ku-utils/utils
  - `string.ts` 新增 `transferTF(str)`：驼峰转匈牙利命名（大写字母前加 `_` 并转小写）

## 1.3.0

### Minor Changes

- 7f1ad63: feat(utils): `local` / `session` storage 加 try-catch 静默兜底，新增 `setRaw / getRaw`

  变更点：
  1. `local.set` / `session.set` 返回值从 `void` 改为 `boolean`（兼容旧调用），Safari 私密模式 SecurityError / QuotaExceededError 不再抛出
  2. `get` / `remove` / `clear` 全部 try-catch 兜底，失败返回 `defaultValue` / `false`
  3. 新增 `setRaw(key, value: string) / getRaw(key): string | null` —— 直接以原始字符串写入/读取，不做 JSON 包装，适用于「业务层只想存一个枚举字符串（如 `'pay_wait'`）且其它代码裸 `localStorage.getItem` 也要能取到原值」的场景
  4. dev 环境下捕获到异常时打 console.warn；SSR 静默

## 1.2.1

### Patch Changes

- 新增 `formatTime` / `getStrRatio` 两个 helper, 补齐 du-utils 迁移至 @ku-utils/utils 后业务侧仍在裸调的两个工具函数:
  - `formatTime(input)`: 英文相对时间格式化, 与 `getRelativeTime` (中文档位) 互补
  - `getStrRatio(value)`: 把 "W:H" 或纯数字解析成 number ratio, 失败兜底 0.75

## 1.2.0

### Minor Changes

- 平移 du-composables 全部 Vue 3 Composables 至 @ku-utils/hooks，并为 @ku-utils/utils 与 @ku-utils/marketing 新增 ./auto-import 子路径
  - @ku-utils/hooks 新增 10 个 composables：useDeviceDetect / useIntersection / useDialogState / usePopover / useDomState / useScrollbarStatus / useParentScrollbarStatus / useScrollGapSync / useResponsiveColumns / useResponsiveItemGap
  - @ku-utils/hooks 重写 useEventBus 为兼容版本：带泛型、createEventBus 工厂、EventBusInstance 类型导出、SSR fallback、scope 缓存（保持 useEventBus() 零参调用向后兼容）
  - @ku-utils/hooks 新增 types.ts 聚合导出 EventBusInstance / EventCallback / IntersectionCallback / IntersectionOptions / UseDeviceDetectOptions / ColumnBreakpoints / UseResponsiveColumnsOptions / UseResponsiveItemGapOptions
  - @ku-utils/utils 新增 ./auto-import 子路径导出 kuUtilsUtilsImports / kuUtilsUtilsPreset（共 153 个命名导出），并新增 scripts/generate-auto-import.mjs 在 build 后自动同步
  - @ku-utils/marketing 新增 ./auto-import 子路径导出 kuUtilsMarketingImports / kuUtilsMarketingPreset（共 22 个命名导出），用于 isFramePage / isMatchPage / isContainMatchPage / isPricingPage 等的 Nuxt auto-import 注入
  - @ku-utils/nuxt-module 注册 11 个新的 composable 名到 addImports（含 createEventBus 与平移的 10 个），并把 @ku-utils/hooks 加入 build.transpile 保证消费方 SSR 兼容性

  该 release 是 fe-picpopop 等业务项目从 xh-report / du-utils / du-composables 三个旧包整体切换到 @ku-utils/\* 的前置条件。
