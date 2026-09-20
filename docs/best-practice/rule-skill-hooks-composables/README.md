# rule-skill-hooks-composables — Hooks 约定

> **参考接入**：供本项目或其他项目接入时参考，非运行时依赖。

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

1. 通用能力进共享包（如 `@ku-utils/hooks`：`useLoading` / `useCountdown` / …）；业务专用放 `src/composables`。
2. 命名：`useXxx`；返回值结构稳定，避免隐式依赖全局单例（除非文档声明）。
3. 列表高度等：优先 `useMaxHeight` / 仓内 `useAdminTableMaxHeight`，禁止魔法数字散落。
4. 不在 hook 内做路由跳转/弹 message，除非该 hook 的职责就是「页面流程」。
5. 配套 `.cursor/skills/hooks/SKILL.md` + `hooks-guide.mdc`。

## 本仓落点

- `packages/hooks`
- 多仓存在的 `hooks` skill（应对齐到 `@ku-utils/hooks` 文档）

## 验收清单

- [ ] 新 hook 有简短 JSDoc 与导出入口
- [ ] 业务页不复制粘贴 loading/倒计时逻辑
