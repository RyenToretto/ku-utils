import { inject, Injectable } from '@angular/core';

import type { PageData } from '@/api/envelope';
import { ApiClient } from '@/plugins/http';

export type SimpleExampleRow = {
  id: string | number;
  exampleName: string;
  pkg?: string;
  taskAction?: string | number;
  status: number;
  createTime?: string;
  [key: string]: unknown;
};

@Injectable({ providedIn: 'root' })
export class SimpleExampleApi {
  private readonly api = inject(ApiClient);

  requestSimpleExampleList(params: Record<string, unknown>, signal?: AbortSignal) {
    return this.api.get<PageData<SimpleExampleRow>>('/example/simple', { params, signal });
  }

  requestEditSimpleExample(payload: {
    id?: string | number;
    exampleName: string;
    status?: number;
  }) {
    if (payload.id) return this.api.put(`/example/simple/${payload.id}`, payload);
    return this.api.post('/example/simple', payload);
  }

  requestDeleteSimpleExample(payload: { id: string | number }) {
    return this.api.delete(`/example/simple/${payload.id}`);
  }

  requestBatchSimpleExample(ids: Array<string | number>, status: number) {
    return this.api.post('/example/simple/batch', { ids, status });
  }
}
