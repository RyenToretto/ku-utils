import { CoreHelaPay, type HelaPayConfig } from './core';
import type { HelaResponse, PayScanInfo, SkuInfo, UserInfo, WxJSPayCallback } from './types';

export type { HelaPayConfig } from './core';
export type { HelaResponse, PayScanInfo, SkuInfo, UserInfo, WxJSPayCallback } from './types';
export { VERSION } from './version';
export { CoreHelaPay } from './core';

export interface HelaPay {
  init: (payload: HelaPayConfig) => Promise<HelaResponse>;
  uuid: (pkg: string) => string;
  wxJSPay: (configObj: PayScanInfo, callback: WxJSPayCallback) => void;

  requestUserInfo: () => Promise<UserInfo>;
  requestAllSkuList: () => Promise<SkuInfo[]>;
  requestPayScan: (skuId: string) => Promise<PayScanInfo>;
  requestWakeWeChatPay: (skuId: string, inWechatWebView: boolean) => Promise<PayScanInfo>;
  requestPayResult: (payOrderId: string) => Promise<boolean>;
}

export function createHelaPay(payload?: HelaPayConfig): HelaPay {
  try {
    const instance = new CoreHelaPay(payload);
    return {
      init: instance.setParams.bind(instance),
      uuid: instance.uuid.bind(instance),
      wxJSPay: instance.wxJSPay.bind(instance),

      requestUserInfo: instance.requestUserInfo.bind(instance),
      requestAllSkuList: instance.requestAllSkuList.bind(instance),
      requestPayScan: instance.requestPayScan.bind(instance),
      requestWakeWeChatPay: instance.requestWakeWeChatPay.bind(instance),
      requestPayResult: instance.requestPayResult.bind(instance),
    };
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    return {} as HelaPay;
  }
}

export default createHelaPay;
