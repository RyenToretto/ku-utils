# rule-project-structure — 目录结构与命名

> **参考接入**：管理端 Vue 仓目录约定。  
> **来源**：oversea `project-structure.mdc` + jx-dsp 模块组织节。  
> **参考模块**：本仓 ku-utils 未独立落地；落地后登记 [SYNC.md](../SYNC.md)。

**类型**：Cursor Rule（`.mdc`）

## 推进接入分数

| 维度         | 分         | 说明                              |
| ------------ | ---------- | --------------------------------- |
| 覆盖度       | 22/25      | jx-dsp / oversea / kv3-admin 同构 |
| 可执行性     | 24/25      | 骨架可抄                          |
| 可移植性     | 20/25      | 域名因仓而异                      |
| Agent 可触发 | 13/15      | always 或 `src/modules/**`        |
| 单一真源     | 9/10       | 与 list/selector 分工清晰         |
| **合计**     | **88/100** |                                   |

## 最佳实践（精炼）

### 就近原则

`_` 前缀目录 = 该层共享物，放在**最小共享范围**：单页 → `_module`；子域多处 → 子域 `_xxx`；整域 → 域根；跨域 → `src/components|api|composables|maps`。先就近，第二使用方再上提。

### 子业务标准骨架

```text
src/modules/<域>/<子业务>/
├── _api/          # requestXxx 唯一请求入口
├── _map/          # 可选；聚合进域 _maps → $MAPS
├── _mock/         # 仅 Mock 插件加载
├── _module/       # XxxList / DialogXxx / XxxSelector
└── XxxLayer.vue   # 薄壳：单根 page-*；只挂 List + 根内 Dialog
```

- **`_router` / `_locales`**：仅域根（glob 扫域级）
- **禁止**为旧 path 保留空壳域；redirect 挂现行域 `_router`
- `src/views/` 只留 403/404/会话失效

### 命名

| 用途              | 命名                                             |
| ----------------- | ------------------------------------------------ |
| 路由落点          | `XxxLayer.vue`                                   |
| 表格              | `_module/XxxList.vue`                            |
| 弹层（含 drawer） | **`DialogXxx.vue`**（禁 `DrawerXxx`）            |
| 选择器            | `XxxSelector.vue` + `DialogSelectXxx.vue`        |
| HTTP              | `_api` 内 **`requestXxx`**（禁 `fetch*` 作入口） |

### 具象化命名（变量）

禁泛称：`form`→`loginForm`，`filters`→`listFilters`，`loading`→`tableLoading`/`submitLoading`，`visible`→`dialogVisible`。Vue 标准 `router`/`route`/`emit` 可不改。

### `v-loading`

绑在 `el-table`（或根为 table 的 List）上；禁挂 `TableWrap`；`DoFilterPanel` 的 loading 只禁用搜索按钮。

## 验收清单

- [ ] 新页面具备 Layer + `_module` 分离
- [ ] 无 `DrawerXxx.vue` 新文件
- [ ] 业务页不静态 import `_example`
