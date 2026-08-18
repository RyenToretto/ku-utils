---
name: pay
description: 使用 @ku-utils/pay 接入 HelaPay 支付（匿名登录、SKU 列表、下单、微信 JSAPI 支付）。当需要实现落地页/App 内购买流程时使用。
---

# @ku-utils/pay Skill

HelaPay Web 支付 SDK，封装匿名登录、SKU 列表、下单、微信 JSAPI 支付及结果查询。

## 安装

```bash
npm install @ku-utils/pay
```

## 初始化

```ts
// src/plugins/pay.ts
import { createHelaPay } from '@ku-utils/pay';
import type { HelaPayConfig } from '@ku-utils/pay';

// HelaPayConfig: { pkg, tk?, version?, code?, useMock? }
// 注意：没有 host 字段
const config: HelaPayConfig = {
  pkg: import.meta.env.VITE_APP_PKG, // 必填：应用包名
};

export const helaPay = createHelaPay(config);
export default helaPay;
```

## 完整支付流程

```ts
import helaPay from '@/plugins/pay';
import type { SkuInfo, PayScanInfo } from '@ku-utils/pay';

// Step 1: 初始化（携带最新配置，如 token）
await helaPay.init({
  pkg: 'com.example.app',
  tk: userToken, // 用户 token（登录后更新）
});

// Step 2: 获取用户信息（匿名登录）
const userInfo = await helaPay.requestUserInfo();
console.log('匿名用户 ID:', userInfo.userId);

// Step 3: 获取 SKU 列表
const skuList: SkuInfo[] = await helaPay.requestAllSkuList();
// SkuInfo 结构: { id: string, showPrice: number }
// 注意：字段是 id（不是 skuId），showPrice（不是 price），无 title 字段

// Step 4: 下单（获取支付扫码信息）
// 注意：用 selectedSku.id，不是 skuId
const payInfo: PayScanInfo = await helaPay.requestPayScan(selectedSku.id);

// Step 5a: 微信 JSAPI 支付（仅微信内）
if (isWechat()) {
  wx.config({/* 微信 JS-SDK 配置 */});
  wx.ready(() => {
    helaPay.wxJSPay(payInfo, {
      onSuccess: () => handlePaySuccess(),
      onFail: (err) => handlePayFail(err),
      onCancel: () => handlePayCancel(),
    });
  });
}

// Step 5b: 非微信支付（唤起微信 APP 扫码）
if (!isWechat()) {
  const wechatPayInfo = await helaPay.requestWakeWeChatPay(selectedSku.skuId, false);
  // 显示二维码或跳转 wechatPayInfo.codeUrl
}

// Step 6: 查询支付结果（轮询）
async function pollPayResult(payOrderId: string): Promise<boolean> {
  for (let i = 0; i < 30; i++) {
    await sleep(2000);
    const success = await helaPay.requestPayResult(payOrderId);
    if (success) return true;
  }
  return false;
}
```

## HelaPay 接口速查

```ts
// HelaPayConfig 完整字段
interface HelaPayConfig {
  pkg: string; // 必填：应用包名
  tk?: string; // 用户 token（登录后更新）
  version?: string; // 版本号
  code?: string; // 授权码
  useMock?: number; // 是否使用 mock（1 = 开启）
}

// SkuInfo 字段（注意：id 不是 skuId，showPrice 不是 price）
interface SkuInfo {
  id: string; // SKU ID（下单时传此字段）
  showPrice: number; // 展示价格
}

interface HelaPay {
  // 初始化/重新配置
  init(config: HelaPayConfig): Promise<HelaResponse>;

  // 工具
  uuid(pkg: string): string;

  // 微信 JSAPI 支付
  wxJSPay(payInfo: PayScanInfo, callback: WxJSPayCallback): void;

  // 用户
  requestUserInfo(): Promise<UserInfo>;

  // SKU
  requestAllSkuList(): Promise<SkuInfo[]>;

  // 下单
  requestPayScan(skuId: string): Promise<PayScanInfo>;
  requestWakeWeChatPay(skuId: string, inWechatWebView: boolean): Promise<PayScanInfo>;

  // 查询结果
  requestPayResult(payOrderId: string): Promise<boolean>;
}
```

## 完整落地页支付示例

```vue
<script setup>
import { ref, onMounted } from 'vue'
import helaPay from '@/plugins/pay'
import type { SkuInfo } from '@ku-utils/pay'

const skuList = ref<SkuInfo[]>([])
const selectedSku = ref<SkuInfo | null>(null)
const isLoading = ref(false)

onMounted(async () => {
  await helaPay.init({ pkg: VITE_APP_PKG })
  await helaPay.requestUserInfo()
  skuList.value = await helaPay.requestAllSkuList()
  selectedSku.value = skuList.value[0]  // 默认选第一个
})

async function handleBuy() {
  if (!selectedSku.value) return
  isLoading.value = true
  try {
    // 注意：用 selectedSku.value.id，不是 skuId
    const payInfo = await helaPay.requestPayScan(selectedSku.value.id)

    if (isInWechat) {
      wx.ready(() => {
        helaPay.wxJSPay(payInfo, {
          onSuccess: () => router.push('/pay-success'),
          onFail: (err) => message.error('支付失败'),
        })
      })
    }
  } finally {
    isLoading.value = false
  }
}
</script>
```
