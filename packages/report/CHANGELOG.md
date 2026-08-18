# @ku-utils/report

## 1.2.14

### Patch Changes

- 7617aef: 重构关键事件上报为 app + token 隔离的持久化 FIFO 批量池，保证业务事件不会越过对应的 xh_alive，并将生命周期、支付及防重标记改为整批成功后提交。

  保持 landing-report 不自动发送 alive、heartbeat、start 的既有行为。

  升级注意：公开 API 不变，但自定义 reportFetch 现在必须处理 body 中最多 20 条事件，并以 resolve/reject
  表示整批成功/失败；支付服务需按稳定 orderId 幂等。SSR 不再自动发送生命周期事件，回滚前需先等待新版
  持久队列排空。

## 1.2.13

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.5.4

## 1.2.12

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.5.3

## 1.2.11

### Patch Changes

- 新增渠道 source 归一化配置，支持 URL 参数别名映射并在后续上报中保持来源渠道。

## 1.2.10

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.5.1

## 1.2.9

### Patch Changes

- Updated dependencies [1d8c8cf]
  - @ku-utils/utils@1.5.0

## 1.2.8

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.4.3

## 1.2.7

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.4.2

## 1.2.6

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.4.1

## 1.2.4

### Patch Changes

- 修复 rules/skills 中 8 处错误：attrReport 缺少 key 参数、version 不应传 makeVersionCode 结果、reportFetch 缺失 params、补充两阶段初始化模式、补充 dedupeKey 防重说明、补充 keys 机制详解（大写常量→小写 key）、修正 rule 中不存在的方法名、修正示例中未定义变量和大写 key 误导

## 1.2.3

### Patch Changes

- feat(report): 新增 Cursor rules/skills 自动安装（postinstall）

## 1.2.2

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.3.2

## 1.2.1

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.3.1

## 1.2.0

### Minor Changes

- ec3e90c: feat(report): doReport / attrReport 新增 `dedupeKey` 选项

  新增 `ReportOptions` 类型，第三参数除了原 `boolean` onlyOnce 外，新增对象形态：

  ```ts
  $xhTracker(TrackerKeyEvent.Purchase, params, {
    dedupeKey: transaction_id,
    dedupeTtl: 30 * 60 * 1000, // 可选，默认 30 分钟
  });
  ```

  设计目的：业务关键事件按业务 id（transaction_id / orderId 等）内存去重，避免「支付回跳 + 刷新 + 多标签页」等场景导致同一业务实体重复上报。dedupeKey 与原 `onlyOnce` 互不冲突，可同时使用。

  完全向后兼容，旧 `boolean` 调用不受影响。

### Patch Changes

- Updated dependencies [7f1ad63]
  - @ku-utils/utils@1.3.0

## 1.1.4

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.2.1

## 1.1.3

### Patch Changes

- Updated dependencies
  - @ku-utils/utils@1.2.0
