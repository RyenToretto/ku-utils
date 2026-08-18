---
name: report
description: 使用 @ku-utils/report 接入通用埋点上报（createXhReport）。当需要初始化埋点 SDK、上报用户行为/转化/属性事件时使用。
---

# @ku-utils/report Skill

通用事件上报 SDK（CoreTracker），内置 alive/heartbeat/start 生命周期自动上报，支持双通道、成功后防重和关键事件持久化 FIFO 批量池。

## 安装

```bash
npm install @ku-utils/report
```

---

## 初始化方式

### 方式一：直接初始化（token 已知时）

```ts
// src/plugins/report.ts
import { createXhReport } from '@ku-utils/report';

export const xh = createXhReport({
  pkg: 'com.example.app', // 必填：应用包名
  version: import.meta.env.VITE_APP_VERSION, // 原始版本字符串，如 '1.0.1'
  isDev: import.meta.env.DEV, // true → 仅 console.log，不发请求
  reportUrl: import.meta.env.VITE_REPORT_URL, // 关键事件上报地址
  attrUrl: import.meta.env.VITE_ATTR_URL, // 属性事件上报地址（可选）
  keys: ['LOGIN', 'REGISTER', 'PURCHASE', 'GENERATE_RESULT'],
  sourceKeys: ['source', 'channelName'], // URL 渠道参数名映射到 ext.source，默认支持 source
  moreGetter: () => ({
    // 每次上报附加的动态公共参数
    userId: getCurrentUserId() || '',
    channel: new URLSearchParams(location.search).get('channel') || 'organic',
  }),
});

export default xh;
```

> 传入 `pkg` 且不设 `manual: true` 时，SDK 在构造函数内自动执行 `init`。生命周期事件先入池，随后再 flush 初始化前暂存的业务事件。

---

### 方式二：两阶段初始化（需要等 token 就绪）

```ts
// src/plugins/report.ts
import { createXhReport } from '@ku-utils/report';

// 阶段一：module 加载时先创建实例（不自动 init）
export const xh = createXhReport();
// ← init 前的 xh(...) 调用会自动入队，init 后与对应 xh_alive 按 FIFO 批量 flush

// 阶段二：等用户 token 就绪后（如 Nuxt plugin / 登录回调）
export async function initReportWithToken(token: string) {
  await xh.init({
    pkg: import.meta.env.VITE_APP_PKG,
    version: import.meta.env.VITE_APP_VERSION,
    isDev: !import.meta.env.VITE_ENABLE_REPORT,
    tk: token, // 用户 token，写入 localStorage
    reportUrl: 'https://xr.example.com/adtrack',
    moreGetter: () => ({
      appInstanceId: getGAClientId(), // Google Analytics instance ID
    }),
  });
}
```

---

## keys 预定义机制（避免魔法字符串）

```ts
// 配置
const xh = createXhReport({
  keys: ['LOGIN', 'REGISTER', 'PURCHASE', 'GENERATE_RESULT'],
});

// SDK 自动在实例上挂载：
// xh.LOGIN            === 'login'             （属性名大写 → 属性值小写）
// xh.REGISTER         === 'register'
// xh.PURCHASE         === 'purchase'
// xh.GENERATE_RESULT  === 'generate_result'   （下划线保留）

// 正确用法
xh(xh.LOGIN, { method: 'email' }); // 上报 key = 'login'  ✅
xh(xh.PURCHASE, { sku: 'pro_monthly' }); // 上报 key = 'purchase' ✅

// 错误用法
xh('LOGIN', { method: 'email' }); // 上报 key = 'LOGIN'（大写）❌
```

**更好的做法**：将 keys 集中定义为枚举，与 `keys` 数组保持一致：

```ts
// src/constants/tracker.ts
export const enum TrackerEvent {
  Login = 'login',
  Register = 'register',
  Purchase = 'purchase',
  GenerateResult = 'generate_result',
}

// 上报时
xh(TrackerEvent.Login, { method: 'google' });
xh(TrackerEvent.Purchase, { sku: 'pro', value: 9.9 });
```

---

## 关键事件上报（双通道之一）

```ts
import xh from '@/plugins/report';

// 基础上报
xh(xh.LOGIN, { method: 'email', user_type: 'new' });

// 带 onlyOnce（永久防重，localStorage 级别）
xh('first_install', {}, true);
xh('first_install', {}, { onlyOnce: true }); // 同上，新 API 写法

// 带 dedupeKey（30 分钟内存防重，同一业务 id 不重复）
// 核心场景：支付成功，防止 HPP 回跳或重试导致重复上报
xh(
  xh.PURCHASE,
  {
    orderId: 'order-123',
    value: 9.9,
    currency: 'USD',
  },
  { dedupeKey: 'order-123' },
);

// 组合防重（跨页面 onlyOnce + 会话内 dedupeKey）
xh(xh.PURCHASE, { orderId }, { onlyOnce: true, dedupeKey: orderId });
```

**返回值语义**：

| 返回值 | 含义                                          |
| ------ | --------------------------------------------- |
| `-1`   | 被防重跳过（onlyOnce / dedupeKey / pay 重复） |
| `-2`   | isDev 模式，或空 key / ensureReady 失败       |
| 其他   | HTTP 响应 JSON                                |

若 transport 首次失败，当前 Promise 会 reject；事件仍保留在持久化池中，并在网络恢复或退避时间到达后继续重试。
自定义 `reportFetch` 必须遵守“resolve = 整批成功、reject = 整批失败”的约定。

---

## 属性事件上报（双通道之二）

