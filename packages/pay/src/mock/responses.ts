import type { PayScanInfo, SkuInfo, UserInfo } from '../types';

export const mockUserInfo: UserInfo = {
  id: '1747833703297495041',
  pkg: 'web.mangu.camera.ai',
  token: 'd36ffb90909d0281b91663cca0dcdc99',
  vipExpireTime: '',
  biz_id: '',
  name: 'DMMo5j6',
  isVip: 0,
  isForeverVip: 0,
  nickName: 0 as unknown as number,
  avatar: '',
  openId: '',
};

export const mockSkuAll: SkuInfo[] = [
  {
    id: '1717465926565179393',
    showPrice: 990,
  },
];

export const mockOrderInfo: PayScanInfo = {
  payOrderId: '8764723878477283',
  orderStr: 'fmkj4389uh4fngb3n92hr9f893h3298rf',
  appId: 'k8874hh2114',
  timeStamp: '1712938746813',
  nonceStr: 'nvhb293hrbf2bd932dn23d',
  prepayId: '903847398293848',
  signType: 'MD5',
  sign: 'gmn87389j4ng8n73804hfg28093hr280rh2903fh3802j',
};

export const mockPayResult = true;
