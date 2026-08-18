# @ku-utils/hooks

## 1.5.23

### Patch Changes

- fix(useMaxHeight): 计算结果向下取整并预留 1px，消除亚像素外层滚动条

## 1.5.22

### Patch Changes

- fix(useMaxHeight): 仅在 flex 容器上根据 flex-direction 跳过横向兄弟高度累加

  非 flex 元素的 computed flex-direction 默认也是 row，会误跳过分页等纵向兄弟，导致表格 max-height 偏大、页面外层出现滚动条。

## 1.5.21

### Patch Changes

- 467697e: fix(useVersionUpdate): dataset 仅保留 version-time，展示文案由 getVersionTime 决定

  不再写入 data-latest-app-version / data-app-version，并主动清理旧属性；推荐 getVersionTime 返回 `提交版本:提交时间`（如 `5f3f421:2026-08-06 19:43:02`）。

## 1.5.20

### Patch Changes

- fix(useMaxHeight): 延迟渲染表格时重新解析目标元素并重试测量
  - update 内重新 querySelector，覆盖 v-if 空态→表格切换
  - target 优先在 contain 内查找，避免多表页误命中
  - onMounted 始终注册监听；contain 未就绪时先观察 document.body

## 1.5.17

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.5.4

## 1.5.16

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.5.3

## 1.5.13

### Patch Changes

- fix(useVersionUpdate): 简化 dataset 写入策略——两版本一致时只保留 latest-\* 属性，有更新时才额外写入 data-app-version / data-app-version-time 用于版本对比，避免相同值冗余重复

## 1.5.12

### Patch Changes

- feat(useVersionUpdate): 新增 getVersionTime 选项，支持将 versionTime 写入 html dataset（data-app-version-time / data-latest-app-version-time），格式由调用方传入（推荐 YYYY-MM-DD HH:mm:ss）

## 1.5.11

### Patch Changes

- feat(hooks): useVersionUpdate 新增 syncDataset 选项，首次建立基线和每次检测后将 commitId 同步写入 document.documentElement.dataset（data-app-version / data-latest-app-version / data-app-update-available），SSR 环境自动跳过；feat(nuxt-module): 将 useVersionUpdate 加入 Nuxt 自动导入列表，website SSR 可直接使用

## 1.5.10

### Patch Changes

- 新增 `useVersionUpdate` Vue 3 composable：支持通用静态版本检测，通过轮询和页面可见性变化检测 SPA 新版本，`hasUpdate` 暴露更新状态，`refreshForUpdate` 执行刷新。

## 1.5.9

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.5.1

## 1.5.8

### Patch Changes

- Updated dependencies [1d8c8cf]
  - @ku-utils/utils@1.5.0

## 1.5.4

### Patch Changes

- Fix useMaxHeight to account for vertical margins when calculating table max height.

## 1.5.3

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.4.3

## 1.5.2

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.4.2

## 1.5.1

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.4.1

## 1.3.7

### Patch Changes

- 修复 skills/rules 文档中的 API 错误：useCountdown 返回值 remaining→count/isRunning→isActive、useInterval 返回值 pause/resume→isActive/start/stop、useDialogState 方法名 open/close→show/hide、useBreakpoint 返回值结构修正（sm/md/lg/xl/xxl 非 isMobile/current）、useEventBus 签名完全修正（scope 字符串而非 bus 实例+事件回调三参数）

## 1.3.6

### Patch Changes

- feat(hooks): 新增 Cursor rules/skills 自动安装（postinstall）

## 1.3.5

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.3.2

## 1.3.4

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.3.1

## 1.3.0

### Minor Changes

- 7cbb842: feat(hooks): 新增 `useFocusTrap` 焦点陷阱组合式函数

  用于 Dialog / Modal / Drawer 的无障碍合规（WCAG 2.1 AA / ARIA APG 模态对话框模式）：

  ```ts
  const panelRef = ref<HTMLElement | null>(null);
  useFocusTrap(panelRef, { escClose: () => emit('close') });
  ```

  行为：
  - 容器出现时自动 focus 第一个可聚焦元素并保存当前 activeElement（autoFocus 可关）
  - Tab / Shift+Tab 在容器内循环
  - Esc 触发 escClose 回调
  - 容器消失时还原焦点到打开前的元素（restoreFocus 可关）

  支持 `Ref<HTMLElement | null>` 或 `() => HTMLElement | null` 两种 target source。

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
