---
name: filter-panel-demo
description: DoFilterPanel 专项 Demo 场景（按钮数 × 筛选项规模 / 布局折叠）。在 kv3-admin 的 _example/doFilterPanel 增删场景、或扩展 SimpleExampleList 筛选演示 props 时使用。
---

# 筛选面板 Demo Skill

## 位置

- 场景路由：`src/modules/_example/doFilterPanel/_router/index.ts`
- 场景页：`_module/DoFilterPanelScenarioDemo.vue`（读 `route.meta.doFilterPanel`）
- 工厂：`_utils/doFilterPanelDemo.ts`
- 列表宿主：`simpleExample/.../SimpleExampleList.vue`（演示 props）

## 场景字段

```ts
type DoFilterPanelDemoScenario = {
  buttonCount: 1 | 2 | 3 | 4; // 1=仅搜索；2=+重置；3=+导出；4=+更多
  filterCount: number; // >0 进入 Demo 形态，工厂生成筛选项
  line: number; // DoFilterPanel 折叠可见行数
  fillViewportLayout?: boolean; // 页根 height:100% 复现展开压表格
};
```

## 新增场景步骤

1. 在 `_router/index.ts` 用 `scenarioRoute(path, name, title, desc, scenario)` 追加一条
2. 在 `_example/index.vue` 侧栏「筛选面板」`children` 追加对应 path
3. `meta.title` / `meta.desc` 用中文硬编码（无 i18n）

## SimpleExampleList 演示 props

| prop                            | 作用                     |
| ------------------------------- | ------------------------ |
| `pageTitle` / `pageDescription` | 覆盖 PageHeader          |
| `filterButtonCount`             | #ctl 按钮规模            |
| `filterFieldCount`              | 传入则工厂字段 Demo      |
| `filterLine`                    | 折叠行数                 |
| `fillViewportLayout`            | 根 class `fill-viewport` |

业务列表页不传上述 props，保持内置 3 项筛选。

## 相关

- `DoFilterPanel.disableFold`：分组筛选关掉按行折叠
- 文档：`docs/admin-list-page-pattern.md` § 筛选面板 Demo
