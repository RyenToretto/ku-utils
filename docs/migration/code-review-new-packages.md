# 4 个新包代码审查报告

执行时间：2026-04-17
范围：`@ku-utils/marketing`、`@ku-utils/report`、`@ku-utils/landing-report`、`@ku-utils/pay`

## 一、依赖图

```mermaid
graph TD
  Utils[@ku-utils/utils]
  Report[@ku-utils/report]
  LandingReport[@ku-utils/landing-report]
  Marketing[@ku-utils/marketing]
  Pay[@ku-utils/pay]
  JsMd5[js-md5]

  Marketing --> Utils
  Report --> Utils
  LandingReport --> Report
  LandingReport --> Utils
  Pay --> Utils
  Pay --> JsMd5
```

依赖单向、无环。所有 workspace 依赖在 tsup external 中标记为不打包，dist 体积保持精简。

## 二、各包审查清单

### 2.1 @ku-utils/marketing

| 维度     | 现状                                                                           |
| -------- | ------------------------------------------------------------------------------ |
| 源文件数 | 18 个，5 个二级模块（adjust / appsflyer / landing / download / color）         |
| 公开 API | 16 个（含 4 个工厂、3 个生成器、5 个 landing 工具、3 个 download、1 个 color） |
| 副作用   | 无 module-level 副作用；download/\* 内有 module-level timer state（受控）      |
| 类型安全 | 全部 `any` 已收紧为 `unknown` 或具体接口                                       |
| 测试     | 0（TODO）                                                                      |

**模块边界判断：** adjust / appsflyer / landing / download / color 五个子模块职责清晰，没有跨模块直接依赖（adjust → landing/runtime 是单向、合理）。无需进一步拆分。

### 2.2 @ku-utils/report

| 维度     | 现状                                                                                                                                           |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 源文件数 | 8 个                                                                                                                                           |
| 公开 API | `CoreTracker` 类、`createXhReport` 工厂、`createTrackerFactory` 泛型工厂、4 个 utils（makeVersionCode / ktk / uuid / useToken）、`SDK_VERSION` |
| 副作用   | 无                                                                                                                                             |
| 类型安全 | TrackerInstance 是 callable + property 的混合类型，使用了少量 `as unknown as` 桥接                                                             |
| 测试     | 0（TODO）                                                                                                                                      |

**关键设计：** `CoreTracker.afterInit` 设为 `protected`，方便子类（landing-report 的 LandingTracker）覆写。

### 2.3 @ku-utils/landing-report

| 维度      | 现状                                                                             |
| --------- | -------------------------------------------------------------------------------- |
| 源文件数  | 3 个                                                                             |
| 公开 API  | `LandingTracker` 类、`createLandingReport` 工厂 + 重导出 @ku-utils/report 的类型 |
| 副作用    | 无                                                                               |
| dist 体积 | ESM 607 B（重构后从 1.50 KB 下降）                                               |
| 测试      | 0（TODO）                                                                        |

**关键设计：** 100% 复用 `createTrackerFactory`，本包仅定义 `LandingTracker` 类（4 行）+ 调用工厂（一行）。

### 2.4 @ku-utils/pay

| 维度     | 现状                                                                                                                                                              |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 源文件数 | 7 个                                                                                                                                                              |
| 公开 API | `createHelaPay` 工厂、`CoreHelaPay` 类、`HelaPay` / `HelaPayConfig` / `HelaResponse` / `SkuInfo` / `PayScanInfo` / `UserInfo` / `WxJSPayCallback` 类型、`VERSION` |
| 副作用   | `request.ts` 调 `new XMLHttpRequest`；`mock/` 是纯数据                                                                                                            |
| 类型安全 | 全部 `any` 已收紧；`WeixinJSBridge` 通过 `declare global` 补充类型                                                                                                |
| 测试     | 0（TODO）                                                                                                                                                         |

## 三、本次审查识别的问题与处理

### 问题 A（高优）：Tracker 工厂代码重复 — 已修复

**位置：** `packages/report/src/createXhReport.ts` 与 `packages/landing-report/src/createLandingReport.ts`

**现象：** 两个文件除 `new CoreTracker(config)` vs `new LandingTracker(config)` 一行差异之外完全一致，30+ 行重复代码。

**修复：** 在 `@ku-utils/report` 中新增 [`createTrackerFactory.ts`](../../packages/report/src/createTrackerFactory.ts) 泛型工厂；`createXhReport` 与 `createLandingReport` 改为一行调用。

**影响：**

- `@ku-utils/report` 1.1.1 → 1.1.2（导出 `createTrackerFactory`）
- `@ku-utils/landing-report` 1.1.1 → 1.1.2（dist 体积 1.50 KB → 607 B）
- 公开 API 完全向后兼容

### 问题 B（中优）：scheme 唤起逻辑重复 — 已修复

