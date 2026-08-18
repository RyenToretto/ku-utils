# @ku-utils/marketing

## 1.4.10

### Patch Changes

- 6fc081c: buildAdjDeepLink: append optional `biz_type` from pMaps (BOOK/SHORTPLAY) for client content routing

## 1.4.9

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.5.4

## 1.4.8

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.5.3

## 1.4.7

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.5.1

## 1.4.6

### Patch Changes

- Updated dependencies [1d8c8cf]
  - @ku-utils/utils@1.5.0

## 1.4.5

### Patch Changes

- Add `buildAdjDeepLink` and `copyAdjDeepLink` for encoded deep link clipboard copy.
- Updated dependencies
  - @ku-utils/utils@1.4.4

## 1.4.4

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.4.3

## 1.4.3

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.4.2

## 1.4.2

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.4.1

## 1.4.0

### Minor Changes

- paired: `PairedTrackerConfig.xh` 改为可选 + 新增 `onChannelUnavailable` 诊断回调
  - **`xh` 改为可选**：业务方在调用 `paired.track()` 之前/之后已显式调过 `$xhTracker(...)`
    时，不传 `xh` 字段即可避免重复上报。透传时仍按旧契约同步发一份给 xh，向后兼容。
    (历史 fe-picpopop 1.3.4 用法 `xh: $xhTracker` 导致 sign_up / login_success 在 xh CMS
    被打两次，CMS 数量被人为放大 2 倍。)
  - **新增 `onChannelUnavailable` 回调 + `PairedChannelUnavailableInfo` 类型**：
    业务方可在事件 mapping 配置了某通道、但该通道 adapter 缺失或 `isReady()` 返回
    false 时收到诊断通知，往 GA / 内部报警通道打一发事件。便于发现 trusted domain
    配置错误 / SDK 加载失败等隐性漏报问题（PM 2026-05 fb_pixel_unavailable 排查需求）。

    注意：FB Pixel 的 trusted domain 限制场景中，`fbq` 已存在（`isReady()` 返回 true）
    但所有 `fbq('track', ...)` 被 SDK 静默 drop，**这种"假 ready 真 drop"本回调
    无法捕获**，需在 `fbevents.js` 抛的 `[Meta pixel] X is unavailable` console.warn
    处单独拦截上报（参考 fe-picpopop `00_a2_pixel.ts` 的 `setupFbPixelUnavailableWatcher`）。

## 1.3.4

### Patch Changes

- 全量重写 skills/rules 文档：修正大量不存在的 API（createSmartScript→createSmartScriptTag/createAppsflyerTracker、tryWakeApp→appAndDownload、startDownload 参数修正、createAdjustTracker 参数修正 tokens 字段、createBootstrapScript 参数结构修正、createPairedTracker 完整用法）；补充落地页工具函数（getLandingParams/getDeviceToken/isTiktok/getFbp）；补充 createPixelScripts；新增 FB/TikTok 适配器用法

## 1.3.3

### Patch Changes

- feat(marketing): 新增 Cursor rules/skills 自动安装（postinstall）

## 1.3.2

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.3.2

## 1.3.1

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.3.1

## 1.3.0

### Minor Changes

- 84a8473: feat(marketing): 新增 Paired Tracker 模块 —— 多 SDK 漏斗配对上报

  新增 `paired/` 子模块，从根入口导出：
  - `createPairedTracker(config)` —— 一次调用 `track('purchase', params)` 自动分发到 xh + FB + TikTok + Adjust 四通道
  - `createFacebookPixelAdapter()` —— 包装 `fbq('track' | 'trackCustom')`
  - `createTiktokPixelAdapter()` —— 包装 `ttq.track | trackCustom`
  - `createAdjustWebAdapter()` —— 包装 `Adjust.trackEvent({ eventToken })`

  上报顺序：xh 业务上报 → fb → tiktok → adjust。任一 SDK throw 不影响其他通道。

  配套类型：`PairedTracker / PairedTrackerConfig / ChannelMap / TrackParams / SdkAdapter / XhReportFn`。

  设计目的：满足 PM 2026-05 决议「除 FB PageView 外，所有第三方上报必须与业务上报成对，且封装在同一 hook 内」，让业务方按事件维度声明 channel 映射，运行时一次调用统一分发，避免漏发与命名漂移。

### Patch Changes

- Updated dependencies [7f1ad63]
  - @ku-utils/utils@1.3.0

## 1.2.1

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.2.1

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

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.2.0
