import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

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

export const useUserStore = defineStore('user', () => {
  const id = ref('');
  const name = ref('');
  const nickName = ref('');
  const mail = ref('');
  const phone = ref('');
  const tenantId = ref('');
  const tenantName = ref('');
  const master = ref(false);
  const permissionType = ref<number | null>(null);
  const permissions = ref<string[]>([]);
  const accessDenied = ref<AccessDeniedState | null>(null);

  const isLoggedIn = computed(() => id.value !== '');

  async function fetchUserInfo() {
    const res = (await requestUserInfo()) as { data?: UserInfoData };
    const info = res?.data;
    if (!info || info.id == null || info.id === '') {
      throw new Error('会话信息无效');
    }

    id.value = String(info.id);
    name.value = String(info.name ?? '');
    nickName.value = String(info.nickName ?? info.name ?? '');
    mail.value = '';
    phone.value = '';
    tenantId.value = info.tenantId == null ? '' : String(info.tenantId);
    tenantName.value = info.tenantName == null ? '' : String(info.tenantName);
    master.value = Boolean(info.isMaster);
    permissionType.value =
      info.permissionType == null || Number.isNaN(Number(info.permissionType))
        ? null
        : Number(info.permissionType);
    permissions.value = Array.isArray(info.permissions) ? info.permissions.map(String) : [];
    accessDenied.value = null;

    return info;
  }

  function hasPermission(key: string | RegExp) {
    if (key instanceof RegExp) {
      return permissions.value.some((v) => key.test(v));
    }
    return permissions.value.includes(key);
  }

  function markAccessDenied(payload?: AccessDeniedState) {
    accessDenied.value = payload ?? {};
  }

  function markAccessDeniedFromError(err: unknown) {
    const anyErr = err as { code?: string | number; serverMessage?: string };
    markAccessDenied({
      code: anyErr.code,
      detail: typeof anyErr.serverMessage === 'string' ? anyErr.serverMessage : undefined,
    });
  }

  function markNoPermissionDenied() {
    markAccessDenied({ detail: '当前账号无功能权限' });
  }

  function clearSession() {
    id.value = '';
    name.value = '';
    nickName.value = '';
    mail.value = '';
    phone.value = '';
    tenantId.value = '';
    tenantName.value = '';
    master.value = false;
    permissionType.value = null;
    permissions.value = [];
    accessDenied.value = null;
  }

  return {
    id,
    name,
    nickName,
    mail,
    phone,
    tenantId,
    tenantName,
    master,
    permissionType,
    permissions,
    accessDenied,
    isLoggedIn,
    fetchUserInfo,
    hasPermission,
    markAccessDenied,
    markAccessDeniedFromError,
    markNoPermissionDenied,
    clearSession,
  };
});
