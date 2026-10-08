---
name: filter-panel-demo
description: DoFilterPanel 专项 Demo 场景（按钮数 × 筛选项规模 / 布局折叠）。在 ka-admin 的 _example/doFilterPanel 增删场景、或扩展 simple-example-list 筛选演示 inputs 时使用。
---

# 筛选面板 Demo Skill

## 位置

- 场景路由：`src/modules/_example/doFilterPanel/_router/index.ts`（`scenarioRoute` 工厂）
- 场景页：`_module/do-filter-panel-scenario-demo.ts`（`input<DoFilterPanelDemoScenario>()` 直接吃路由 `data.doFilterPanel`，靠 `withComponentInputBinding`）
- 工厂：`_utils/do-filter-panel-demo.ts`
- 列表宿主：`simpleExample/_module/simple-example-list.ts`（演示 inputs）

## 场景字段

```ts
type DoFilterPanelDemoScenario = {
  buttonCount: 1 | 2 | 3 | 4; // 1=仅搜索；2=+重置；3=+导出；4=+更多
  filterCount: number; // >0 进入 Demo 形态，工厂生成筛选项
  line: number; // ka-do-filter-panel 折叠可见行数
  fillViewportLayout?: boolean; // 页根 height:100% 复现展开压表格
};
```

## 新增场景步骤

1. 在 `_router/index.ts` 用 `scenarioRoute(path, routeName, title, desc, scenario)` 追加一条
2. 在 `modules/_example/menus.ts`「筛选面板」`children` 追加 path，并在 `layouts/side-menu/side-menu-tree.ts` 的 `LEAF_TITLES` 登记标题
3. `title` / `desc` 用中文硬编码（无 i18n）

## simple-example-list 演示 inputs

| input                | 作用                     |
| -------------------- | ------------------------ |
| `filterButtonCount`  | 控制区按钮规模           |
| `filterFieldCount`   | 传入则工厂字段 Demo      |
| `filterLine`         | 折叠行数                 |
| `fillViewportLayout` | 根 class `fill-viewport` |

**禁止**再传页面标题 / 描述或挂 PageHeader（见 project-context）。业务列表页不传上述 inputs，保持内置筛选。

## 相关

- `ka-do-filter-panel` 的 `disableFold`：分组筛选关掉按行折叠
- 文档：`docs/admin-list-page-pattern.md` § 筛选面板 Demo
