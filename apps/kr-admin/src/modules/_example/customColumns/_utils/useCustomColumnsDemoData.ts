import { useCallback, useEffect, useState } from 'react';

import { axios } from '@/plugins/axios';

export type DemoRow = {
  id: number;
  name: string;
  amount: number;
  score: number;
  cost: number;
  roi: number;
  rate: number;
  [key: string]: unknown;
};

export function useCustomColumnsDemoData() {
  const [tableLoading, setTableLoading] = useState(false);
  const [tableData, setTableData] = useState<DemoRow[]>([]);

  const fetchDemoData = useCallback(async () => {
    setTableLoading(true);
    try {
      const res = (await axios.get('/example/custom-columns/list')) as {
        data: { lists: DemoRow[] };
      };
      setTableData(res.data?.lists || []);
    } finally {
      setTableLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchDemoData();
  }, [fetchDemoData]);

  return { tableLoading, tableData, fetchDemoData };
}
