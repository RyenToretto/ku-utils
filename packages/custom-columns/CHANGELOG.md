# @ku-utils/custom-columns

## 1.0.9

### Patch Changes

- 05a7a86: 配置抽屉左侧分组导航底色改用 `--ku-bg-card-elevated`，修复暗色下仍为白底；Vue 3 包修复已选列拖拽排序松手后回弹不生效
- 94821e7: `SchemaColumn` 的 `schema.renderHeader` 改经 `#header` 插槽渲染（入参不变），不再触发 Element Plus `render-header` 废弃告警
- b64dd29: 随包 rules / skills 按真实 API 重写（`messages`、`DoTableHeader` 须在 composable 调用组件内、完整 options、存储 key）；修正 `messages` 类型注释（未传字段回落中文默认文案）
  - @ku-utils/utils@1.5.4

## 1.0.8

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.5.4

## 1.0.7

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.5.3

## 1.0.6

### Patch Changes

- 修复共享组件和日期工具的多语言文案能力：custom-columns 内置文案支持 messages 覆盖且默认中文兜底，utils 相对时间和时长格式支持 locale/messages 且默认中文兜底。
- Updated dependencies
  - @ku-utils/utils@1.5.1

## 1.0.4

### Patch Changes

- Updated dependencies [1d8c8cf]
  - @ku-utils/utils@1.5.0

## 1.0.3

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.4.3

## 1.0.2

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.4.2

## 1.0.1

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.4.1
