import { axios } from '@/plugins/axios';

export function requestSimpleExampleList(params: Record<string, unknown>) {
  return axios.get('/example/simple', { params });
}

export function requestEditSimpleExample(payload: {
  id?: string | number;
  exampleName: string;
  status?: number;
}) {
  if (payload.id) {
    return axios.put(`/example/simple/${payload.id}`, payload);
  }
  return axios.post('/example/simple', payload);
}

export function requestDeleteSimpleExample(payload: { id: string | number }) {
  return axios.delete(`/example/simple/${payload.id}`);
}

export function requestBatchSimpleExample(ids: Array<string | number>, status: number) {
  return axios.post('/example/simple/batch', { ids, status });
}
