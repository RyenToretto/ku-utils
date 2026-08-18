# Pay Web 支付 SDK

`@ku-utils/pay` 是 Web 端支付 SDK（HelaPay 体系），覆盖匿名登录、SKU 列表、下单、支付结果查询，以及微信 JSAPI 支付。

迁移自 hela-pay v2.0.4。

## 安装

```bash
pnpm add @ku-utils/pay
```

依赖：`@ku-utils/utils`（用 deepClone / generateUUID / getBrowserInfo / appendUrlParams / makeVersionCode）+ `js-md5`（签名）。

## 特性

- 匿名登录 + 用户信息获取
- SKU 列表 / 下单 / 支付结果查询
- 微信 JSAPI 支付（WeixinJSBridge 调起，含 ready 事件兜底）
- MD5 签名（js-md5）
- 内置轻量 XHR 请求层（不依赖 axios，<5KB gzip）
- Mock 模式（`useMock: 1` 开启）
- TypeScript 全类型，含 `WeixinJSBridge` 全局声明

## 使用示例

### 标准支付流程

```typescript
import { createHelaPay } from '@ku-utils/pay';

const pay = createHelaPay();

// 1. 初始化（匿名登录）
await pay.init({
  pkg: 'com.example.app',
  version: '1.0.1',
  code: 'thirdPlatformCode_optional',
});

// 2. 获取 SKU 列表
const skus = await pay.requestAllSkuList();

// 3. PC 二维码支付
const order = await pay.requestPayScan(skus[0].id);
console.log(order.orderStr); // 二维码内容

// 4. 轮询支付结果
const ok = await pay.requestPayResult(order.payOrderId);
```

### 微信 JSAPI 支付（公众号 / 小程序内）

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
// 后续所有请求返回 mock 数据，无需后端
```

## API 速查

### 工厂

- `createHelaPay(payload?)` → `HelaPay`

### HelaPay 接口

| 方法                                           | 说明                            |
| ---------------------------------------------- | ------------------------------- |
| `init(payload)`                                | 同 setParams，触发匿名登录      |
| `uuid(pkg)`                                    | 获取/生成与 pkg 关联的设备 UUID |
| `wxJSPay(configObj, callback)`                 | 调起微信 JSAPI 支付             |
| `requestUserInfo()`                            | 拉取用户信息                    |
| `requestAllSkuList()`                          | 拉取全部 SKU                    |
| `requestPayScan(skuId)`                        | PC 二维码下单（payType=3）      |
| `requestWakeWeChatPay(skuId, inWechatWebView)` | 微信 JSAPI 下单                 |
| `requestPayResult(payOrderId)`                 | 查询支付结果                    |

### 类型

`HelaPayConfig`、`HelaPay`、`HelaResponse<T>`、`SkuInfo`、`PayScanInfo`、`UserInfo`、`WxJSPayCallback`

### 常量

`VERSION`：SDK 版本

## 与其它包的关系

```mermaid
graph LR
  Pay[@ku-utils/pay] --> Utils[@ku-utils/utils]
  Pay --> JsMd5[js-md5]
```

- `@ku-utils/utils`：deepClone、generateUUID、getBrowserInfo、appendUrlParams、makeVersionCode
- `js-md5`：签名（vc 字段）
- 内置 XHR（`request.ts`）保持包零运行时框架依赖，便于嵌入任意宿主页

## 待跟进项

详见 [docs/migration/hela-pay.md](../migration/hela-pay.md) 末尾「待跟进项 TODO 清单」：

- [ ] baseURL 可配置（当前硬编码 `https://mv-ps.xdplt.com/api/v1`）
- [ ] GET 请求 body 行为修正
- [ ] IE11 target 是否保留

## 迁移自

详见 [docs/migration/hela-pay.md](../migration/hela-pay.md)。
