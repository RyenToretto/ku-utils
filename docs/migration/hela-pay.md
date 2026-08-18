# hela-pay 迁移映射

## 概览

| 旧包                | 新位置          | 新版本 |
| ------------------- | --------------- | ------ |
| `hela-pay` (v2.0.4) | `@ku-utils/pay` | 1.1.1  |

依赖：保留 `js-md5`，新增 `@ku-utils/utils` workspace 依赖；删除 `src/pure/` 整个目录。

## src/ 文件映射

| 源                                                                                           | 处理    | 去向                                                                             |
| -------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------- |
| `src/index.ts → createHelaPay` / `HelaPayConfig` / `HelaPay`                                 | ✅      | `@ku-utils/pay/src/index.ts`（保持公共 API 不变）                                |
| `src/version.ts → VERSION`                                                                   | ✅      | `src/version.ts`（保留 '2.0.4'）                                                 |
| `src/core/index.ts → CoreHelaPay`（含 SkuInfo / PayScanInfo / UserInfo / HelaResponse 类型） | ✅ 拆分 | 类放 `src/core.ts`；4 个类型抽到 `src/types.ts` 并 export                        |
| `src/core/index.ts → makeVersionCode` 局部函数                                               | ✅      | 内联在 `core.ts` 顶部（与新建 utils/uuid.ts 的同名函数重复但保持本地纯函数风格） |
| `src/doRequest/index.ts → DoRequest` 类 + `useDoRequest` 工厂                                | ✅      | `src/request.ts`（XHR 实现保留，appendUrlParams 改用 @ku-utils/utils）           |
| `src/doMock/index.ts`                                                                        | ✅      | `src/mock/index.ts`                                                              |
| `src/doMock/response/index.ts` / `mockUserInfo.ts` / `mockSkuAll.ts` / `mockOrderInfo.ts`    | ✅      | 合并到 `src/mock/responses.ts`（单文件，避免过细分割）                           |

## src/pure/ 完全删除

| 源                     | 处理                | 替代来源      |
| ---------------------- | ------------------- | ------------- |
| `pure/getRealType`     | ⏭ → @ku-utils/utils | `is.ts`       |
| `pure/appendUrlParams` | ⏭ → @ku-utils/utils | `url.ts`      |
| `pure/doDate`          | ⏭ → @ku-utils/utils | `date.ts`     |
| `pure/deepClone`       | ⏭ → @ku-utils/utils | `function.ts` |
| `pure/getBrowserInfo`  | ⏭ → @ku-utils/utils | `device.ts`   |
| `pure/doExtend`        | ⏭ → @ku-utils/utils | `object.ts`   |
| `pure/generateUUID`    | ⏭ → @ku-utils/utils | `uuid.ts`     |
| `pure/getPageParams`   | ⏭ → @ku-utils/utils | `url.ts`      |

代码层面 import 改写：

```ts
// 原
import { deepClone, generateUUID, getBrowserInfo } from '@/pure';
import doRequest from '@/doRequest';
// 新
import { deepClone, generateUUID, getBrowserInfo } from '@ku-utils/utils';
import doRequest from './request';
```

## 类型增强

| 项                              | 改动                                                                                                                                |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `WeixinJSBridge` 全局变量       | 在 `src/types.ts` 用 `declare global { interface Window { WeixinJSBridge?: WeixinJSBridgeLike } }` 补充类型，移除原 `// @ts-ignore` |
| `wxJSPay` 的 `callback: any`    | 改为 `WxJSPayCallback`                                                                                                              |
| `doRequest` 返回值 `any`        | 改为泛型 `<T = unknown>`；调用处用 `HelaResponse<UserInfo>` 等具体类型                                                              |
| `getHelaPayParams` 返回值 `any` | 改为 `Record<string, unknown>`                                                                                                      |
| `(document as any).attachEvent` | 改为有结构的接口断言 `legacyDoc.attachEvent`                                                                                        |

## 工程层处理

