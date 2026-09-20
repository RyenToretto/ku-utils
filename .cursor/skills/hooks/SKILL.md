---
name: hooks
description: >-
  使用 @ku-utils/hooks（useLoading/useRequest/usePagination/useMaxHeight/useClipboard 等）
  或评估新 composable 放共享包还是 apps 仓内。处理异步、分页、表格高度、剪贴板、倒计时时使用。
---

# @ku-utils/hooks Skill

## 何时用本 skill

- 业务页要 loading / 请求 / 分页 / 倒计时 / 剪贴板 / 视口高度
- 犹豫「写进 packages/hooks 还是 apps/composables」
- kv3-admin 表格 / 抽屉 maxHeight

## Step 1：查现成 API

```bash
# 浏览导出
sed -n '1,80p' packages/hooks/src/index.ts
```

常用：

| Hook             | 场景                                                        |
| ---------------- | ----------------------------------------------------------- |
| `useLoading`     | 按钮/区块加载                                               |
| `useRequest`     | 异步请求 + loading/error                                    |
| `usePagination`  | 页码分页                                                    |
| `useMaxHeight`   | 视口剩余高度                                                |
| `useClipboard`   | 复制（与 `@ku-utils/utils` setCopy 等配合时以项目既有为准） |
| `useCountdown`   | 验证码倒计时                                                |
| `useDialogState` | 弹层可见与载荷                                              |

## Step 2：选型

- **跨 Vue3 应用可复用** → 加到 `packages/hooks`，发版后消费方升版本（本仓 apps 用 `workspace:*`）
- **仅管理端表格壳** → `apps/kv3-admin/src/composables`（如 `useAdminTableMaxHeight`）

## Step 3：kv3-admin 高度

```ts
// 页面表格
const { maxHeight } = useAdminTableMaxHeight('.page-xxx');

// 抽屉点选表 — 勿用上面的页面 hook
const { maxHeight, remeasureAfterLayout } = useDrawerPickListMaxHeight('page-table');
```

## Step 4：验收

- 无手写 `loading = ref(false)` 重复样板（已有 hook 覆盖时）
- 弹层表高度不写死 px、不误用页面 maxHeight hook

规则摘要：`.cursor/rules/hooks-guide.mdc`。  
最佳实践文档：`docs/best-practice/rule-skill-hooks-composables/`。
