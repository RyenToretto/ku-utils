import { inject, Injectable } from '@angular/core';

import { ApiClient } from '@/plugins/http';

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

@Injectable({ providedIn: 'root' })
export class UserApi {
  private readonly api = inject(ApiClient);

  /** 当前账号信息：对齐 juxiao-dsp `GET /api/user/info`（AccountInfoDTO） */
  requestUserInfo() {
    return this.api.get<UserInfoData>('/user/info');
  }
}