| 项                                                  | 处理 | 原因                                                                                                              |
| --------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------- |
| `libs/`                                             | ⏭    | 旧版构建产物 + 发布用 package.json，已被 ku-utils 的 publish 流程取代                                             |
| `index.html`                                        | ⏭    | 开发用 Vite 入口，新包是纯库                                                                                      |
| `vite.config.ts` / `dts-bundle-generator.config.ts` | ⏭    | ku-utils 统一用 tsup                                                                                              |
| `.eslintrc` / `.prettierrc` 等                      | ⏭    | ku-utils 已有统一配置                                                                                             |
| `test/sum.test.ts`                                  | ⏭    | 占位测试无价值                                                                                                    |
| `target: 'ie11'`                                    | ⚠️   | 暂未在新包中显式声明 IE11 target；保留内置 XHR 维持兼容性，按业务需求决定是否补充 polyfill 或调整 tsconfig target |
| `baseURL = 'https://mv-ps.xdplt.com/api/v1'` 硬编码 | ⚠️   | 保留行为不变；后续可在 `HelaPayConfig` 中暴露 baseURL 选项                                                        |
| GET 请求带 body：`xhr.send(JSON.stringify(data))`   | ⚠️   | 保留与原行为一致；部分服务器拒绝 GET body，由调用方按业务约定                                                     |

## 依赖变更

| 项                       | 改动                                 |
| ------------------------ | ------------------------------------ |
| `du-utils` (file tar.gz) | 移除（hela-pay 实际只在 pure/ 引用） |
| `js-md5`                 | 保留（^0.8.3）                       |
| `@ku-utils/utils`        | 新增（workspace:\*）                 |

---

## 校对补漏（2026-04-17 二轮校对）

### `src/pure/` 目录全清单（实际 9 个文件）

原映射表只列了 8 个工具函数。实际 `src/pure/` 含 9 个文件（含 `index.ts` 聚合）：

| 源文件                    | 导出函数          | 替代来源                      |
| ------------------------- | ----------------- | ----------------------------- |
| `pure/is.ts`              | `getRealType`     | `@ku-utils/utils/is.ts`       |
| `pure/appendUrlParams.ts` | `appendUrlParams` | `@ku-utils/utils/url.ts`      |
| `pure/date.ts`            | `doDate`          | `@ku-utils/utils/date.ts`     |
| `pure/deepClone.ts`       | `deepClone`       | `@ku-utils/utils/function.ts` |
| `pure/deviceInfo.ts`      | `getBrowserInfo`  | `@ku-utils/utils/device.ts`   |
| `pure/doExtend.ts`        | `doExtend`        | `@ku-utils/utils/object.ts`   |
| `pure/doUUID.ts`          | `generateUUID`    | `@ku-utils/utils/uuid.ts`     |
| `pure/getPageParams.ts`   | `getPageParams`   | `@ku-utils/utils/url.ts`      |
| `pure/index.ts`           | 聚合 re-export    | ⏭ 整目录删除                  |

### 待跟进项 TODO 清单（独立列出）

为方便业务方排期，将上一轮的 ⚠️ 待跟进项整理成独立 TODO：

- [ ] **baseURL 可配置**：当前 `CoreHelaPay.baseURL` 硬编码为 `https://mv-ps.xdplt.com/api/v1`，建议在下个 minor 版本扩展 `HelaPayConfig`：
  ```ts
  interface HelaPayConfig {
    pkg: string;
    baseURL?: string; // 新增
    // ...
  }
  ```
- [ ] **GET 带 body 的 XHR 行为**：`packages/pay/src/request.ts` 当前 GET 请求也会 `send(JSON.stringify(data))`。后续应判断 method === 'GET' 时 send(null)。
- [ ] **IE11 target 是否保留**：当前未显式声明 IE11 target，依赖 tsconfig 的 `es2022`。如业务方仍需 IE11，需调整 tsconfig.json 与 tsup target，并补充对应 polyfill。
- [ ] **CoreHelaPay UA 检测**：构造函数中 `try { window.navigator.userAgent... }` SSR 兜底，可改用 `@ku-utils/utils/isClient` 常量更清晰。
- [ ] **mock 机制规范化**：当前 `useMock=1` 时所有请求返 mock；建议引入 `mockHandlers` 自定义匹配器，便于业务方按需开启。

### 重构后二轮发现（2026-04-17 三轮）

`pay/core.ts` 第 17 行原内联了 `makeVersionCode` 局部定义，与 `@ku-utils/utils/uuid.ts` 同名导出实现完全一致。已在 [`code-review-new-packages.md`](./code-review-new-packages.md) 问题 D 中处理：

- 改为 `import { makeVersionCode } from '@ku-utils/utils'`，删除局部定义
- 涉及发版：`@ku-utils/pay` 1.1.2

### 一致性检查结论

- ✅ 18 个源文件全部覆盖（含 9 个 pure/ 文件）
- ✅ 公共工具函数已 100% 替换为 @ku-utils/utils
- ⚠️ 5 项待跟进 TODO 已独立成单
