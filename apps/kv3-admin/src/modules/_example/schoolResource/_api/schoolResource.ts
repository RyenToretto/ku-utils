import { axios } from '@/plugins/axios';

export type SchoolResourceRow = {
  id: number;
  schoolName: string;
  status: number;
  remark: string;
  createTime: string;
  [key: string]: unknown;
};

export function requestSchoolResourceList(params: Record<string, unknown>) {
  return axios.get('/example/school', { params });
}

export function requestEditSchoolResource(payload: {
  id?: string | number;
  schoolName: string;
  status?: number;
  remark?: string;
}) {
  if (payload.id) {
    return axios.put(`/example/school/${payload.id}`, payload);
  }
  return axios.post('/example/school', payload);
}

export function requestDeleteSchoolResource(payload: { id: string | number }) {
  return axios.delete(`/example/school/${payload.id}`);
}

export function requestBatchSwitchSchoolResource(ids: Array<string | number>, status: number) {
  return axios.post('/example/school/batch', { ids, status });
}
