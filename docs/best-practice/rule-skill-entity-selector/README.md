# rule-skill-entity-selector — 实体选择器

> **已落地**：`apps/{kv3,kv2,kr,ka}-admin/.cursor/rules/entity-selector.mdc` + `skills/selector/SKILL.md`  
> **来源**：oversea `selector-best-practices`（取其精华：List 双模、写能力、筛项锁定、薄壳、Demo；去其糟粕：不强制 vue-i18n、不照搬 `0000`/`result`、不引入 HTTP 适配层）。  
> **同步**：改本模块或 `.cursor` 须双向更新，见 [SYNC.md](../SYNC.md)。

**类型**：Cursor Rule + Skill（`.mdc` + `SKILL.md`）

## 本仓落点

| 路径                                                                           | 说明                                                                                 |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `apps/kv3-admin/.cursor/rules/entity-selector.mdc`                             | List 双模硬约束                                                                      |
| `apps/kv3-admin/.cursor/skills/selector/SKILL.md`                              | 新建选择器步骤                                                                       |
| `schoolResource` List + DialogSelect + SchoolSelector                          | 金标样板                                                                             |
| `schoolSelector` Demo                                                          | `/example/school-selector/demo`                                                      |
| `apps/{kv2,kr,ka}-admin/.cursor/rules/entity-selector.mdc` + `skills/selector` | 四生同名；kr 抽屉由 `open` 受控 + `onConfirm`，ka 选择器为 CVA、抽屉由 `[open]` 驱动 |

## 推进接入分数

| 维度         | 分         | 说明                                |
| ------------ | ---------- | ----------------------------------- |
| 覆盖度       | 24/25      | oversea 金标细节已落入 rule         |
| 可执行性     | 24/25      | 命名 / 禁止项 / 写能力可检查        |
| 可移植性     | 18/25      | 依赖 TableWrap/DoFilterPanel 等同族 |
| Agent 可触发 | 14/15      | globs + skill                       |
| 单一真源     | 9/10       | kv3 合同与 oversea 分表写清         |
| **合计**     | **89/100** |                                     |

## 最佳实践（精炼）

### 何时必须用

挑业务实体（有 list/page、有展示名）→ `XxxSelector`。禁止手填 `*Id`。无选择器先建再引用。

### 分页 → List 双模

| 文件              | 职责                                                                 |
| ----------------- | -------------------------------------------------------------------- |
| `XxxList`         | **唯一**表格逻辑；`enableSelector` 分叉                              |
| `XxxSelector`     | 假 select + 开抽屉（受控值，可直接进表单项）                         |
| `DialogSelectXxx` | 薄壳，内挂 List；Vue 用 `show()`，React / Angular 由父级 `open` 受控 |

扩展名按栈：Vue `.vue`、React `.tsx`、Angular kebab-case `.ts`。**禁止**命名 `XxxSelect` / `XxxPicker` / `DrawerSelectXxx`；禁止 Dialog 内第二套表；禁止远程下拉截断首屏冒充分页。

### 选择器态硬约束

- 筛项同形保留；锁定用禁用态（`:disabled` / `disabled` / `[nzDisabled]`），禁条件渲染藏掉
- 有写接口 → 操作列表头「新建」同形文案按钮 + 行内编辑删除；禁卸 Dialog
- 加载失败必须回调（`load-failed` / `onLoadFailed` / `loadFailed`）+ 表体失败态与重试；薄壳勿再叠 loading
- 抽屉表高：Vue 用 `useDrawerPickListMaxHeight`；React / Angular 用 `useAdminTableMaxHeight` / `injectAdminTableMaxHeight` 并按 `inDialog` 调小基准

### 回传

`{ id: string, label, item }`；单选对象/`null`，多选数组。

### Demo

独立页：筛选单选+多选 + `DialogEditXxxSelectorDemo`。门控 `VITE_APP_USE_EXAMPLE`：开发 `1`，生产必须 `0`（Angular 为 `environment.useExample`，生产构建用 fileReplacements 换 stubs）。

## 验收清单

- [ ] 外键无手填 ID
- [ ] 分页实体只有一份 List 逻辑
- [ ] 选择器态可写（若接口支持）且筛项不藏
- [ ] Demo 三件套
- [ ] `pnpm --filter @ku-utils/<app> typecheck`
