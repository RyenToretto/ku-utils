import { inject, Injectable } from '@angular/core';

import type { PageData } from '@/api/envelope';
import { ApiClient } from '@/plugins/http';

export type SchoolResourceRow = {
  id: string;
  schoolName: string;
  status: number;
  remark: string;
  createTime: string;
  [key: string]: unknown;
};

@Injectable({ providedIn: 'root' })
export class SchoolResourceApi {
  private readonly api = inject(ApiClient);

  requestSchoolResourcePage(params: Record<string, unknown>, signal?: AbortSignal) {
    return this.api.get<PageData<SchoolResourceRow>>('/example/school/page', { params, signal });
  }

  requestEditSchoolResource(payload: {
    id?: string;
    schoolName: string;
    status?: number;
    remark?: string;
  }) {
    if (payload.id) return this.api.put(`/example/school/${payload.id}`, payload);
    return this.api.post('/example/school', payload);
  }

  requestDeleteSchoolResource(payload: { id: string }) {
    return this.api.delete(`/example/school/${payload.id}`);
  }

  requestBatchSwitchSchoolResource(ids: string[], status: number) {
    return this.api.post('/example/school/batch', { ids, status });
  }
}
