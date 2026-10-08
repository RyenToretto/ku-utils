import { inject, Injectable } from '@angular/core';

import type { PageData } from '@/api/envelope';
import { ApiClient } from '@/plugins/http';

export type CustomColumnsDemoRow = {
  id: number;
  name: string;
  amount: number;
  score: number;
  cost: number;
  roi: number;
  rate: number;
  [key: string]: unknown;
};

@Injectable({ providedIn: 'root' })
export class CustomColumnsApi {
  private readonly api = inject(ApiClient);

  requestCustomColumnsList() {
    return this.api.get<PageData<CustomColumnsDemoRow>>('/example/custom-columns/list');
  }
}
