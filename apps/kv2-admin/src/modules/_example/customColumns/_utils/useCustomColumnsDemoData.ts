import { ref, onMounted } from 'vue';

import { axios } from '@/plugins/axios';

export type DemoRow = {
  id: number;
  name: string;
  amount: number;
  score: number;
  cost: number;
  roi: number;
  rate: number;
};

export function useCustomColumnsDemoData() {
  const tableLoading = ref(false);
  const tableData = ref<DemoRow[]>([]);

  async function fetchDemoData() {
    tableLoading.value = true;
    try {
      const res = (await axios.get('/example/custom-columns/list')) as {
        data: { lists: DemoRow[] };
      };
      tableData.value = res.data?.lists || [];
    } finally {
      tableLoading.value = false;
    }
  }

  onMounted(() => {
    void fetchDemoData();
  });

  return { tableLoading, tableData, fetchDemoData };
}