**位置：** `packages/marketing/src/download/{appAndDownload,startDownload}.ts`

**现象：** `visibilitychange` / `pagehide` 监听 + 2 秒超时判断 99% 一致，仅返回值差异（void vs Promise）和 timer 持有方式（module-level vs `window.__du_download_tid`）。

**修复：** 抽出 [`tryWakeApp.ts`](../../packages/marketing/src/download/tryWakeApp.ts) 包内私有函数，通过 `WakeTimerStore` 抽象 timer 持有方式。两个公开 API 都基于它实现，签名完全向后兼容。

**修复中的二次问题：** 原 `appAndDownload` 逻辑里只在「< 2200ms」时 fallback；`startDownload` 逻辑里同样判断但配合 callback 决定。两者通过 `tryWakeApp` 的 `fallbackThresholdMs` 参数（默认 2200）统一表达。

**影响：**

- `@ku-utils/marketing` 1.1.1 → 1.1.2
- 公开 API 完全向后兼容

### 问题 C（低优 - 仅记录不修复）：CoreTracker 内 storage 直接访问

**位置：** `packages/report/src/core/index.ts`

**现象：** 多处直接调 `window.localStorage.getItem/setItem`，未使用 `@ku-utils/utils` 的 `local`/`session`。

**决策：保持现状。** 原因：

- CoreTracker 用的是裸字符串存储（如 `'1'` 标记位、`'-1'` 哨兵值、`Date.now()` 字符串）
- `@ku-utils/utils` 中 `local`/`session` 是带 expire + JSON 包装的封装
- 强行套封装会引入额外的 JSON parse/stringify 与 `value` 字段嵌套，破坏现有协议
- 该模块通过 `getClientStorageAccessor()` 已经做了 SSR 兜底

### 问题 D（低优）：pay/core.ts 内 makeVersionCode 局部重定义 — 已修复

**位置：** `packages/pay/src/core.ts` 原第 17 行

**现象：** 内联 `const makeVersionCode = (vn: string): string => vn.split('.').join('0')`，与 `@ku-utils/utils/uuid.ts` 中的 `makeVersionCode` 实现完全一致。

**修复：** 直接 `import { makeVersionCode } from '@ku-utils/utils'`，删除局部定义。

**影响：** `@ku-utils/pay` 1.1.1 → 1.1.2

### 问题 E（仅记录）：marketing 与 landing-report 都用了 `doExtendAll`

**结论：** 这是预期。`doExtendAll` 是「Tracker 工厂模式」的公共依赖（绑定方法到 callable instance），不是重复造轮子。

## 四、后续可优化点（TODO）

| 项                                                                     | 优先级 | 说明                                                                 |
| ---------------------------------------------------------------------- | ------ | -------------------------------------------------------------------- |
| 4 个包补充单元测试                                                     | 高     | 当前 0 测试覆盖；建议 marketing/path & macros 起步（纯函数好测）     |
| `marketing/adjust` 与 `marketing/appsflyer` 是否合并                   | 低     | 两者都是「广告归因 tracker」抽象，但 SDK 协议差异大；维持现状        |
| `CoreTracker` 内 `console.error` 改为 `@ku-utils/utils/logger`         | 中     | logger 已有 Sentry 集成，统一日志通道更利于线上排错                  |
| `@ku-utils/pay` 的 `baseURL` 暴露到 `HelaPayConfig`                    | 中     | 当前硬编码 `https://mv-ps.xdplt.com/api/v1`，多环境部署需修改源码    |
| `doRequest` 的 GET 请求带 body 行为                                    | 低     | 当前为兼容旧 hela-pay 行为保留，部分服务器拒收；调用方按业务约定使用 |
| `CoreHelaPay` 的 `try { window.navigator.userAgent... }` SSR 检测      | 低     | 当前 `try-catch` 兜底；可改用 `@ku-utils/utils` 的 `isClient` 判断   |
| `@ku-utils/marketing/landing/runtime.ts` 用 `(window as any).isTiktok` | 低     | 已在重构中改为有结构的 `LandingWindow` 接口断言；保持                |

## 五、本次发版

| 包                       | 旧版本 | 新版本 | 变更类型                                  |
| ------------------------ | ------ | ------ | ----------------------------------------- |
| @ku-utils/report         | 1.1.1  | 1.1.2  | refactor + 新增 createTrackerFactory 导出 |
| @ku-utils/landing-report | 1.1.1  | 1.1.2  | refactor，dist 体积 -60%                  |
| @ku-utils/marketing      | 1.1.1  | 1.1.2  | refactor                                  |
| @ku-utils/pay            | 1.1.1  | 1.1.2  | refactor                                  |

所有变更对外 API 完全向后兼容；消费方只需 `pnpm update @ku-utils/{report,landing-report,marketing,pay}` 即可。
