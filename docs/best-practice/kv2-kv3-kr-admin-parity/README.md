# kv2-admin ↔ kv3-admin ↔ kr-admin 三生约定

> **强制**：管理端能力变更必须三端成对落地，禁止只改一侧。

## 应用对照

|                | kv3-admin                  | kv2-admin                                        | kr-admin                     |
| -------------- | -------------------------- | ------------------------------------------------ | ---------------------------- |
| 路径           | `apps/kv3-admin`           | `apps/kv2-admin`                                 | `apps/kr-admin`              |
| 框架           | Vue 3.5 + plugin-vue       | Vue **2.7** + plugin-vue2                        | React 19 + plugin-react      |
| UI             | Element Plus               | Element UI                                       | Ant Design 5                 |
| 路由           | vue-router@4               | vue-router@3                                     | react-router-dom@7           |
| 状态           | Pinia 3                    | Pinia **2.0.x**（Vue2 兼容）                     | Zustand                      |
| 自定义列       | `@ku-utils/custom-columns` | `@ku-utils/v2-custom-columns`（mixin）           | `@ku-utils/r-custom-columns` |
| 高度/版本 hook | `@ku-utils/hooks`          | 仓内 `src/lib/useMaxHeight` / `useVersionUpdate` | `@ku-utils/hooks-react`      |
| 开发端口       | **3111**                   | **3222**                                         | **3333**                     |
| 脚本           | `pnpm dev:admin`           | `pnpm dev:admin:v2`                              | `pnpm dev:admin:react`       |

## 视觉 / 皮肤对齐（强制）

- **唯一金标** `@ku-utils/skin`（tome）；禁止 apps 自造第二套色板。
- kv3：Element Plus 原生消费 `--el-*`（skin 已桥接）。
- kv2：Element UI chalk 之后加载 `element-ui-bridge.scss`。
- kr：Ant Design 主题由 `plugins/antdTheme.ts` 读 `@ku-utils/skin/tokens` 明暗色值生成（`ConfigProvider theme`）；`antd-ku-bridge.scss` 只放 token 覆盖不到的结构样式，均读 `--ku-*`。
- kr：确认框 / 提示一律走 `@/plugins/antdApp`（antd `<App>` 上下文实例），禁止 `Modal.confirm` / `message.xxx` 静态方法——React 19 下不渲染且不跟随暗色；`main.tsx` 引入 `@ant-design/v5-patch-for-react-19`。
- **禁止**页级 `PageHeader` / title / subtitle（三端一致）。
- `.domain-module-main` padding 四边一致（20px）；页内首块勿再叠 `margin-top`，用父级 `gap`。

## 必须成对的资产

1. `src/modules/_example/**` 各 Example（路径与侧栏一致）
2. `src/components/**`、列表 hooks（语义同形；实现可因栈差异）
3. `apps/*/docs/admin-list-page-pattern.md`
4. `apps/*/.cursor/rules/**`、`skills/**`
5. Mock 信封与路由 path

## Agent / 开发流程

1. 改列表/选择器/Mock/自定义列时：**同时打开**三端 `project-context.mdc`
2. 新增 Example：先更新本清单与三端 menus，再实现
3. 禁止兼容桥接糊弄 API 差异；按各栈金标改到位
4. 验收：三端关键路径用 Chrome Debug + Playwright 点通后再合入（端口 3111/3222/3333）

## PARITY 模块清单（一期）

- [x] schoolResource + SchoolSelector Demo
- [x] clazzManage / clubActivity
- [x] simpleExample（含 batch-select）
- [x] nestMenus
- [x] uiKit 全路径
- [x] doFilterPanel 场景
- [x] customColumns 01–08（Vue3 composable / Vue2 mixin / React hook）
- [x] rules / skills / admin-list-page-pattern
