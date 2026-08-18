import { axios, submitLogout } from '@/plugins/axios';

/** 当前账号信息：对齐 juxiao-dsp `GET /api/user/info`（AccountInfoDTO） */
export function requestUserInfo() {
  return axios.get('/user/info');
}

export { submitLogout };
