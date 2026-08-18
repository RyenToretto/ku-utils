# @ku-utils/nuxt-module

## 1.3.0

### Minor Changes

- 新增 DuLiquidGlass 与 DuLiquidFloatingBar 液态玻璃组件，并在 Nuxt 模块中注册新组件。

## 1.2.8

### Patch Changes

- feat(hooks): useVersionUpdate 新增 syncDataset 选项，首次建立基线和每次检测后将 commitId 同步写入 document.documentElement.dataset（data-app-version / data-latest-app-version / data-app-update-available），SSR 环境自动跳过；feat(nuxt-module): 将 useVersionUpdate 加入 Nuxt 自动导入列表，website SSR 可直接使用

## 1.2.5

### Patch Changes

- 修复 skills 文档中继承自 hooks 的 API 错误：useCountdown remaining→count、useBreakpoint 返回值修正为 {sm,md,lg,xl,xxl}、useDialogState open/close→show/hide、修正 v-model:visible 绑定变量

## 1.2.4

### Patch Changes

- feat(nuxt-module): 新增 Cursor rules/skills 自动安装（postinstall）

## 1.2.0

### Minor Changes

- 463fb9d: 批量升级至 1.1.0：统一 TypeScript 依赖声明版本，配合文档完善发布
- 平移 du-composables 全部 Vue 3 Composables 至 @ku-utils/hooks，并为 @ku-utils/utils 与 @ku-utils/marketing 新增 ./auto-import 子路径
  - @ku-utils/hooks 新增 10 个 composables：useDeviceDetect / useIntersection / useDialogState / usePopover / useDomState / useScrollbarStatus / useParentScrollbarStatus / useScrollGapSync / useResponsiveColumns / useResponsiveItemGap
  - @ku-utils/hooks 重写 useEventBus 为兼容版本：带泛型、createEventBus 工厂、EventBusInstance 类型导出、SSR fallback、scope 缓存（保持 useEventBus() 零参调用向后兼容）
  - @ku-utils/hooks 新增 types.ts 聚合导出 EventBusInstance / EventCallback / IntersectionCallback / IntersectionOptions / UseDeviceDetectOptions / ColumnBreakpoints / UseResponsiveColumnsOptions / UseResponsiveItemGapOptions
  - @ku-utils/utils 新增 ./auto-import 子路径导出 kuUtilsUtilsImports / kuUtilsUtilsPreset（共 153 个命名导出），并新增 scripts/generate-auto-import.mjs 在 build 后自动同步
  - @ku-utils/marketing 新增 ./auto-import 子路径导出 kuUtilsMarketingImports / kuUtilsMarketingPreset（共 22 个命名导出），用于 isFramePage / isMatchPage / isContainMatchPage / isPricingPage 等的 Nuxt auto-import 注入
  - @ku-utils/nuxt-module 注册 11 个新的 composable 名到 addImports（含 createEventBus 与平移的 10 个），并把 @ku-utils/hooks 加入 build.transpile 保证消费方 SSR 兼容性

  该 release 是 fe-picpopop 等业务项目从 xh-report / du-utils / du-composables 三个旧包整体切换到 @ku-utils/\* 的前置条件。
