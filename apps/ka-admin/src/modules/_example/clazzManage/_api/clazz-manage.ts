import { inject, Injectable } from '@angular/core';

import type { PageData } from '@/api/envelope';
import { ApiClient } from '@/plugins/http';

export type ClazzManageRow = {
  id: number;
  clazzName: string;
  status: number;
  schoolId: string | null;
  schoolName: string;
  createTime: string;
  [key: string]: unknown;
};

@Injectable({ providedIn: 'root' })
export class ClazzManageApi {
  private readonly api = inject(ApiClient);

  requestClazzManageList(params: Record<string, unknown>, signal?: AbortSignal) {
    return this.api.get<PageData<ClazzManageRow>>('/example/clazz', { params, signal });
  }

  requestEditClazzManage(payload: {
    id?: string | number;
    clazzName: string;
    status?: number;
    schoolId?: string | null;
    schoolName?: string;
  }) {
    if (payload.id) return this.api.put(`/example/clazz/${payload.id}`, payload);
    return this.api.post('/example/clazz', payload);
  }

  requestDeleteClazzManage(payload: { id: string | number }) {
    return this.api.delete(`/example/clazz/${payload.id}`);
  }
}
