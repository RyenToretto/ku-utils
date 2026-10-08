# rule-skill-hooks-composables — Hooks 约定

> **参考接入**：供本项目或其他项目接入时参考，非运行时依赖。  
> **本仓同步**：与 [`.cursor/rules/hooks-guide.mdc`](../../../.cursor/rules/hooks-guide.mdc) + [`.cursor/skills/hooks/SKILL.md`](../../../.cursor/skills/hooks/SKILL.md) **双向同步**（见 [SYNC.md](../SYNC.md)）。

**类型**：Cursor Rule + Skill（`.mdc` + `SKILL.md`）

Vue 3 composables 的放置、命名、与业务页面协作方式。

## 推进接入分数

| 维度         | 分         | 说明                           |
| ------------ | ---------- | ------------------------------ |
| 覆盖度       | 22/25      | hooks skill/rule 多仓          |
| 可执行性     | 21/25      | 需结合本仓 hooks 目录          |
| 可移植性     | 20/25      | 共享包 vs 仓内 composables     |
| Agent 可触发 | 14/15      | 专用 skill                     |
| 单一真源     | 8/10       | `@ku-utils/hooks` 为本生态真源 |
| **合计**     | **85/100** |                                |

## 最佳实践（精炼）

1. 通用能力进共享包（如 `@ku-utils/hooks`：`useLoading` / `useCountdown` / …）；业务专用放 `src/composables`。跨栈能力（`useMaxHeight` / `useVersionUpdate`）同步落 `@ku-utils/hooks-react` 与 `@ku-utils/hooks-angular`。
2. 命名：Vue / React `useXxx`；Angular `injectXxx`（返回 Signal，注入上下文调用，`DestroyRef` 清理）；返回值结构稳定，避免隐式依赖全局单例（除非文档声明）。
3. 管理端列表查询：`apps/kv3-admin` 用 `useTableQuery`（abort / `tableLoadFailed` / `refresh({ silent })`）；**不要**再引入他仓分页适配层。
4. 列表高度：优先 `useMaxHeight` / 仓内 `useAdminTableMaxHeight`；抽屉点选用 `useDrawerPickListMaxHeight`，禁止魔法数字散落。
5. 不在 hook 内做路由跳转/弹 message，除非该 hook 的职责就是「页面流程」。
6. 配套 `.cursor/skills/hooks/SKILL.md` + `hooks-guide.mdc`。

## 本仓落点

- `packages/hooks`、`packages/hooks-react`、`packages/hooks-angular`
- [`.cursor/rules/hooks-guide.mdc`](../../../.cursor/rules/hooks-guide.mdc)
- [`.cursor/skills/hooks/SKILL.md`](../../../.cursor/skills/hooks/SKILL.md)
- kv3-admin：`src/composables/useTableQuery.ts`、`useAdminTableMaxHeight.ts`、`useDrawerPickListMaxHeight.ts` 等
- ka-admin：`src/composables/inject-table-query.ts`、`inject-admin-table-max-height.ts`、`inject-flex-columns.ts`、`inject-row-selector.ts`（注入函数，须在注入上下文调用）

## 验收清单

- [ ] 新 hook 有简短 JSDoc 与导出入口
- [ ] 业务页不复制粘贴 loading/倒计时逻辑
