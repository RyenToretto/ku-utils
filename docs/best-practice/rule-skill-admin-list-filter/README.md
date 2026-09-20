# rule-skill-admin-list-filter — 管理端列表 / 筛选 / Mock

> **参考接入**：供本项目或其他项目接入时参考，非运行时依赖。  
> **本仓同步**：与 kv3-admin `project-context.mdc` + `filter-panel-demo` skill **双向同步**（见 [SYNC.md](../SYNC.md)）。

**类型**：Cursor Rule + Skill（`.mdc` + `SKILL.md`）

列表页骨架、`DoFilterPanel`、表格高度、Mock 隔离与信封约定。

## 推进接入分数

| 维度         | 分         | 说明                                |
| ------------ | ---------- | ----------------------------------- |
| 覆盖度       | 20/25      | creative / ssp / kv3-admin 等       |
| 可执行性     | 22/25      | 有 list-page 文档 + filter skill    |
| 可移植性     | 18/25      | 组件名/信封码因仓而异               |
| Agent 可触发 | 12/15      | filter-panel-demo + project-context |
| 单一真源     | 8/10       | kv3-admin docs 较新                 |
| **合计**     | **80/100** |                                     |

## 最佳实践（精炼）

1. 目录：`_router` / `_api` / `_map` / `_mock` / `_module` / `*Layer.vue`。
2. 表格：`TableWrap` + `do-inner-scroller page-table` + `max-height` + `border`/`stripe`。
3. 筛选：`DoFilterPanel`；placeholder「不限」；日期在前、radio 在后；分组 / 非表单节点用 `disableFold`；`#ctl` 横向贴卡片右下；loading 图标绝对定位勿撑宽按钮。
4. `v-loading` 遮罩用浅色 loading token（`--ku-loading-bg` → `--el-mask-color`）；勿用弹层深色 overlay。
5. Mock：**业务禁止 import mock**；Mock 只走插件加载；信封字段与成功码全仓统一。
6. Example：`DomainModuleShell`；开发态 `VITE_APP_USE_EXAMPLE=1`，生产 `forbid-example-in-bundle`。
7. 筛选 Demo：按 `buttonCount` × `filterCount` × `line` 在 `doFilterPanel` 增场景；步骤见 filter-panel-demo skill。

## 本仓落点

- [`apps/kv3-admin/.cursor/rules/project-context.mdc`](../../../apps/kv3-admin/.cursor/rules/project-context.mdc)
- [`apps/kv3-admin/.cursor/skills/filter-panel-demo/SKILL.md`](../../../apps/kv3-admin/.cursor/skills/filter-panel-demo/SKILL.md)
- `apps/kv3-admin/docs/admin-list-page-pattern.md`
- `apps/kv3-admin/src/components/DoFilterPanel.vue`

## 验收清单

- [ ] 新列表页可按文档抄目录骨架
- [ ] Mock 与页面无反向依赖
- [ ] 筛选 loading / 表格 mask 视觉正常
