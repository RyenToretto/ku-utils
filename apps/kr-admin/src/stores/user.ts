import { create } from 'zustand';

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

type UserState = {
  id: string;
  name: string;
  nickName: string;
  mail: string;
  phone: string;
  tenantId: string;
  tenantName: string;
  master: boolean;
  permissionType: number | null;
  permissions: string[];
  accessDenied: AccessDeniedState | null;
  isLoggedIn: boolean;
  fetchUserInfo: () => Promise<UserInfoData>;
  hasPermission: (key: string | RegExp) => boolean;
  markAccessDenied: (payload?: AccessDeniedState) => void;
  markAccessDeniedFromError: (err: unknown) => void;
  markNoPermissionDenied: () => void;
  clearSession: () => void;
};

function computeLoggedIn(id: string) {
  return id !== '';
}

export const useUserStore = create<UserState>((set, get) => ({
  id: '',
  name: '',
  nickName: '',
  mail: '',
  phone: '',
  tenantId: '',
  tenantName: '',
  master: false,
  permissionType: null,
  permissions: [],
  accessDenied: null,
  isLoggedIn: false,

  async fetchUserInfo() {
    const res = (await requestUserInfo()) as { data?: UserInfoData };
    const info = res?.data;
    if (!info || info.id == null || info.id === '') {
      throw new Error('会话信息无效');
    }

    const id = String(info.id);
    set({
      id,
      name: String(info.name ?? ''),
      nickName: String(info.nickName ?? info.name ?? ''),
      mail: '',
      phone: '',
      tenantId: info.tenantId == null ? '' : String(info.tenantId),
      tenantName: info.tenantName == null ? '' : String(info.tenantName),
      master: Boolean(info.isMaster),
      permissionType:
        info.permissionType == null || Number.isNaN(Number(info.permissionType))
          ? null
          : Number(info.permissionType),
      permissions: Array.isArray(info.permissions) ? info.permissions.map(String) : [],
      accessDenied: null,
      isLoggedIn: computeLoggedIn(id),
    });

    return info;
  },

  hasPermission(key) {
    const permissions = get().permissions;
    if (key instanceof RegExp) {
      return permissions.some((v) => key.test(v));
    }
    return permissions.includes(key);
  },

  markAccessDenied(payload) {
    set({ accessDenied: payload ?? {} });
  },

  markAccessDeniedFromError(err) {
    const anyErr = err as { code?: string | number; serverMessage?: string };
    get().markAccessDenied({
      code: anyErr.code,
      detail: typeof anyErr.serverMessage === 'string' ? anyErr.serverMessage : undefined,
    });
  },

  markNoPermissionDenied() {
    get().markAccessDenied({ detail: '当前账号无功能权限' });
  },

  clearSession() {
    set({
      id: '',
      name: '',
      nickName: '',
      mail: '',
      phone: '',
      tenantId: '',
      tenantName: '',
      master: false,
      permissionType: null,
      permissions: [],
      accessDenied: null,
      isLoggedIn: false,
    });
  },
}));
