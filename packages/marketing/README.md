# @ku-utils/marketing

营销追踪与渠道归因工具集，覆盖：

- **Adjust**：Facebook / TikTok 渠道归因，含 deep link、宏替换
- **Appsflyer**：OneLink 归因 + Smart Script 注入
- **Landing**：落地页 bootstrap 脚本 + 路由匹配 + Pixel 注入 + runtime 读取
- **Download**：scheme 唤起、表单下载、Promise 风格的 startDownload
- **Color**：Hex 颜色变浅工具

## 安装

```bash
pnpm add @ku-utils/marketing
```

依赖 `@ku-utils/utils`（用 `isAndroid`、`checkWeChat`）。

## API 速查

| 模块      | 导出                                                                                                                                                                                    |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| adjust    | `createAdjustTracker` / `replaceMacros` / `FB_CAMPAIGN_FRAGMENT` / `FB_CAMPAIGN_MACROS` / `DEFAULT_TIKTOK_MACROS`                                                                       |
| appsflyer | `createAppsflyerTracker` / `createSmartScriptTag`                                                                                                                                       |
| landing   | `createBootstrapScript` / `createPixelScripts` / `isTiktok` / `getLandingParams` / `getDeviceToken` / `getPkg` / `isMatchPage` / `isContainMatchPage` / `isFramePage` / `isPricingPage` |
| download  | `appAndDownload` / `startDownload` / `makeDownload`                                                                                                                                     |
| color     | `lighten`                                                                                                                                                                               |

类型：`AdjustConfig` / `AppsflyerConfig` / `LandingConfig` / `PixelConfig` / `PageParams` 等。

## 完整示例

### Adjust 归因 + scheme 唤起

```typescript
import { createAdjustTracker, appAndDownload } from '@ku-utils/marketing';

const adjust = createAdjustTracker({
  schemes: { android: 'novelsofa://app', ios: 'novelsofa://app' },
  tokens: {
    facebook: { android: 'XXX', ios: 'YYY', combined: 'ZZZ' },
    tiktok: { combined: 'TTT' },
  },
});

// 落地页加载时上报曝光
adjust.adjustReport({ campaign: 'spring_sale', psi: 'abc' });

// 用户点击 CTA：尝试唤起 App，2 秒未响应则跳下载
appAndDownload('novelsofa://app?from=cta', 'https://example.com/app.apk');
```

### 落地页 bootstrap + Pixel 注入

```typescript
import { createBootstrapScript, createPixelScripts } from '@ku-utils/marketing';

// Vite HTML 模板：注入到 <head>
const html = `
  ${createBootstrapScript({
    pkg: { android: 'com.app.android', ios: 'com.app.ios' },
    deriveFbc: true,
  })}
  ${createPixelScripts({
    facebook: { pixelId: '<%- FB_PIXEL_ID %>' },
    tiktok: { sdkId: '<%- TT_SDK_ID %>' },
  })}
`;
```

bootstrap 注入后业务代码可读：

```typescript
import { isTiktok, getLandingParams, getDeviceToken } from '@ku-utils/marketing';

if (isTiktok()) console.log('TikTok 渠道');
console.log('页面参数:', getLandingParams());
console.log('设备 ID:', getDeviceToken());
```

## 与其它包的关系

- **依赖** `@ku-utils/utils`：`isAndroid`、`checkWeChat`
- **可组合** `@ku-utils/report` / `@ku-utils/landing-report`：落地页同时埋点 + 归因

## 迁移自

- du-utils 的 `adjust/`、`appsflyer/`、`landing/`、`dom/{appAndDownload,startDownload,makeDownload}`
- 完整映射见 [docs/migration/du-utils.md](../../docs/migration/du-utils.md)

## 版本变更

- **1.1.2**（refactor）：抽出 `tryWakeApp` 私有函数，去除 `appAndDownload` 与 `startDownload` 的重复实现，公开 API 完全向后兼容
- **1.1.1**：首次发布

## AI Skill

安装后自动同步至 `.cursor/skills/marketing/SKILL.md`，在 Cursor 对话中可按需调用：

> 使用 @ku-utils/marketing 接入 Adjust/Appsflyer 渠道归因、落地页 bootstrap 脚本生成、App 下载/唤起、多 SDK 漏斗配对上报。当需要搭建广告投放追踪、落地页归因、App 下载唤起时使用。
