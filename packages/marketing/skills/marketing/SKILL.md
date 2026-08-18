---
name: marketing
description: 使用 @ku-utils/marketing 接入 Adjust/Appsflyer 渠道归因、落地页 bootstrap 脚本生成、App 下载/唤起、多 SDK 漏斗配对上报。当需要搭建广告投放追踪、落地页归因、App 下载唤起时使用。
---

# @ku-utils/marketing Skill

广告投放与渠道归因 SDK，覆盖 Adjust、Appsflyer OneLink、落地页 bootstrap 脚本生成、App 下载/唤起、多 SDK 漏斗配对上报（PairedTracker）。

## 安装

```bash
npm install @ku-utils/marketing
```

---

## createAdjustTracker — Adjust 宏替换归因

生成 Adjust 归因链接和上报 Impression。**注意**：`config` 需要 `tokens`（各渠道 token 集合）而非单个 `appToken`。

```ts
import { createAdjustTracker } from '@ku-utils/marketing';

const adjustTracker = createAdjustTracker({
  schemes: {
    android: 'com.example.app',
    ios: 'com.example.app',
  },
  tokens: {
    facebook: {
      android: 'fb-android-token',
      ios: 'fb-ios-token',
      combined: 'fb-combined-token',
    },
    tiktok: {
      combined: 'tt-combined-token',
    },
  },
  impressionBase: 'https://view.adjust.com/impression',
  goLinkBase: 'https://app.adjust.com',
});

// 上报归因（传入宏参数映射）
adjustTracker.adjustReport({
  campaign: 'summer2026',
  adgroup: 'banner-top',
  psi: 'meta_ios_xxx',
});

// 构建 tracker URL（不发请求，返回构造好的 URL）
adjustTracker.buildTrackerUrl({
  campaign: 'summer2026',
  psi: 'meta_android_xxx',
});
```

---

## buildAdjDeepLink / copyAdjDeepLink

深链 query 默认含 `psi`、`bookid`；若 `pMaps.biz_type` 有值（如 `BOOK` / `SHORTPLAY`）则追加 `biz_type`，缺省不写空参数。

---

## createAppsflyerTracker — Appsflyer OneLink 归因

```ts
import { createAppsflyerTracker } from '@ku-utils/marketing';

const afTracker = createAppsflyerTracker({
  oneLinkBase: 'https://novelsofa.onelink.me/x0gG/9rz10tu2',
  appScheme: 'novelsofa://mainActivity',
  pid: 'metaweb_int',
  linkIdSource: 'psi', // 'psi'（默认）或 'param'
});

// 生成 OneLink URL
const url = afTracker.buildOneLinkUrl(pMaps);

// 直接跳转（自动构建 + redirect）
afTracker.redirect(pMaps);
```

---

## createSmartScriptTag — Appsflyer Smart Script HTML 标签

生成 Smart Script `<script>` HTML 字符串，粘贴到 `index.html <head>` 中：

```ts
import { createSmartScriptTag } from '@ku-utils/marketing';

const scriptTag = createSmartScriptTag({
  oneLinkId: 'x0gG',
  webDevKey: 'your-web-dev-key',
});
// scriptTag 是 <script>...</script> 字符串，写入 index.html
```

---

## createBootstrapScript — 落地页 bootstrap 脚本生成

生成落地页启动 IIFE 脚本（含 `<script>` 标签），在 window 上挂载：`isTiktok`、`__PAGE_PARAMS__`、`__PKG__`、`__DEVICE_TOKEN__`。

```ts
import { createBootstrapScript } from '@ku-utils/marketing';

// 在构建期（vite.config / nuxt.config）或 HTML 模板插件中调用
const scriptContent = createBootstrapScript({
  pkg: {
    android: import.meta.env.VITE_PKG_ANDROID,
    ios: import.meta.env.VITE_PKG_IOS,
  },
  deriveFbc: true, // 从 fbclid 预计算 _fbc
  tiktokCondition: "p.utm_source==='tiktok'||p.cha==='tt'",
  ignoreParams: ['preview'],
});

// 将 scriptContent 注入到 index.html <head> 顶部
```

---

## createPixelScripts — TikTok + Facebook Pixel 条件化加载脚本

