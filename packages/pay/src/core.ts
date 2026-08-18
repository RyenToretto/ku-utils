import { deepClone, generateUUID, getBrowserInfo, makeVersionCode } from '@ku-utils/utils';
import { md5 } from 'js-md5';

import doMock from './mock';
import doRequest from './request';
import type { HelaResponse, PayScanInfo, SkuInfo, UserInfo, WxJSPayCallback } from './types';
import { VERSION } from './version';

export interface HelaPayConfig {
  pkg: string;
  tk?: string;
  version?: string;
  code?: string;
  useMock?: number;
}

export class CoreHelaPay {
  SALT = '3582d6815e095be3d83fecae039ef46e88cff3844bba6c5f703dae669a9a6647';
  baseURL = 'https://mv-ps.xdplt.com/api/v1';

  useMock = false;
  clientType: undefined | number = undefined;
  thirdPlatformCode = '';
  pkg = '';
  openId = '';
  wxOpenId = '';
  versionName = '1.0.1';
  versionCode = makeVersionCode(this.versionName);

  constructor(payload?: HelaPayConfig) {
    if (payload) this.setParams(payload);

    this.setParams = this.setParams.bind(this);
    this.ktk = this.ktk.bind(this);
    this.uuid = this.uuid.bind(this);
    this.wxJSPay = this.wxJSPay.bind(this);
    this.getHelaPayParams = this.getHelaPayParams.bind(this);
    this.requestAnonymousLogin = this.requestAnonymousLogin.bind(this);
    this.requestUserInfo = this.requestUserInfo.bind(this);
    this.requestAllSkuList = this.requestAllSkuList.bind(this);
    this.requestCreateOrder = this.requestCreateOrder.bind(this);
    this.requestPayScan = this.requestPayScan.bind(this);
    this.requestWakeWeChatPay = this.requestWakeWeChatPay.bind(this);
    this.requestPayResult = this.requestPayResult.bind(this);
  }

  setParams(payload: HelaPayConfig): Promise<HelaResponse> {
    if (payload && payload.useMock && +payload.useMock === 1) {
      this.useMock = true;
    }
    if (payload && payload.code) {
      this.thirdPlatformCode = payload.code;
    }
    try {
      const ua = window.navigator.userAgent.toLowerCase();
      if (ua.indexOf('micromessenger') !== -1) {
        this.clientType = 0;
      }
    } catch {
      /* empty */
    }
    if (payload && payload.version) {
      this.versionName = payload.version;
      this.versionCode = makeVersionCode(this.versionName);
    }
    if (payload && payload.pkg) {
      this.pkg = payload.pkg;
    }
    if (payload && payload.tk) {
      this.openId = payload.tk;
      window.localStorage.setItem(this.ktk(this.pkg), this.openId);
    }
    this.openId = this.openId || this.uuid(this.pkg);
    return this.requestAnonymousLogin();
  }

  ktk(pkg: string): string {
    return `__${pkg || 'hela_pay'}__`;
  }

  uuid(pkg: string): string {
    return generateUUID(false, this.ktk(pkg));
  }

  wxJSPay(configObj: PayScanInfo, callback: WxJSPayCallback): void {
    const onBridgeReady = (): void => {
      const bridge = window.WeixinJSBridge;
      if (!bridge) return;
      bridge.invoke(
        'getBrandWCPayRequest',
        {
          appId: configObj.appId,
          timeStamp: configObj.timeStamp,
          nonceStr: configObj.nonceStr,
          package: `prepay_id=${configObj.prepayId}`,
          signType: 'MD5',
          paySign: configObj.sign,
        },
        function (res) {
          if (res.err_msg === 'get_brand_wcpay_request:ok') {
            if (callback) callback();
          }
        },
      );
    };

    if (typeof window.WeixinJSBridge === 'undefined') {
      if (document.addEventListener) {
        document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
      } else {
        const legacyDoc = document as unknown as {
          attachEvent?: (name: string, handler: () => void) => void;
        };
        if (legacyDoc.attachEvent) {
          legacyDoc.attachEvent('WeixinJSBridgeReady', onBridgeReady);
          legacyDoc.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
        }
      }
    } else {
      onBridgeReady();
    }
  }

  getHelaPayParams(): Record<string, unknown> {
    const browserInfo = getBrowserInfo();
    const ts = Date.now();
    const vc = md5(this.openId + this.pkg + this.versionName + browserInfo.lang + ts + this.SALT);
    const deviceName = browserInfo.osName || browserInfo.browserName;
    const deviceVersion = browserInfo.osVersion || browserInfo.browserVersion;

    return deepClone({
      h: window.screen.height,
      w: window.screen.width,
      model: deviceVersion,
      vendor: deviceVersion,
      sdk: deviceName,
      sdkvn: VERSION,
      pkg: this.pkg,
      thirdPlatformCode: this.thirdPlatformCode,
      v: this.versionCode,
      vn: this.versionName,
      tk: this.openId,
      lang: browserInfo.lang,
      os: browserInfo.osName,
      locale: browserInfo.lang,
      ts,
      vc,
      anid: this.openId,
      oaid: this.openId,
      brand: deviceName,
      channel: 'web',
    });
  }

