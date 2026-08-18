---
name: landing-report
description: 使用 @ku-utils/landing-report 在落地页中接入埋点上报（无 alive/heartbeat 自动上报）。当开发广告落地页需要埋点时使用，与 @ku-utils/report 的关键区别是不自动上报生命周期事件。
---

# @ku-utils/landing-report Skill

落地页专用埋点 SDK，继承 CoreTracker 但禁用 alive/heartbeat/start 自动上报。

## 为什么落地页需要单独的 SDK？

落地页通常是用户从广告点击进入的一次性页面，自动上报 alive/heartbeat 会：

- 污染会话时长数据（用户可能只停留几秒）
- 使归因分析出现异常峰值

`@ku-utils/landing-report` 关闭了所有自动生命周期上报，只响应你主动调用的事件。

## 安装

```bash
npm install @ku-utils/landing-report
```

## 初始化

```ts
// src/plugins/report.ts（落地页项目）
import { createLandingReport } from '@ku-utils/landing-report';

export const xh = createLandingReport({
  pkg: 'com.example.landing-page',
  version: import.meta.env.VITE_APP_VERSION,
  isDev: import.meta.env.DEV,
  reportUrl: import.meta.env.VITE_REPORT_URL,
  keys: ['LANDING_VIEW', 'CLICK_DOWNLOAD', 'CLICK_REGISTER', 'FORM_SUBMIT'],
  sourceKeys: ['source', 'channelName'], // URL 渠道参数名映射到 ext.source，默认支持 source
  moreGetter: () => ({
    channel: new URLSearchParams(location.search).get('channel') || 'organic',
    landingPage: location.pathname,
  }),
});

export default xh;
```

## 渠道 source 归一化

`@ku-utils/landing-report` 继承 `@ku-utils/report` 的渠道归一化能力。默认读取 URL 的 `source` 参数；如果落地页投放链接使用其它参数名，可通过 `sourceKeys` 映射为最终 `ext.source`。

```ts
const xh = createLandingReport({
  pkg: 'com.example.landing',
  sourceKeys: ['source', 'channelName'],
});
```

当首次落地页为 `https://www.example.com?channelName=Facebook` 时：

- `landing-report` 不会自动上报 `xh_alive` / `xh_heartbeat` / `xh_start`
- 主动调用的所有关键事件和属性事件都会携带 `source: 'facebook'`
- 后续页面 URL 不再携带 `channelName` 时，也会继续使用首次落地页缓存的渠道参数
- 业务手动传入的 `ext.source` 优先级最高，并会按服务端枚举做大小写归一化

主动事件 body 示例：

```json
[
  {
    "key": "landing_view",
    "ext": {
      "channelName": "Facebook",
      "source": "facebook",
      "logidUrl": "https://www.example.com?channelName=Facebook"
    },
    "ts": 1783309140000
  }
]
```

## 事件上报

```ts
import xh from '@/plugins/report';

// 落地页展示
onMounted(() => xh('LANDING_VIEW'));

// 点击下载按钮
function handleDownload() {
  xh('CLICK_DOWNLOAD', { position: 'hero', buttonText: '立即下载' });
  startDownload(/* ... */);
}

// 表单提交
async function handleFormSubmit(form: FormData) {
  const result = await submitForm(form);
  if (result.success) {
    xh('FORM_SUBMIT', { success: true });
  }
}
```

## 与 marketing 集成

```ts
// 落地页通常同时需要归因 + 埋点
import { createBootstrapScript } from '@ku-utils/marketing';
import { createLandingReport } from '@ku-utils/landing-report';

createBootstrapScript({/* Adjust/FB Pixel 配置 */});

const xh = createLandingReport({/* 上报配置 */});

xh('LANDING_VIEW', {
  channel: new URLSearchParams(location.search).get('channel'),
  creative: new URLSearchParams(location.search).get('creative'),
});
```

## 对比 @ku-utils/report

如果你在落地页误用了 `createXhReport`，请替换为 `createLandingReport`：

```ts
// ❌ 落地页中错误用法（会产生 alive/heartbeat 噪音数据）
import { createXhReport } from '@ku-utils/report'
const xh = createXhReport({ ... })

// ✅ 正确用法
import { createLandingReport } from '@ku-utils/landing-report'
const xh = createLandingReport({ ... })
```