```ts
import { createPixelScripts } from '@ku-utils/marketing';

const pixelContent = createPixelScripts({
  facebook: {
    pixelId: import.meta.env.VITE_FB_PIXEL_ID,
    useExternalId: true, // 传 window.__DEVICE_TOKEN__ 作 external_id
  },
  tiktok: {
    sdkId: import.meta.env.VITE_TT_SDK_ID,
  },
});
```

---

## startDownload / appAndDownload — App 下载/唤起

```ts
import { startDownload, appAndDownload } from '@ku-utils/marketing';

// startDownload：通过 scheme 唤起 App，返回 Promise<boolean>
// resolve(true) = 未唤起，需 fallback；resolve(false) = 已唤起
async function handleDownload(schemeLink: string, downloadUrl: string) {
  const needFallback = await startDownload(schemeLink);
  if (needFallback) {
    window.location.href = downloadUrl;
  }
}

// appAndDownload：一体化，scheme 唤起失败自动跳 downloadUrl
appAndDownload('yourapp://open', 'https://yourapp.com/download');
```

---

## makeDownload — 通用下载跳转

```ts
import { makeDownload } from '@ku-utils/marketing';

// 微信内自动加 is-we-chat 提示；Google Play 直接跳转
makeDownload('https://play.google.com/store/apps/details?id=com.example');
```

---

## 落地页工具函数

```ts
import {
  getLandingParams,
  getDeviceToken,
  getPkg,
  isTiktok,
  getFbp,
  isMatchPage,
} from '@ku-utils/marketing';

const params = getLandingParams(); // 解析 window.__PAGE_PARAMS__
const token = getDeviceToken(); // window.__DEVICE_TOKEN__
const pkg = getPkg(); // 当前平台对应的包名
const tiktok = isTiktok(); // 是否为 TikTok 渠道
const fbp = getFbp(); // 读取 Meta Pixel _fbp Cookie

// 路由匹配（支持 i18n 前缀）
const onPricing = isMatchPage(route.path, ['/pricing']);
```

---

## createPairedTracker — 多 SDK 漏斗配对上报

业务方调一次 `tracker.track()`，内部分发到 xh + FB Pixel + TikTok + Adjust 四个通道。

```ts
import {
  createPairedTracker,
  createFacebookPixelAdapter,
  createTiktokPixelAdapter,
  createAdjustWebAdapter,
} from '@ku-utils/marketing';

const tracker = createPairedTracker({
  // 业务上报回调（必传）
  xh: (name, params, options) => xhReport(name, params, options),

  // 第三方 SDK 适配器（可选）
  fb: createFacebookPixelAdapter(),
  tiktok: createTiktokPixelAdapter(),
  adjust: createAdjustWebAdapter(),

  // 事件 → 通道映射表
  events: {
    purchase: {
      fb: { name: 'Purchase', standard: true }, // fbq('track', 'Purchase', ...)
      tiktok: { name: 'CompletePayment', standard: true },
      adjust: { token: 'abc123' }, // Adjust event token
    },
    login_success: {
      fb: { name: 'Login', standard: false }, // fbq('trackCustom', 'Login', ...)
      tiktok: { name: 'Login', standard: true },
    },
  },
  debug: import.meta.env.DEV,
});

// 上报（业务 snake_case 事件名 + 各通道参数）
tracker.track('purchase', {
  xh: { sku_id: 'pro_monthly', value: 9.9, currency: 'USD', transaction_id: 'tx-123' },
  fb: { value: 9.9, currency: 'USD', content_ids: ['pro_monthly'] },
  tiktok: { value: 9.9, currency: 'USD', content_id: 'pro_monthly' },
  adjust: { revenue: 9.9, currency: 'USD' },
  dedupeId: 'tx-123', // 跨通道共用的去重 id
});

// 动态注册新事件
tracker.registerEvent('share_result', {
  fb: { name: 'Share', standard: false },
});
```

---

## 核心约束

1. **Tracker 在页面渲染前初始化**：必须在 `main.ts` / 入口中完成，不能在路由守卫内懒初始化
2. **Adjust 与 Appsflyer 不混用**：同一落地页/广告活动只用一套归因 SDK
3. **PairedTracker 事件必须预声明**：在 `events` 配置中预先注册才能 `track()`，否则不发
4. **FB/TikTok standard 标志**：自定义事件（非平台标准白名单）必须 `standard: false`，否则平台后台无法识别优化目标
