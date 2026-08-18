# @ku-utils/report

通用埋点上报 SDK，提供 `CoreTracker` 类与 `createXhReport` 工厂封装。

## 安装

```bash
pnpm add @ku-utils/report
```

依赖：`@ku-utils/utils`（用 device / date / url / uuid / object 等）。

## 特性

- 关键事件 / 属性事件双通道
- 关键事件使用 localStorage 持久化 FIFO 事件池，单次最多批量发送 20 条
- `xh_alive` 按 app + token 隔离，并作为后续关键事件的发送屏障
- localStorage / sessionStorage 去重标记仅在请求成功后提交
- pay_suc 订单去重
- 默认 fetch 实现，可替换为业务自定义 reportFetch
- 初始化前的事件自动入队，初始化完成后按 alive → heartbeat/start → 业务事件顺序 flush
- 暴露 `createTrackerFactory` 泛型工厂，方便派生新的 Tracker（landing-report 即基于此）

## API 速查

| 导出                                            | 说明                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------ |
| `createXhReport(config?)`                       | 工厂：返回带方法的可调用 instance                                        |
| `createTrackerFactory(Ctor, name?)`             | 泛型工厂：派生新 Tracker                                                 |
| `CoreTracker`                                   | 埋点核心类（可继承）                                                     |
| `defaultReportFetch`                            | 默认 fetch 实现                                                          |
| `buildMergedExtPayload`                         | ext 合并工具                                                             |
| `makeVersionCode` / `ktk` / `uuid` / `useToken` | 标识工具（透传 @ku-utils/utils）                                         |
| `SDK_VERSION`                                   | SDK 版本常量                                                             |
| 类型                                            | `TrackerConfig` / `TrackerInstance` / `ReportParams` / `ReportRequestFn` |

## 完整示例

### 标准用法

```typescript
import { createXhReport } from '@ku-utils/report';

const xh = createXhReport({
  pkg: 'com.example.app',
  version: '1.0.1',
  reportUrl: 'https://api.example.com/adtrack',
  attrUrl: 'https://api.example.com/attr',
  isDev: false,
  keys: ['LOGIN', 'CLICK_BUY'],
  sourceKeys: ['source', 'channelName'],
  moreGetter: () => ({ ab_group: 'A' }),
});

await xh.init();

// 关键事件
xh('user_login');
xh(xh.LOGIN, { method: 'wechat' });
xh('first_install', {}, true); // onlyOnce

// 属性事件
xh.attrReport('user_pref', { theme: 'dark' });
```

### 渠道 source 归一化

SDK 默认读取当前 URL 的 `source` 参数并写入 `ext.source`。如果投放链接使用其它参数名，可通过 `sourceKeys` 配置额外映射；命中的渠道值会按服务端枚举做大小写归一化，业务手动传入的 `ext.source` 优先级最高。

```typescript
const xh = createXhReport({
  pkg: 'com.example.app',
  sourceKeys: ['source', 'channelName'],
});
```

当落地页为 `https://www.example.com?channelName=Facebook` 时，初始化自动上报的 `xh_alive` body 示例：

```json
[
  {
    "key": "xh_alive",
    "ext": {
      "channelName": "Facebook",
      "source": "facebook",
      "logidUrl": "https://www.example.com?channelName=Facebook"
    },
    "ts": 1783309140000
  }
]
```

如果业务手动调用 `xh('some_event', { source: 'Google' })`，最终 `ext.source` 会归一为 `google`，不会被 URL 参数覆盖。

### 自定义 reportFetch

```typescript
import axios from 'axios';

xh.setReportFetch(async (url, { method, params, body }) => {
  const res = await axios({ url, method, params, data: body });
  return res.data;
});
```

`reportFetch` resolve 表示整个 `body` 批次已被服务端接收，reject 表示整批失败。失败批次会保留在
localStorage，并按 1s、2s、4s、8s、16s、30s（封顶）退避重试。当前调用返回的 Promise 会收到首次失败，
恢复后的后台重试继续使用入池时保存的 URL、身份参数、事件时间与下次重试时间。多标签发送优先通过
Web Locks 串行化；不支持时使用带续租的 localStorage 租约尽力降重。客户端整体采用 at-least-once
语义，支付事件仍需携带稳定 orderId，服务端应按业务主键幂等。

关键事件的 `body` 始终是数组。若当前 app + token 尚无成功的 `xh_alive`，SDK 会把 alive 放在批次首位，
支付等业务事件不会越过它单独发送。只有整个批次 resolve 后，alive、onlyOnce、pay_suc 和 dedupeKey
对应的成功标记才会提交。

### 升级兼容与回滚

- 公开工厂、配置项和调用签名不变，但关键事件的 `body` 由“通常单条”变为最多 20 条。自定义
  `reportFetch` 必须处理数组中的全部事件，不能只读取 `body[0]`。
- 服务端或自定义 transport 必须遵守整批原子语义：全部接收才 resolve；存在部分失败时必须 reject，
  否则客户端会把整批标记为成功。
- 新版不信任旧版在请求前写入的 alive、支付和 onlyOnce 标记。升级后的首次调用可能补发一次，支付端点
  必须按稳定 `orderId` 幂等。
- SSR 初始化不会自动发送 alive/heartbeat/start；需要上报时应在 client-only 插件内创建 Tracker。
- 回滚到旧版前应先停止放量并等待新版持久队列排空；旧版无法继续消费新版 localStorage 队列。

### 派生新 Tracker

```typescript
import { CoreTracker, createTrackerFactory } from '@ku-utils/report';

class MyTracker extends CoreTracker {
  protected override async afterInit() {
    // 自定义初始化后的上报行为
  }
}

export const createMyReport = createTrackerFactory(MyTracker, 'createMyReport');
```

## 与其它包的关系

- **依赖** `@ku-utils/utils`：`getBrowserInfo`、`doDate`、`getPageParams`、`makeVersionCode`、`ktk`、`uuid`、`useToken`、`isClient`、`safeParseJson`、`isDefined`、`doExtendAll`
- **被** `@ku-utils/landing-report` **依赖**：派生 LandingTracker

## 迁移自

xh-report v3.0.1 的 `packages/sdk`，详见 [docs/migration/xh-report.md](../../docs/migration/xh-report.md)。

## 版本变更

- **1.1.2**（refactor）：抽出 `createTrackerFactory` 泛型工厂作为公共能力导出，`createXhReport` 改为一行调用。新增导出 `createTrackerFactory`，公开 API 向后兼容
- **1.1.1**：首次发布（迁移自 xh-report v3.0.1）