  requestAnonymousLogin(): Promise<HelaResponse> {
    if (this.useMock) {
      return Promise.resolve(doMock.loginSuccess as HelaResponse);
    }
    const params = this.getHelaPayParams();
    if (!params || !params.pkg) {
      return Promise.reject({
        message: {
          code: 'F40002',
          messageInfo: '包名 pkg 不存在，初始化参数 pkg 必传',
        },
      });
    }
    return doRequest.post<HelaResponse>(
      `${this.baseURL}/user/login`,
      deepClone({
        pkg: params.pkg,
        tk: params.tk,
        anid: params.anid,
        os: params.os,
        thirdPlatformCode: params.thirdPlatformCode,
        type: this.clientType,
      }),
      {
        params: deepClone({
          ...params,
          type: this.clientType,
        }),
      },
    );
  }

  requestUserInfo(): Promise<UserInfo> {
    if (this.useMock) {
      return Promise.resolve(doMock.mockUserInfo);
    }
    return new Promise((resolve, reject) => {
      const params = this.getHelaPayParams();
      if (!params || !params.pkg) {
        reject({
          message: {
            code: 'F40004',
            messageInfo: '包名 pkg 不存在，请在 sdk 初始化后进行 request 请求',
          },
        });
        return;
      }
      doRequest
        .get<HelaResponse<UserInfo>>(`${this.baseURL}/user/info`, { params })
        .then((res) => {
          if (res && res.result) {
            this.wxOpenId = res.result.openId;
            resolve(res.result);
          } else {
            reject(res);
          }
        })
        .catch((err) => reject(err));
    });
  }

  requestAllSkuList(): Promise<SkuInfo[]> {
    if (this.useMock) {
      return Promise.resolve(doMock.mockSkuAll);
    }
    const params = this.getHelaPayParams();
    return new Promise((resolve, reject) => {
      if (!params || !params.pkg) {
        reject({
          message: {
            code: 'F40004',
            messageInfo: '包名 pkg 不存在，请在 sdk 初始化后进行 request 请求',
          },
        });
        return;
      }
      doRequest
        .get<HelaResponse<SkuInfo[]>>(`${this.baseURL}/sku/skuAll`, { params })
        .then((res) => {
          if (res && res.result && res.result.length) {
            resolve(res.result);
          } else {
            reject(res);
          }
        })
        .catch((err) => reject(err));
    });
  }

  requestCreateOrder(skuId: string, payType: number): Promise<PayScanInfo> {
    if (this.useMock) {
      return Promise.resolve(doMock.mockOrderInfo);
    }
    const params = this.getHelaPayParams();
    return new Promise((resolve, reject) => {
      if (!skuId) {
        reject({
          message: {
            code: 'F40003',
            messageInfo: 'skuId 必传',
          },
        });
        return;
      }
      if (!params || !params.pkg) {
        reject({
          message: {
            code: 'F40004',
            messageInfo: '包名 pkg 不存在，请在 sdk 初始化后进行 request 请求',
          },
        });
        return;
      }
      doRequest
        .post<HelaResponse<PayScanInfo>>(
          `${this.baseURL}/sku/payment/pay`,
          deepClone({ skuId, payType, miniOpenId: this.wxOpenId }),
          { params },
        )
        .then((res) => {
          if (res && res.result && res.result.payOrderId) {
            resolve({
              ...res.result,
              timeStamp: res.result.timeStamp || `${Date.now() / 1000}`,
              signType: res.result.signType || 'MD5',
            });
          } else {
            reject(res);
          }
        })
        .catch((err) => reject(err));
    });
  }

  requestPayScan(skuId: string): Promise<PayScanInfo> {
    return this.requestCreateOrder(skuId, 3);
  }

  requestWakeWeChatPay(skuId: string, inWechatWebView: boolean): Promise<PayScanInfo> {
    return new Promise((resolve, reject) => {
      if (this.clientType === 0) {
        if (!this.wxOpenId) {
          this.requestUserInfo().finally(() => {
            this.requestCreateOrder(skuId, inWechatWebView || this.clientType === 0 ? 0 : 2)
              .then((res) => resolve(res))
              .catch((err) => reject(err));
          });
          return;
        }
      }
      this.requestCreateOrder(skuId, inWechatWebView || this.clientType === 0 ? 0 : 2)
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
  }

  requestPayResult(payOrderId: string): Promise<boolean> {
    if (this.useMock) {
      return Promise.resolve(doMock.mockPayResult);
    }
    const params = this.getHelaPayParams();
    return new Promise((resolve, reject) => {
      if (!params || !params.pkg) {
        reject({
          message: {
            code: 'F40004',
            messageInfo: '包名 pkg 不存在，请在 sdk 初始化后进行 request 请求',
          },
        });
        return;
      }
      doRequest
        .get<HelaResponse<{ status: number }>>(`${this.baseURL}/sku/payment/${payOrderId}`, {
          params,
        })
        .then((res) => {
          if (res && res.result && res.result.status) {
            resolve(res.result.status === 1);
          } else {
            reject(res);
          }
        })
        .catch((err) => reject(err));
    });
  }
}

export default CoreHelaPay;
