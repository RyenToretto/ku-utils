export interface HelaResponse<T = ''> {
  message: {
    code: number | string;
    messageInfo: string;
    serverTime?: number;
  };
  result: T;
}

export interface SkuInfo {
  id: string;
  showPrice: number;
}

export interface PayScanInfo {
  payOrderId: string;
  orderStr: string;

  appId: string;
  timeStamp: string;
  nonceStr: string;
  prepayId: string;
  signType: string;
  sign: string;
}

export interface UserInfo {
  id: string;
  pkg: string;
  token: string;
  vipExpireTime: string;
  biz_id: string;
  name: string;
  /** 0：非 vip；1：vip */
  isVip: number;
  /** 0：非永久会员；1：永久会员 */
  isForeverVip: number;
  nickName: number;
  avatar: string;
  openId: string;
}

export type WxJSPayCallback = (res?: { err_msg?: string }) => void;

export interface WeixinJSBridgeLike {
  invoke: (
    method: 'getBrandWCPayRequest',
    payload: {
      appId: string;
      timeStamp: string;
      nonceStr: string;
      package: string;
      signType: string;
      paySign: string;
    },
    cb: (res: { err_msg?: string }) => void,
  ) => void;
}

declare global {
  interface Window {
    WeixinJSBridge?: WeixinJSBridgeLike;
  }
}
