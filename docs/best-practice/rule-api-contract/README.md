# rule-api-contract — API / 字典 / 响应示例边界

> **参考接入**：请求入口、信封、禁兼容、`$MAPS`、响应示例只读形状。  
> **来源**：jx-dsp / oversea `project-context` 中 API / `$MAPS` / 响应示例专节。

**类型**：Cursor Rule（`.mdc`）

## 推进接入分数

| 维度         | 分         | 说明                   |
| ------------ | ---------- | ---------------------- |
| 覆盖度       | 23/25      | 两仓核心               |
| 可执行性     | 22/25      | 自检清单可执行         |
| 可移植性     | 18/25      | 信封/路径因仓而异      |
| Agent 可触发 | 12/15      | globs `_api`/`maps`    |
| 单一真源     | 9/10       | 与 mock-isolation 对齐 |
| **合计**     | **84/100** |                        |

## 最佳实践（精炼）

### HTTP 入口

- 业务唯一实现在 `modules/.../_api`；页面只调 **`requestXxx`**；禁页面散落 URL / 拼 wire payload
- 禁 `api/common` 对业务 `_api` 二次 re-export 当「共用出口」
- GET 数组：交给序列化（如 qs `arrayFormat: 'comma'`）；禁页面 `.join(',')`

### 合同冻结与禁兼容

在 `project-context` 写死本仓成功码/载荷/未登录码后：

- 禁 `@deprecated` 双轨 API 长期共存 → 直接删旧
- 禁双字段兜底（`id ?? userId`、`message`/`msg` 双认）
- 禁「先顶住联调再删」的兼容解析

### 响应示例边界

文档 JSON「响应示例」**只读形状**（键名、分页、信封），**不得**把示例枚举项/label 抄进 `$MAPS` / 页面 options。  
真源优先级建议：已确认 wait/合同 → 后端已落地代码 → **运行时字典接口** → Mock → 文档示例（只读形状）。

### `$MAPS` / 字典

- 不走接口下发的稳定约定码表 → 入 `_map`/`$MAPS` 再引用
- 有 enums/options 专用接口 → 必须 `_api` 请求；空/失败禁伪造下拉
- 禁页面 magic string 作主真源

### Agent 自检（写选项前）

1. 这段 value/label 来自运行时接口、已确认合同，还是文档示例？示例 → 禁止入码为字典。
2. 是否存在专用选项 API？有则必须请求。

## 验收清单

- [ ] 拦截器与 context 冻结表一致
- [ ] 无双码/双字段兼容分支
- [ ] 新下拉未从文档示例抄死 options
