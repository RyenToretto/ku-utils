# kv3-admin ↔ kv2-admin ↔ kr-admin ↔ ka-admin 四生约定

> **强制**：管理端能力变更必须四端成对落地，禁止只改一侧。金标 kv3；kr / ka 先对齐 kv3，再互相对图。

## 应用对照

|                | kv3-admin                  | kv2-admin                                        | kr-admin                     | ka-admin                                                               |
| -------------- | -------------------------- | ------------------------------------------------ | ---------------------------- | ---------------------------------------------------------------------- |
| 路径           | `apps/kv3-admin`           | `apps/kv2-admin`                                 | `apps/kr-admin`              | `apps/ka-admin`                                                        |
| 框架           | Vue 3.5 + plugin-vue       | Vue **2.7** + plugin-vue2                        | React 19 + plugin-react      | Angular **22**（standalone + zoneless + signals）                      |
| 构建           | Vite                       | Vite                                             | Vite                         | `@angular-builders/custom-esbuild`（application）                      |
| UI             | Element Plus               | Element UI                                       | Ant Design 5                 | ng-zorro-antd 22                                                       |
| 路由           | vue-router@4               | vue-router@3                                     | react-router-dom@7           | `@angular/router`（`withComponentInputBinding`）                       |
| 状态           | Pinia 3                    | Pinia **2.0.x**（Vue2 兼容）                     | Zustand                      | signals（`stores/*.ts` 注入式）                                        |
| 自定义列       | `@ku-utils/custom-columns` | `@ku-utils/v2-custom-columns`（mixin）           | `@ku-utils/r-custom-columns` | `@ku-utils/a-custom-columns`                                           |
| 高度/版本 hook | `@ku-utils/hooks`          | 仓内 `src/lib/useMaxHeight` / `useVersionUpdate` | `@ku-utils/hooks-react`      | `@ku-utils/hooks-angular`（`injectMaxHeight` / `injectVersionUpdate`） |
| 列表状态       | `useTableQuery`            | `useTableQuery`                                  | `useTableQuery`              | `injectTableQuery`                                                     |
| 文件命名       | `PascalCase.vue`           | `PascalCase.vue`                                 | `PascalCase.tsx`             | `kebab-case.ts`（选择器前缀 `ka-`）                                    |
| Node           | ≥ 20                       | ≥ 20                                             | ≥ 20                         | `^22.22.3 \|\| ^24.15.0 \|\| >=26`                                     |
| 开发端口       | **3111**                   | **3222**                                         | **3333**                     | **3444**                                                               |
| 脚本           | `pnpm dev:admin`           | `pnpm dev:admin:v2`                              | `pnpm dev:admin:react`       | `pnpm dev:admin:angular`                                               |

## 视觉 / 皮肤对齐（强制）

- **唯一金标** `@ku-utils/skin`（tome）；禁止 apps 自造第二套色板。
- kv3：Element Plus 原生消费 `--el-*`（skin 已桥接）。
- kv2：Element UI chalk 之后加载 `element-ui-bridge.scss`。
- kr：Ant Design 主题由 `plugins/antdTheme.ts` 读 `@ku-utils/skin/tokens` 明暗色值生成（`ConfigProvider theme`）；`antd-ku-bridge.scss` 只放 token 覆盖不到的结构样式，均读 `--ku-*`。
- kr：确认框 / 提示一律走 `@/plugins/antdApp`（antd `<App>` 上下文实例），禁止 `Modal.confirm` / `message.xxx` 静态方法——React 19 下不渲染且不跟随暗色；`main.tsx` 引入 `@ant-design/v5-patch-for-react-19`。
- ka：`scripts/generate-zorro-theme.mjs` 用 less 编译 ng-zorro 源样式，变量映射到 `--ku-*`，产物 `src/assets/styles/generated/ng-zorro-ku.css`（gitignore，`prepare:assets` 生成）；less 表达不了的结构细节进 `zorro-ku-bridge.scss`。
- ka：确认框统一 `injectConfirm()`，提示用 `NzMessageService`；日期适配 `provideNzDateFnsAdapter`（`NZ_DATE_LOCALE` 已废弃，v23 移除）。
- ka ↔ kr 固定换算：ng-zorro modal 无 content 级 padding → ka 内距 = kr `bodyStyle` + 16；antd v5 `Paragraph` 是 `div` → ka 用 `<div nz-typography>`；el plain / kr outlined → ka `btn-plain-*`。
- **禁止**页级 `PageHeader` / title / subtitle（四端一致）。
- `.domain-module-main` padding 四边一致（20px）；页内首块勿再叠 `margin-top`，用父级 `gap`。
- 侧栏多级以 kv3 `app-shell.scss` `.side-menu` 为准：二级起左缘 22 / 34 / 46、引导线 28 / 40 / 52、各级右缘同为 209、激活链与悬停时箭头 / 图标高亮。kr / ka 用 `.ant-menu-sub` 层级选择器补齐（标题宽 `calc(100% - 20px)`、箭头 `inset-inline-end: 26px`）；ka 递归模板投影的 `nz-submenu` 查不到子项，需显式绑定 `ant-menu-submenu-selected`；kv2 Element UI 子项默认 `min-width: 200px` 须清零。
- body 不设底色（页面底只在 html 的 `--ku-bg-page`）；ng-zorro reset 给 body 的卡片底须覆盖为 `transparent`。

## 必须成对的资产

1. `src/modules/_example/**` 各 Example（路径与侧栏一致）
2. `src/components/**`、列表 hooks / 注入函数（语义同形；实现可因栈差异）
3. `apps/*/docs/admin-list-page-pattern.md`
4. `apps/*/.cursor/rules/**`、`skills/**`（四端各 8 rules + 3 skills）
5. Mock 信封与路由 path
6. 自定义列四包（`custom-columns` / `v2-custom-columns` / `r-custom-columns` / `a-custom-columns`）交互 1:1

## Agent / 开发流程

1. 改列表/选择器/Mock/自定义列时：**同时打开**四端 `project-context.mdc`
2. 新增 Example：先更新本清单与四端 menus，再实现
3. 禁止兼容桥接糊弄 API 差异；按各栈金标改到位
4. 验收：四端关键路径用 Chrome Debug + Playwright 点通后再合入（端口 3111/3222/3333/3444）；截图 `.playwright-mcp/logs/`（ka 在 `logs/ka/`）

## PARITY 模块清单

| 模块                                     | kv3           | kv2      | kr      | ka                |
| ---------------------------------------- | ------------- | -------- | ------- | ----------------- |
| schoolResource + SchoolSelector Demo     | ✅            | ✅       | ✅      | ✅                |
| clazzManage / clubActivity               | ✅            | ✅       | ✅      | ✅                |
| simpleExample（含 batch-select）         | ✅            | ✅       | ✅      | ✅                |
| nestMenus                                | ✅            | ✅       | ✅      | ✅                |
| uiKit 全路径                             | ✅            | ✅       | ✅      | ✅                |
| doFilterPanel 9 场景                     | ✅            | ✅       | ✅      | ✅                |
| customColumns 01–08                      | ✅ composable | ✅ mixin | ✅ hook | ✅ signals + 指令 |
| rules / skills / admin-list-page-pattern | ✅            | ✅       | ✅      | ✅                |
