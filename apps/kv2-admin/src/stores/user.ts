import { defineStore } from 'pinia';

import { requestUserInfo } from '@/api/common/user';

/** 对齐 juxiao-dsp AccountInfoDTO（`GET /api/user/info`） */
export interface UserInfoData {
  id: string | number;
  name: string;
  tenantId?: string | number | null;
  tenantName?: string | null;
  nickName?: string | null;
  isMaster?: boolean;
  permissionType?: number | null;
  permissions?: string[];
}

export interface AccessDeniedState {
  code?: string | number;
  detail?: string;
}

/**
 * Options Store：Vue 2.7 下 setup store 的 ref 不会像 Vue3 那样经 reactive 自动解包，
 * 会导致 `if (userStore.accessDenied)` 恒为真。Options API 形态在 Pinia2+Vue2 上可直接读字段。
 * 依赖 `scripts/ensure-vue-demi-vue27.mjs` 锁定 vue-demi 2.7（同 app store）。
 */
export const useUserStore = defineStore('user', {
  state: () => ({
    id: '',
    name: '',
    nickName: '',
    mail: '',
    phone: '',
    tenantId: '',
    tenantName: '',
    master: false,
    permissionType: null as number | null,
    permissions: [] as string[],
    accessDenied: null as AccessDeniedState | null,
  }),
  getters: {
    isLoggedIn: (state) => state.id !== '',
  },
  actions: {
    async fetchUserInfo() {
      const res = (await requestUserInfo()) as { data?: UserInfoData };
      const info = res?.data;
      if (!info || info.id == null || info.id === '') {
        throw new Error('会话信息无效');
      }

      this.id = String(info.id);
      this.name = String(info.name ?? '');
      this.nickName = String(info.nickName ?? info.name ?? '');
      this.mail = '';
      this.phone = '';
      this.tenantId = info.tenantId == null ? '' : String(info.tenantId);
      this.tenantName = info.tenantName == null ? '' : String(info.tenantName);
      this.master = Boolean(info.isMaster);
      this.permissionType =
        info.permissionType == null || Number.isNaN(Number(info.permissionType))
          ? null
          : Number(info.permissionType);
      this.permissions = Array.isArray(info.permissions) ? info.permissions.map(String) : [];
      this.accessDenied = null;

      return info;
    },

    hasPermission(key: string | RegExp) {
      if (key instanceof RegExp) {
        return this.permissions.some((v) => key.test(v));
      }
      return this.permissions.includes(key);
    },

    markAccessDenied(payload?: AccessDeniedState) {
      this.accessDenied = payload ?? {};
    },

    markAccessDeniedFromError(err: unknown) {
      const anyErr = err as { code?: string | number; serverMessage?: string };
      this.markAccessDenied({
        code: anyErr.code,
        detail: typeof anyErr.serverMessage === 'string' ? anyErr.serverMessage : undefined,
      });
    },

    markNoPermissionDenied() {
      this.markAccessDenied({ detail: '当前账号无功能权限' });
    },

    clearSession() {
      this.id = '';
      this.name = '';
      this.nickName = '';
      this.mail = '';
      this.phone = '';
      this.tenantId = '';
      this.tenantName = '';
      this.master = false;
      this.permissionType = null;
      this.permissions = [];
      this.accessDenied = null;
    },
  },
});
