# rule-skill-custom-columns — Vue3 自定义列

> **参考接入**：供本项目或其他项目接入时参考，非运行时依赖。  
> **本仓同步**：与 kv3-admin custom-columns rule + skill **双向同步**（见 [SYNC.md](../SYNC.md)）。

**类型**：Cursor Rule + Skill（`.mdc` + `SKILL.md`）

Element Plus 表格用 schema + `useSchemaColumnConfig` 驱动列配置、持久化与表头操作区。

## 推进接入分数

| 维度         | 分         | 说明                                     |
| ------------ | ---------- | ---------------------------------------- |
| 覆盖度       | 24/25      | skill 出现约 8 次，pattern 多仓          |
| 可执行性     | 24/25      | 分步 skill 成熟                          |
| 可移植性     | 22/25      | 依赖 `@ku-utils/custom-columns` 或等价包 |
| Agent 可触发 | 15/15      | 专用 skill description 清晰              |
| 单一真源     | 8/10       | 仍有 `@do-power` 旧拷贝                  |
| **合计**     | **93/100** |                                          |

## 最佳实践（精炼）

1. 依赖：`@ku-utils/custom-columns` + 入口 `import '@ku-utils/custom-columns/style'`。
2. 定义 `ColumnSchema[]`；列表用 `useSchemaColumnConfig` + `v-for` / `SchemaColumn`。
3. `TableWrap`（或等价）在需要时 `enable-do-header`，渲染 `DoTableHeader`。
4. 配置持久化 key 按「用户 + 页面」隔离，禁止全局串页。
5. 配套 rule：`custom-columns-vue3-pattern.mdc`（固定列、slot、嵌套表头约定）。
6. Demo 页放 Example 模块，生产构建门控禁止打进产物。

## 本仓落点

- `packages/custom-columns`
- `apps/kv3-admin/.cursor/skills/custom-columns/SKILL.md`
- `apps/kv3-admin/.cursor/rules/custom-columns-vue3-pattern.mdc`

## 验收清单

- [ ] 列表可打开列配置并刷新后保持
- [ ] skill 触发词能命中「自定义列」场景
