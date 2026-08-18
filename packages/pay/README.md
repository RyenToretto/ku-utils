# @ku-utils/pay

Web 端支付 SDK（HelaPay 体系），覆盖匿名登录、SKU 列表、下单、支付结果查询，以及微信 JSAPI 支付。

## 安装

```bash
pnpm add @ku-utils/pay
```

依赖：`@ku-utils/utils` + `js-md5`。

## 特性

- 匿名登录 + 用户信息获取
- SKU 列表 / 下单 / 支付结果查询
- 微信 JSAPI 支付（WeixinJSBridge 调起，含 ready 事件兜底）
- MD5 签名（js-md5）
- 内置轻量 XHR 请求层（不依赖 axios）
- Mock 模式（`useMock: 1` 开启）
- TypeScript 全类型，含 `WeixinJSBridge` 全局声明

## API 速查

| 导出                                                                           | 说明                       |
| ------------------------------------------------------------------------------ | -------------------------- |
| `createHelaPay(payload?)`                                                      | 工厂，返回 `HelaPay`       |
| `CoreHelaPay`                                                                  | 核心类（高级用法直接 new） |
| `HelaPayConfig` / `HelaPay`                                                    | 配置 / 实例类型            |
| `HelaResponse<T>` / `SkuInfo` / `PayScanInfo` / `UserInfo` / `WxJSPayCallback` | 响应类型                   |
| `VERSION`                                                                      | SDK 版本                   |

### HelaPay 实例方法

| 方法                   | 签名                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| `init`                 | `(payload: HelaPayConfig) => Promise<HelaResponse>`                 |
| `uuid`                 | `(pkg: string) => string`                                           |
| `wxJSPay`              | `(configObj: PayScanInfo, callback: WxJSPayCallback) => void`       |
| `requestUserInfo`      | `() => Promise<UserInfo>`                                           |
| `requestAllSkuList`    | `() => Promise<SkuInfo[]>`                                          |
| `requestPayScan`       | `(skuId: string) => Promise<PayScanInfo>`                           |
| `requestWakeWeChatPay` | `(skuId: string, inWechatWebView: boolean) => Promise<PayScanInfo>` |
| `requestPayResult`     | `(payOrderId: string) => Promise<boolean>`                          |

## 完整示例

### PC 二维码支付

```typescript
import { createHelaPay } from '@ku-utils/pay';

const pay = createHelaPay();

await pay.init({
  pkg: 'com.example.app',
  version: '1.0.1',
});

const skus = await pay.requestAllSkuList();
const order = await pay.requestPayScan(skus[0].id);
console.log(order.orderStr); // 二维码内容

const ok = await pay.requestPayResult(order.payOrderId);
```

### 微信 JSAPI 支付

```typescript
const order = await pay.requestWakeWeChatPay(skuId, /* inWechatWebView */ true);
pay.wxJSPay(order, () => {
  console.log('支付成功');
});
```

### Mock 模式（开发期）

```typescript
await pay.init({
  pkg: 'com.example.app',
  useMock: 1,
});
// 后续所有请求返回 mock 数据
```

## 与其它包的关系

```mermaid
graph LR
  Pay[@ku-utils/pay] --> Utils[@ku-utils/utils]
  Pay --> JsMd5[js-md5]
```

- `@ku-utils/utils`：deepClone、generateUUID、getBrowserInfo、appendUrlParams、makeVersionCode
- `js-md5`：vc 字段签名
- 内置 XHR（`request.ts`）保持包零运行时框架依赖

## 待跟进项

详见 [docs/migration/hela-pay.md](../../docs/migration/hela-pay.md) 末尾「待跟进项 TODO 清单」。

## 迁移自

hela-pay v2.0.4，详见 [docs/migration/hela-pay.md](../../docs/migration/hela-pay.md)。

## 版本变更

- **1.1.2**（refactor）：移除 `core.ts` 中的局部 `makeVersionCode`，改为从 `@ku-utils/utils` 导入，避免双份实现
- **1.1.1**：首次发布（迁移自 hela-pay v2.0.4）
