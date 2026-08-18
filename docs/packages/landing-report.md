# Landing Report 落地页埋点上报 SDK

`@ku-utils/landing-report` 是落地页专用的埋点上报 SDK，继承 `@ku-utils/report` 的 `CoreTracker`，覆写 `afterInit` 不自动上报 alive / heartbeat / start。

迁移自 xh-report v3.0.1 的 `packages/landing`。

## 安装

```bash
pnpm add @ku-utils/landing-report
```

依赖：`@ku-utils/report` + `@ku-utils/utils`。

## 与 @ku-utils/report 的差异

| 项                 | `@ku-utils/report` | `@ku-utils/landing-report`           |
| ------------------ | ------------------ | ------------------------------------ |
| 类                 | `CoreTracker`      | `LandingTracker extends CoreTracker` |
| 自动上报 alive     | ✓                  | ✗                                    |
| 自动上报 heartbeat | ✓                  | ✗                                    |
| 自动上报 start     | ✓                  | ✗                                    |
| 适用场景           | 应用内页面         | 落地页（短停留，不需要长连接事件）   |

## 使用示例

```typescript
import { createLandingReport } from '@ku-utils/landing-report';

const xh = createLandingReport({
  pkg: 'com.example.landing',
  reportUrl: 'https://api.example.com/adtrack',
  attrUrl: 'https://api.example.com/attr',
});

await xh.init();

xh('landing_view');
xh('cta_click', { btn: 'download' });
xh.attrReport('landing_props', { source: 'fb_ad', ab_group: 'B' });
```

## API 速查

| 导出                                                                             | 说明                                  |
| -------------------------------------------------------------------------------- | ------------------------------------- |
| `createLandingReport(config?)`                                                   | 工厂，返回 TrackerInstance            |
| `LandingTracker`                                                                 | 落地页 Tracker 类（继承 CoreTracker） |
| 重导出：`CoreTracker` / `ktk` / `makeVersionCode` / `useToken` / `uuid`          | 来自 @ku-utils/report                 |
| 重导出：`TrackerConfig` / `TrackerInstance` / `ReportParams` / `ReportRequestFn` | 类型                                  |

`TrackerInstance` 接口与 `@ku-utils/report` 一致，详见该包文档。

## 与其它包的关系

```mermaid
graph LR
  LandingReport[@ku-utils/landing-report] --> Report[@ku-utils/report]
  LandingReport --> Utils[@ku-utils/utils]
```

`createLandingReport` 内部直接复用 `@ku-utils/report` 导出的 `createTrackerFactory(LandingTracker, 'createLandingReport')`，整个包只有 ~10 行业务代码。

## 迁移自

详见 [docs/migration/xh-report.md](../migration/xh-report.md)。
