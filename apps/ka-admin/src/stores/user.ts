import { computed, inject, Injectable, signal } from '@angular/core';

import { UserApi } from '@/api/common/user';

export interface AccessDeniedState {
  code?: string | number;
  detail?: string;
}

interface UserState {
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
}

const EMPTY_USER: UserState = {
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
};

/** 当前账号（对齐 kr `stores/user.ts` / kv3 Pinia user store） */
@Injectable({ providedIn: 'root' })
export class UserStore {
  private readonly userApi = inject(UserApi);
  private readonly state = signal<UserState>(EMPTY_USER);

  readonly id = computed(() => this.state().id);
  readonly name = computed(() => this.state().name);
  readonly nickName = computed(() => this.state().nickName);
  readonly mail = computed(() => this.state().mail);
  readonly tenantName = computed(() => this.state().tenantName);
  readonly permissions = computed(() => this.state().permissions);
  readonly accessDenied = computed(() => this.state().accessDenied);
  readonly isLoggedIn = computed(() => this.state().id !== '');

  async fetchUserInfo() {
    const res = await this.userApi.requestUserInfo();
    const info = res?.data;
    if (!info || info.id == null || info.id === '') {
      throw new Error('会话信息无效');
    }

    this.state.set({
      id: String(info.id),
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
    });

    return info;
  }

  hasPermission(key: string | RegExp): boolean {
    const permissions = this.state().permissions;
    if (key instanceof RegExp) return permissions.some((v) => key.test(v));
    return permissions.includes(key);
  }

  markAccessDenied(payload?: AccessDeniedState) {
    this.state.update((s) => ({ ...s, accessDenied: payload ?? {} }));
  }

  markAccessDeniedFromError(err: unknown) {
    const anyErr = err as { code?: string | number; serverMessage?: string };
    this.markAccessDenied({
      code: anyErr.code,
      detail: typeof anyErr.serverMessage === 'string' ? anyErr.serverMessage : undefined,
    });
  }

  markNoPermissionDenied() {
    this.markAccessDenied({ detail: '当前账号无功能权限' });
  }

  clearSession() {
    this.state.set(EMPTY_USER);
  }
}