```ts
// 正确签名：attrReport(key, ext?, onceOrOptions?)
// 第一个参数是事件 ID（字符串），不能省略
xh.attrReport('user_profile', {
  userId: user.id,
  level: user.level,
  isVip: user.isVip,
  plan: 'pro_monthly',
});

// 带防重（属性只上报一次）
xh.attrReport(
  'device_info',
  {
    deviceModel: navigator.userAgent,
    screen: `${screen.width}x${screen.height}`,
  },
  true,
);
```

> **注意**：`attrReport` 与关键事件是不同的 HTTP 通道，payload 结构不同，后端需分别对接。
> SDK 内部自动跳过 `xh_start` 和 `xh_heartbeat` key（返回 `-1`），这两者只走关键事件通道。

---

## 渠道 source 归一化

SDK 默认读取当前 URL 的 `source` 参数并写入 `ext.source`。如果投放链接使用其它参数名，可通过 `sourceKeys` 配置额外映射；命中的渠道值会按服务端枚举做大小写归一化，业务手动传入的 `ext.source` 优先级最高。

```ts
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

---

## TrackerConfig 完整配置

```ts
interface TrackerConfig {
  pkg: string; // 必填：应用包名/标识
  version?: string; // 版本号原始字符串，如 '1.0.1'（SDK 内部自动转 versionCode）
  isDev?: boolean; // true → 只 console.log，不发请求，默认 false
  keys?: string[]; // 预定义 key 列表，挂到实例上（大写属性名 → 小写属性值）
  sourceKeys?: string[]; // URL 中可映射为 ext.source 的参数名，默认支持 source
  manual?: boolean; // true → 不自动执行 init，需手动 await xh.init(config)
  tk?: string; // 用户 token，传入则写入 localStorage
  reportUrl?: string; // 关键事件上报地址，默认 '/adtrack'
  attrUrl?: string; // 属性事件上报地址，默认 '/'
  moreGetter?: () => Record<string, unknown>; // 每次上报前附加的动态公共参数
  reportFetch?: ReportRequestFn; // 自定义关键事件 HTTP（SSR/axios 时必须设置）
  attrFetch?: ReportRequestFn; // 自定义属性事件 HTTP
}
```

---

## 自定义 HTTP（SSR / Node / axios 项目）

```ts
import { createXhReport } from '@ku-utils/report';
import axios from 'axios';

// 默认 reportFetch 使用浏览器 fetch，SSR 或需要 axios 时必须自定义
const xh = createXhReport({
  pkg: 'com.example.app',
  version: '1.0.1',
  // 注意：params 是 query 参数，body 是请求体，两者都必须透传
  reportFetch: async (url, { method, params, body }) => {
    const res = await axios({ url, method, params, data: body });
    return res.data;
  },
  attrFetch: async (url, { method, body }) => {
    const res = await axios({ url, method, data: body });
    return res.data;
  },
});
```

---

## alive / heartbeat / start 自动上报说明

| 事件           | 防重策略                                 | 说明                      |
| -------------- | ---------------------------------------- | ------------------------- |
| `xh_alive`     | app + token 的 localStorage 永久标记     | 每个身份至少成功一次      |
| `xh_heartbeat` | app + token 的 localStorage 按天标记     | 每自然日最多成功一次      |
| `xh_start`     | app + token 的 sessionStorage 按会话标记 | 每浏览器 session 成功一次 |

**禁止**手动调用这三个 key，SDK 在 `init` 完成后自动触发。

关键事件单请求最多发送 20 条。当前 app + token 尚无已确认 alive 时，`xh_alive` 会排在批次首位；
失败批次与 nextRetryAt 持久化到 localStorage，按 1s、2s、4s、8s、16s、30s（封顶）退避重试。
多标签发送优先使用 Web Locks 串行化，不支持时 localStorage 租约只做尽力降重。SDK 为
at-least-once 语义，支付仍需稳定 orderId 和服务端幂等。所有防重标记都在整个批次成功后提交，避免
“请求失败但本地已经标记成功”造成永久漏报。

---

## 完整接入示例（Nuxt 4 / Vue 3 plugin）

```ts
// app/plugins/tracker.client.ts
import { createXhReport } from '@ku-utils/report';

// 阶段一：创建实例
const xhReport = createXhReport();
let inited = false;

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig();

  // 等待 user token
  const { getCurrentToken } = useAuth();
  const token = await getCurrentToken();

  // 阶段二：初始化
  await xhReport.init({
    pkg: config.public.tracker.pkg,
    version: config.public.appVersion,
    isDev: config.public.tracker.isDev,
    tk: token,
    reportUrl: 'https://xr.example.com/adtrack',
    moreGetter: () => ({
      userId: useUser().id || '',
    }),
  });
  inited = true;

  // provide 给全局使用
  nuxtApp.provide('xhTracker', (key: string, ext?: object, opts?: any) => {
    return xhReport(key, ext, opts);
  });
});
```

---

## 常见错误

| 错误                               | 原因                                         | 修复                                          |
| ---------------------------------- | -------------------------------------------- | --------------------------------------------- |
| `xh('LOGIN', ...)` 上报 key 是大写 | keys 预定义后属性值是小写                    | 改为 `xh(xh.LOGIN, ...)`                      |
| `version: makeVersionCode(v)`      | version 传原始字符串，SDK 内部转 versionCode | 改为 `version: v`                             |
| `attrReport({ userId })` 无效      | 缺少第一个 key 参数                          | 改为 `attrReport('user_profile', { userId })` |
| 支付重复上报                       | 未用 dedupeKey                               | 加 `{ dedupeKey: orderId }`                   |
| SSR 报 fetch 未定义                | defaultReportFetch 用了浏览器 fetch          | 自定义 reportFetch/attrFetch                  |
