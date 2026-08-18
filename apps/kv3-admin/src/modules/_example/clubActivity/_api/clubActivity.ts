import { axios } from '@/plugins/axios';

export type ClubSchoolItem = {
  id: number;
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

export function requestClubActivityList(params: Record<string, unknown>) {
  return axios.get('/example/club', { params });
}

export function requestEditClubActivity(payload: {
  id?: string | number;
  clubName: string;
  status?: number;
  schools?: ClubSchoolItem[];
}) {
  if (payload.id) {
    return axios.put(`/example/club/${payload.id}`, payload);
  }
  return axios.post('/example/club', payload);
}

export function requestDeleteClubActivity(payload: { id: string | number }) {
  return axios.delete(`/example/club/${payload.id}`);
}

export function requestBatchSwitchClubActivity(ids: Array<string | number>, status: number) {
  return axios.post('/example/club/batch', { ids, status });
}
