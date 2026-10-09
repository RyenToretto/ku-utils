# rule-skill-custom-columns — 自定义列（四端）

> **参考接入**：供本项目或其他项目接入时参考，非运行时依赖。  
> **本仓同步**：与四端 custom-columns rule + skill **双向同步**（见 [SYNC.md](../SYNC.md)）。

**类型**：Cursor Rule + Skill（`.mdc` + `SKILL.md`）

表格用列 schema 驱动列配置、持久化与表头操作区；Vue 3 / Vue 2 / React / Angular 四包交互 1:1。

## 推进接入分数

| 维度         | 分         | 说明                                     |
| ------------ | ---------- | ---------------------------------------- |
| 覆盖度       | 24/25      | skill 出现约 8 次，pattern 多仓          |
| 可执行性     | 24/25      | 分步 skill 成熟                          |
| 可移植性     | 22/25      | 依赖 `@ku-utils/custom-columns` 或等价包 |
| Agent 可触发 | 15/15      | 专用 skill description 清晰              |
| 单一真源     | 8/10       | 四包各自实现，靠四端 rule 对齐           |
| **合计**     | **93/100** |                                          |

## 最佳实践（精炼）

1. 依赖：`@ku-utils/custom-columns` + 入口 `import '@ku-utils/custom-columns/style'`。
2. 定义 `ColumnSchema[]`；Vue 3 用 `useSchemaColumnConfig` + `v-for` / `SchemaColumn`；Vue 2 用 `mixins: [useSchemaColumnConfig]` + `data()` 声明 `columnSchemas` / `schemaStorageKey` / `schemaVersion`（纯 JS，无 composable / `SchemaColumn` / `messages`）。
3. `TableWrap`（或等价）在需要时 `enable-do-header`，渲染 `DoTableHeader`。
4. 配置持久化 key 按「页面」隔离：`${storageKey}_${pathname}_sv${schemaVersion}`（Vue 2 另含应用版本号），**无用户维度**——多账号共用浏览器须隔离时，`storageKey` 自带用户 ID。
5. 硬约束（四端 rule 同条）：
   - `storageKey` 页面唯一，禁止手写 localStorage 或另建 `visibleColumns` 状态
   - `schemaVersion` 从 1 开始；字段重命名 / 删除 / 语义破坏性变化必须递增，新增字段通常不升
   - 叶子列 `prop` 全局稳定且唯一；复杂 schema 放同模块 `_utils`
   - 固定身份列与操作列写在 schema 循环外（Vue 2 另登记 `alwaysVisibleColumns`）
   - Vue 3 / Vue 2 / React 表格绑定 `tableRenderKey` 作 key 强制重建（Angular 由 `@for` track 处理）
   - 文案：Vue 3 / React / Angular 显式传全中文 `messages`；Vue 2 包内置中文
6. Demo 页放 Example 模块，生产构建门控禁止打进产物。
7. React（`@ku-utils/r-custom-columns`）：`useSchemaColumnConfig` 返回值经 `SchemaColumnConfigContext.Provider` 下发，`schemasToColumns` 生成 antd columns；`DoTableHeader` 内含配置抽屉，页面不再单独挂弹层。Vue / Vue2 / React 三包交互 1:1，改一侧须同步其余。
8. Angular（`@ku-utils/a-custom-columns`）：`createSchemaColumnConfig` 返回 signals 状态，经 `[kuSchemaColumnConfig]` 指令下发；nz-table 模板驱动，`headerRows()` / `visibleLeafSchemas()` 逐行逐列渲染 `ku-schema-header` / `ku-schema-cell`，插槽用 `ng-template[kuSchemaCellDef|kuSchemaHeaderDef]`；拖拽用 CDK DragDrop。Vue / Vue2 / React / Angular 四包交互 1:1。

| 能力       | Vue 3                    | Vue 2（mixin）                            | React                             | Angular                                      |
| ---------- | ------------------------ | ----------------------------------------- | --------------------------------- | -------------------------------------------- |
| 状态       | `useSchemaColumnConfig`  | `useSchemaColumnConfig` mixin             | `useSchemaColumnConfig` + Context | `createSchemaColumnConfig` + 指令上下文      |
| 列渲染     | `SchemaColumn` / `v-for` | `v-for` `el-table-column`（嵌套自写递归） | `schemasToColumns`                | `ku-schema-header` / `ku-schema-cell`        |
| 自定义单元 | 具名插槽                 | 具名插槽                                  | `cellRender` / `renderHeader`     | `kuSchemaCellDef` / `kuSchemaHeaderDef` 模板 |
| 透传列属性 | `elAttrs`                | `elAttrs`                                 | `antdAttrs`                       | `zorroAttrs`                                 |
| 拖拽       | vue-draggable-plus       | vuedraggable                              | sortablejs                        | `@angular/cdk/drag-drop`                     |

## 本仓落点

- `packages/custom-columns` / `packages/v2-custom-columns` / `packages/r-custom-columns` / `packages/a-custom-columns`
- 已知缺口：kv2 Demo 02–08 暂复用 `BASIC_COLUMN_SCHEMAS`，未演示嵌套表头 / 插槽等场景（见 [admin-parity](../admin-parity/)）
- `apps/kv3-admin/.cursor/skills/custom-columns/SKILL.md`、`apps/kv3-admin/.cursor/rules/custom-columns-vue3-pattern.mdc`
- `apps/kv2-admin/.cursor/skills/custom-columns/SKILL.md`、`apps/kv2-admin/.cursor/rules/custom-columns-vue2-pattern.mdc`
- `apps/kr-admin/.cursor/skills/custom-columns/SKILL.md`、`apps/kr-admin/.cursor/rules/custom-columns-react-pattern.mdc`
- `apps/ka-admin/.cursor/skills/custom-columns/SKILL.md`、`apps/ka-admin/.cursor/rules/custom-columns-angular-pattern.mdc`

## 验收清单

- [ ] 列表可打开列配置并刷新后保持
- [ ] skill 触发词能命中「自定义列」场景
