# Marketing 营销追踪

`@ku-utils/marketing` 提供前端营销追踪与渠道归因能力，覆盖 Adjust / Appsflyer / Pixel / 落地页 bootstrap / scheme 唤起下载等业务场景。

迁移自旧库 du-utils 的 `adjust/`、`appsflyer/`、`landing/`、`dom/{appAndDownload,startDownload,makeDownload}` 模块。

## 安装

```bash
pnpm add @ku-utils/marketing
```

依赖：`@ku-utils/utils`（用 `isAndroid`、`checkWeChat` 等设备检测）。

## 使用示例

### 创建 Adjust 归因 tracker

```typescript
import { createAdjustTracker } from '@ku-utils/marketing';

const adjust = createAdjustTracker({
  schemes: { android: 'novelsofa://app', ios: 'novelsofa://app' },
  tokens: {
    facebook: { android: 'XXX', ios: 'YYY', combined: 'ZZZ' },
    tiktok: { combined: 'TTT' },
  },
});

adjust.adjustReport({ campaign: 'spring_sale', psi: 'abc' });
adjust.buildTrackerUrl({ campaign: 'spring_sale', psi: 'abc' });
```

### 落地页 bootstrap 脚本注入

```typescript
import { createBootstrapScript, createPixelScripts } from '@ku-utils/marketing';

// 在 index.html 模板中输出
const bootstrap = createBootstrapScript({
  pkg: { android: 'com.app.android', ios: 'com.app.ios' },
  deriveFbc: true,
});

const pixel = createPixelScripts({
  facebook: { pixelId: '<%- FB_PIXEL_ID %>' },
  tiktok: { sdkId: '<%- TT_SDK_ID %>' },
});
```

### scheme 唤起 + 下载兜底

```typescript
import { appAndDownload, startDownload } from '@ku-utils/marketing';

// 同步用法：唤起失败 2 秒后自动跳下载链接
appAndDownload('myapp://open', 'https://example.com/app.apk');

// Promise 用法：业务方决定 fallback
const needFallback = await startDownload('myapp://open', () => {});
if (needFallback) {
  // 自定义 fallback 逻辑
}
```

## API 速查

### Adjust（adjust/）

- `createAdjustTracker(config)` → `{ adjustReport, buildTrackerUrl }`
- `replaceMacros(template, macros, pMaps)`
- 常量：`FB_CAMPAIGN_FRAGMENT`、`FB_CAMPAIGN_MACROS`、`DEFAULT_TIKTOK_MACROS`
- 类型：`AdjustConfig`、`AdjustTokenSet`、`AdjustTracker`、`MacroTuple`

### Appsflyer（appsflyer/）

- `createAppsflyerTracker(config)` → `{ buildOneLinkUrl, redirect }`
- `createSmartScriptTag(config?)` → string（HTML 片段）
- 类型：`AppsflyerConfig`、`AppsflyerSmartScriptConfig`、`AppsflyerTracker`

### Landing（landing/）

- `createBootstrapScript(config)` → string（IIFE 脚本，含 `<script>` 标签）
- `createPixelScripts(config)` → string（不含外层 `<script>` 包装）
- 运行时：`isTiktok()`、`getLandingParams()`、`getDeviceToken()`、`getPkg()`
- 路由：`isMatchPage(path, pages)`、`isContainMatchPage(path, pages)`、`isFramePage(path)`、`isPricingPage(path)`
- 类型：`LandingConfig`、`PixelConfig`、`PageParams`

### Download（download/）

- `appAndDownload(schemeLink, downloadUrl?)` → void（同步 + 自动 fallback）
- `startDownload(schemeLink, callback?)` → `Promise<boolean>`（true=需 fallback）
- `makeDownload(url, data?, method?)` → void（隐藏表单提交）

### Color（color/）

- `lighten(hex, amount)` → string（HEX 颜色变浅）

## 与其它包的关系

```mermaid
graph LR
  Marketing[@ku-utils/marketing] --> Utils[@ku-utils/utils]
```

- 内部依赖 `@ku-utils/utils`：`isAndroid`、`checkWeChat`
- adjust/tracker 内部使用 landing/runtime 读取 bootstrap 注入的 `__DEVICE_TOKEN__`
- 与 `@ku-utils/report` / `@ku-utils/landing-report` 是可组合关系（落地页同时埋点 + 归因）

## 迁移自

详见 [docs/migration/du-utils.md](../migration/du-utils.md) 第 11、12 节。
