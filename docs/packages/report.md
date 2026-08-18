# Report 通用埋点上报 SDK

`@ku-utils/report` 提供通用埋点上报能力，核心是 `CoreTracker` 类与 `createXhReport` 工厂封装。

迁移自 xh-report v3.0.1 的 `packages/sdk`。

## 安装

```bash
pnpm add @ku-utils/report
```

依赖：`@ku-utils/utils`（用 device / date / url / uuid / object 等）。

## 特性

- 关键事件 / 属性事件双通道（`xh(key)` 与 `xh.attrReport(key)`）
- 关键事件使用 localStorage 持久化 FIFO 池，单请求最多批量发送 20 条
- `xh_alive` 按 app + token 隔离，并作为后续关键事件的发送屏障
- localStorage / sessionStorage 去重标记仅在请求成功后提交
- pay_suc 订单去重
- 默认 fetch 实现，可替换为业务自定义 reportFetch
- 初始化前的事件自动入队，初始化完成后按生命周期事件优先的顺序批量 flush
- 暴露 `createTrackerFactory` 泛型工厂，方便派生新的 Tracker 类型

## 使用示例

### 创建实例并上报

```typescript
import { createXhReport } from '@ku-utils/report';

const xh = createXhReport({
  pkg: 'com.example.app',
  version: '1.0.1',
  reportUrl: 'https://api.example.com/adtrack',
  attrUrl: 'https://api.example.com/attr',
  isDev: false,
  keys: ['LOGIN', 'CLICK_BUY'],
  moreGetter: () => ({ ab_group: 'A' }),
});

await xh.init();

// 关键事件（含 storage 去重）
xh('user_login');
xh(xh.LOGIN, { method: 'wechat' });
xh('first_install', {}, true); // onlyOnce

// 属性事件
xh.attrReport('user_pref', { theme: 'dark' });
```

### 自定义 reportFetch（接入业务请求库）

```typescript
import axios from 'axios';

xh.setReportFetch(async (url, { method, params, body }) => {
  const res = await axios({ url, method, params, data: body });
  return res.data;
});
```

### 事件池与可靠性语义

- `reportFetch` resolve 表示整个 body 批次成功，reject 表示整批失败，不支持把部分成功静默 resolve。
- 失败批次连同 nextRetryAt 持久化并指数退避重试，最长间隔 30 秒；刷新或网络恢复后会继续发送。
- 每条事件保存入池时的 URL、app/token 参数和事件时间，不会用新身份重放旧事件。
- 多标签发送优先使用 Web Locks 串行化，不支持时降级为带续租的 localStorage 租约尽力降重。
- 客户端为 at-least-once 语义；支付需携带稳定 orderId，服务端仍应按业务主键幂等。
- 当前 app + token 没有成功 alive 时，业务批次的第一条一定是 `xh_alive`。
- alive、heartbeat、start、onlyOnce、pay_suc 与 dedupeKey 标记均在整批成功后提交。
- localStorage 不可用时自动降级为内存队列，不阻断业务逻辑。

### 升级兼容注意事项

- API 签名不变，但关键事件的 `body` 现在最多包含 20 条；自定义 `reportFetch` 必须处理全部数组元素。
- transport 只有在整批全部接收时才能 resolve；部分成功必须 reject，避免客户端误提交整批标记。
- 新版不信任旧版请求前写入的成功标记，首次升级可能补发；支付服务必须按稳定 `orderId` 幂等。
- SSR 不自动发送生命周期事件，应在 client-only 插件内初始化。
- 回滚前先等待新版持久队列排空，旧版无法消费新版 localStorage 队列。

### 派生新 Tracker（高级）

```typescript
import { CoreTracker, createTrackerFactory } from '@ku-utils/report';

class MyTracker extends CoreTracker {
  protected override async afterInit() {
    // 自定义初始化后的上报行为
  }
}

export const createMyReport = createTrackerFactory(MyTracker, 'createMyReport');
```

## API 速查

| 导出                                                                     | 说明                                                      |
| ------------------------------------------------------------------------ | --------------------------------------------------------- |
| `createXhReport(config?)`                                                | 工厂，返回带方法的可调用 instance                         |
| `createTrackerFactory(Ctor, name?)`                                      | 泛型工厂，用于派生新的 Tracker（landing-report 即基于此） |
| `CoreTracker`                                                            | 埋点核心类（可继承）                                      |
| `defaultReportFetch`                                                     | 默认 fetch 实现                                           |
| `buildMergedExtPayload`                                                  | ext 合并工具                                              |
| `makeVersionCode` / `ktk` / `uuid` / `useToken`                          | 标识工具（透传 @ku-utils/utils）                          |
| `SDK_VERSION`                                                            | SDK 版本常量                                              |
| `TrackerConfig` / `TrackerInstance` / `ReportParams` / `ReportRequestFn` | 类型                                                      |

## TrackerInstance 是什么

```ts
xh: TrackerInstance =
  // 函数：关键事件上报
  ((key, ext?, onlyOnce?) => Promise<unknown>) &
  {
    init, attrReport, setReportFetch, setAttrFetch, // 实例方法
    makeVersionCode, uuid, useToken,                 // 静态工具
    [USER_KEY: string]: string,                      // keys 配置注入的常量
  }
```

调用 `xh('event_name')` 与 `xh.doReport('event_name')` 等价。

## 与其它包的关系

```mermaid
graph LR
  Report[@ku-utils/report] --> Utils[@ku-utils/utils]
  LandingReport[@ku-utils/landing-report] --> Report
```

- `@ku-utils/landing-report` 继承本包的 `CoreTracker` 与 `createTrackerFactory`
- `@ku-utils/utils` 提供 `getBrowserInfo` / `doDate` / `getPageParams` / `safeParseJson` / `doExtendAll` / `makeVersionCode` / `ktk` / `uuid` / `useToken` / `isClient` / `isDefined`

## 迁移自

详见 [docs/migration/xh-report.md](../migration/xh-report.md)。
