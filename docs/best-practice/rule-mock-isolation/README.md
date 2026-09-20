# rule-mock-isolation — Mock 隔离与种子

> **已落地**：`apps/kv3-admin/.cursor/rules/mock-isolation.mdc`  
> **来源**：oversea `mock-isolation.mdc` + jx-dsp Mock 专节。  
> **同步**：改本模块或 `.mdc` 须双向更新，见 [SYNC.md](../SYNC.md)。

**类型**：Cursor Rule（`.mdc`）

## 本仓落点

| 路径                                              | 说明                                               |
| ------------------------------------------------- | -------------------------------------------------- |
| `apps/kv3-admin/.cursor/rules/mock-isolation.mdc` | globs `_mock` / `src/mock`；信封 `code:0` + `data` |
| `apps/kv3-admin/src/mock/utils.ts`                | `ok` / `pageOk` / `defaultSuccess` 真源            |

## 推进接入分数

| 维度         | 分         | 说明                 |
| ------------ | ---------- | -------------------- |
| 覆盖度       | 22/25      | 两仓强制；kv3 部分   |
| 可执行性     | 24/25      | 禁止项可检查         |
| 可移植性     | 19/25      | 信封字面量因仓而异   |
| Agent 可触发 | 13/15      | globs `_mock`        |
| 单一真源     | 9/10       | 与 api-contract 分工 |
| **合计**     | **87/100** |                      |

## 最佳实践（精炼）

### 加载边界

- Mock **只**由构建插件 / 中间件加载聚合入口；**业务 / `$MAPS` / 页面禁止** import `_mock` 当字典
- `/api/*` 未命中须回 JSON 信封，**禁止** `next()` 回落 SPA HTML

### 信封（按仓填写）

| 项       | **本仓 kv3-admin（冻结）** | 示例 A（DSP 常见） | 示例 B（海外创编） |
| -------- | -------------------------- | ------------------ | ------------------ |
| 成功码   | `0`（number）              | `0`                | `'0000'`           |
| 载荷     | `data`                     | `data`             | `result`           |
| 部分成功 | —                          | —                  | `'0001'`           |

Mock / `_api` / 拦截器必须与**现行**合同同形；禁止双码兼容。

### 种子硬约束

1. 表格/列表行必须**逐条硬编码**；禁 `Array.from` / `map` 工厂生成行（对种子 `filter`+分页除外）
2. 默认首屏满页（常见 pageSize=10 → ≥10 条）；演示翻页建议 ≥ pageSize×3
3. 无筛选时 `total` ≥ 3 且与过滤后条数一致
4. 增删改默认可只回成功信封，不强制改种子（除非任务要求 CRUD 闭环）

### 跨域假数据一致性（若有「应用包名」等）

指定**唯一** fixtures 真源集合；禁止第二套 `com.demo.*` 宇宙；跨域联动用具名常量，禁 `APPS[n]` 下标。

## 验收清单

- [ ] 业务文件无 import mock 种子
- [ ] 未命中 API 不返回 HTML
- [ ] 列表 mock 满足硬编码与条数
