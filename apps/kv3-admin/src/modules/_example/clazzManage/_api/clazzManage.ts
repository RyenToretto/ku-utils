import { axios } from '@/plugins/axios';

export type ClazzManageRow = {
  id: number;
  clazzName: string;
  status: number;
  schoolId: number | null;
  schoolName: string;
  createTime: string;
  [key: string]: unknown;
};

export function requestClazzManageList(params: Record<string, unknown>) {
  return axios.get('/example/clazz', { params });
}

export function requestEditClazzManage(payload: {
  id?: string | number;
  clazzName: string;
  status?: number;
  schoolId?: number | null;
  schoolName?: string;
}) {
  if (payload.id) {
    return axios.put(`/example/clazz/${payload.id}`, payload);
  }
  return axios.post('/example/clazz', payload);
}

export function requestDeleteClazzManage(payload: { id: string | number }) {
  return axios.delete(`/example/clazz/${payload.id}`);
}
