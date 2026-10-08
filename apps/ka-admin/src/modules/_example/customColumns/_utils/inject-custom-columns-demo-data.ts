import { afterNextRender, inject, signal } from '@angular/core';

import {
  CustomColumnsApi,
  type CustomColumnsDemoRow,
} from '@/modules/_example/customColumns/_api/custom-columns';

/** 自定义列 Demo 数据（对齐 kr `useCustomColumnsDemoData`）；须在注入上下文调用 */
export function injectCustomColumnsDemoData() {
  const api = inject(CustomColumnsApi);
  const tableLoading = signal(false);
  const tableData = signal<CustomColumnsDemoRow[]>([]);

  const fetchDemoData = async () => {
    tableLoading.set(true);
    try {
      const res = await api.requestCustomColumnsList();
      tableData.set(res.data?.lists || []);
    } finally {
      tableLoading.set(false);
    }
  };

  afterNextRender(() => void fetchDemoData());

  return {
    tableLoading: tableLoading.asReadonly(),
    tableData: tableData.asReadonly(),
    fetchDemoData,
  };
}
