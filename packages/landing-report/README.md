# @ku-utils/landing-report

落地页埋点上报 SDK，继承 `@ku-utils/report` 的 `CoreTracker`，覆写 `afterInit` 不自动上报 alive / heartbeat / start。

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
| 适用场景           | 应用内页面         | 落地页（短停留）                     |

## API 速查

| 导出                           | 说明                                                                     |
| ------------------------------ | ------------------------------------------------------------------------ |
| `createLandingReport(config?)` | 工厂，返回 TrackerInstance                                               |
| `LandingTracker`               | 落地页 Tracker 类                                                        |
| 重导出                         | `CoreTracker` / `ktk` / `makeVersionCode` / `useToken` / `uuid`          |
| 重导出类型                     | `TrackerConfig` / `TrackerInstance` / `ReportParams` / `ReportRequestFn` |

## 完整示例

```typescript
import { createLandingReport } from '@ku-utils/landing-report';

const xh = createLandingReport({
  pkg: 'com.example.landing',
  reportUrl: 'https://api.example.com/adtrack',
  attrUrl: 'https://api.example.com/attr',
  sourceKeys: ['source', 'channelName'],
});

await xh.init();

xh('landing_view');
xh('cta_click', { btn: 'download' });
xh.attrReport('landing_props', { source: 'fb_ad', ab_group: 'B' });
```

## 渠道 source 归一化

`@ku-utils/landing-report` 继承 `@ku-utils/report` 的渠道归一化能力。默认读取 URL 的 `source` 参数；如果落地页投放链接使用其它参数名，可通过 `sourceKeys` 映射为最终 `ext.source`。

```typescript
const xh = createLandingReport({
  pkg: 'com.example.landing',
  sourceKeys: ['source', 'channelName'],
});
```

当首次落地页为 `https://www.example.com?channelName=Facebook` 时：

- `landing-report` 不会自动上报 `xh_alive` / `xh_heartbeat` / `xh_start`。
- 主动调用的所有关键事件和属性事件都会携带 `source: 'facebook'`。
- 后续页面 URL 不再携带 `channelName` 时，也会继续使用首次落地页缓存的渠道参数。
- 业务手动传入的 `ext.source` 优先级最高，并会按服务端枚举做大小写归一化。

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

## 与其它包的关系

```mermaid
graph LR
  LandingReport[@ku-utils/landing-report] --> Report[@ku-utils/report]
  LandingReport --> Utils[@ku-utils/utils]
```

`createLandingReport` 内部直接复用 `@ku-utils/report` 导出的 `createTrackerFactory(LandingTracker, 'createLandingReport')`。

## 迁移自

xh-report v3.0.1 的 `packages/landing`，详见 [docs/migration/xh-report.md](../../docs/migration/xh-report.md)。

## 版本变更

- **1.1.2**（refactor）：复用 `@ku-utils/report` 新增的 `createTrackerFactory` 泛型工厂，去除 30+ 行重复代码，dist 体积从 1.50 KB 降到 607 B
- **1.1.1**：首次发布

## AI Skill

安装后自动同步至 `.cursor/skills/landing-report/SKILL.md`，在 Cursor 对话中可按需调用：

> 使用 @ku-utils/landing-report 在落地页中接入埋点上报（无 alive/heartbeat 自动上报）。当开发广告落地页需要埋点时使用，与 @ku-utils/report 的关键区别是不自动上报生命周期事件。
