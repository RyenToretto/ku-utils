# rule-project-structure — 目录结构与命名

> **已落地**：`apps/{kv3,kv2,kr,ka}-admin/.cursor/rules/project-structure.mdc`  
> **来源**：oversea `project-structure.mdc` + jx-dsp 模块组织节。  
> **同步**：改本模块或 `.mdc` 须双向更新，见 [SYNC.md](../SYNC.md)。

**类型**：Cursor Rule（`.mdc`）

## 本仓落点

| 路径                                                         | 说明                                                          |
| ------------------------------------------------------------ | ------------------------------------------------------------- |
| `apps/kv3-admin/.cursor/rules/project-structure.mdc`         | glob `src/modules/**/*`；就近原则 + Layer/_module + DialogXxx |
| `apps/kv3-admin/.cursor/rules/project-context.mdc`           | 瘦身壳仍保留骨架摘要，细则以本 rule 为准                      |
| `apps/{kv2,kr,ka}-admin/.cursor/rules/project-structure.mdc` | 四生同名；ka 为 kebab-case `xxx-layer.ts` / `dialog-xxx.ts`   |

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
├── _map/          # 可选；聚合进域 _maps → 全局字典（Vue `$MAPS`；React / Angular `@/maps`）
├── _mock/         # 仅 Mock 插件加载
├── _module/       # XxxList / DialogXxx / XxxSelector
├── _router/       # 本子业务路由（default export）
└── XxxLayer.vue   # 薄壳：单根 page-*；只挂 List + 根内 Dialog
```

- **`_router`**：子业务只导出本业务路由；域根 `_router/index.ts` 静态 import 汇总各子业务
- **禁止**为旧 path 保留空壳域；redirect 挂现行域 `_router`
- `src/views/` 只放全局状态页（无权限 / 账号异常 / 登出 / 即将上线等），业务页一律在 `src/modules`
- `_example` 只在开发态装配（Vite `VITE_APP_USE_EXAMPLE=1` / Angular `environment.useExample`）；生产构建关闭，并由构建插件 `forbid-example-in-bundle` 拦截残留

### 命名

| 用途              | 命名                                                   |
| ----------------- | ------------------------------------------------------ |
| 路由落点          | `XxxLayer.vue`                                         |
| 表格              | `_module/XxxList.vue`                                  |
| 弹层（含 drawer） | **`DialogXxx.vue`**（禁 `DrawerXxx`）                  |
| 选择器            | `XxxSelector.vue` + `DialogSelectXxx.vue`              |
| HTTP              | `_api` 内 **`requestXxx`**（禁 `fetchXxx` 作请求入口） |

React 端扩展名为 `.tsx`；Angular 端 kebab-case（`xxx-layer.ts` / `dialog-xxx.ts` / `xxx-selector.ts`）。

### 具象化命名（变量）

禁泛称：`form`→`loginForm`，`filters`→`listFilters`，`loading`→`tableLoading`/`submitLoading`，`visible`→`dialogVisible`（React / Angular 为 `open` / `editOpen`）。Vue 标准 `router`/`route`/`emit` 可不改。

### 表格 loading

绑在表格本身（`el-table` 的 `v-loading`、antd `Table` 的 `loading`、`nz-table` 的 `[nzLoading]`）；禁挂 `TableWrap`；`DoFilterPanel` 的 `loading` 只让搜索按钮进入 loading（不禁用筛选项）。

## 验收清单

- [ ] 新页面具备 Layer + `_module` 分离
- [ ] 无 `DrawerXxx.vue` 新文件
- [ ] 业务页不静态 import `_example`
- [ ] 生产构建通过（产物无 `_example`）
