import { inject, Injectable } from '@angular/core';

import type { PageData } from '@/api/envelope';
import { ApiClient } from '@/plugins/http';

export type ClubSchoolItem = {
  id: string;
  schoolName: string;
};

export type ClubActivityRow = {
  id: number;
  clubName: string;
  status: number;
  schools: ClubSchoolItem[];
  createTime: string;
  [key: string]: unknown;
};

@Injectable({ providedIn: 'root' })
export class ClubActivityApi {
  private readonly api = inject(ApiClient);

  requestClubActivityList(params: Record<string, unknown>, signal?: AbortSignal) {
    return this.api.get<PageData<ClubActivityRow>>('/example/club', { params, signal });
  }

  requestEditClubActivity(payload: {
    id?: string | number;
    clubName: string;
    status?: number;
    schools?: ClubSchoolItem[];
  }) {
    if (payload.id) return this.api.put(`/example/club/${payload.id}`, payload);
    return this.api.post('/example/club', payload);
  }

  requestDeleteClubActivity(payload: { id: string | number }) {
    return this.api.delete(`/example/club/${payload.id}`);
  }

  requestBatchSwitchClubActivity(ids: Array<string | number>, status: number) {
    return this.api.post('/example/club/batch', { ids, status });
  }
}
