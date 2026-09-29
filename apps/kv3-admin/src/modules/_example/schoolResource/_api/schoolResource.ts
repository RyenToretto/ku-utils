import { axios } from '@/plugins/axios';

export type SchoolResourceRow = {
  id: string;
  schoolName: string;
  status: number;
  remark: string;
  createTime: string;
  [key: string]: unknown;
};

export function requestSchoolResourcePage(params: Record<string, unknown>, signal?: AbortSignal) {
  return axios.get('/example/school/page', { params, signal });
}

export function requestEditSchoolResource(payload: {
  id?: string;
  schoolName: string;
  status?: number;
  remark?: string;
}) {
  if (payload.id) {
    return axios.put(`/example/school/${payload.id}`, payload);
  }
  return axios.post('/example/school', payload);
}

export function requestDeleteSchoolResource(payload: { id: string }) {
  return axios.delete(`/example/school/${payload.id}`);
}

export function requestBatchSwitchSchoolResource(ids: string[], status: number) {
  return axios.post('/example/school/batch', { ids, status });
}
