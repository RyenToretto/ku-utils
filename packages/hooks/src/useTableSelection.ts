import { computed, ref } from 'vue';
import type { ComputedRef, Ref } from 'vue';

export interface UseTableSelectionOptions<T = any> {
  /** 行唯一标识字段名，或自定义取值函数，默认 'id' */
  rowKey?: keyof T | ((row: T) => string | number);
  /** 是否多选，默认 true */
  multiple?: boolean;
}

export interface UseTableSelectionReturn<T = any> {
  selectedRows: Ref<T[]>;
  selectedIds: ComputedRef<(string | number)[]>;
  selectStatus: ComputedRef<'none' | 'half' | 'all'>;
  /** 绑定 el-table @selection-change */
  onSelectionChange: (rows: T[]) => void;
  /** 手动切换单行选中状态（卡片模式等非 el-table 场景） */
  toggleRow: (row: T) => void;
  /** 全选 / 取消全选（需先通过 setAllRows 设置全量数据） */
  toggleAll: () => void;
  /** 设置当前页全量数据（用于全选状态计算） */
  setAllRows: (rows: T[]) => void;
  clearSelection: () => void;
  isSelected: (row: T) => boolean;
}

function getRowId<T>(row: T, rowKey: keyof T | ((row: T) => string | number)): string | number {
  if (typeof rowKey === 'function') {
    return rowKey(row);
  }
  return row[rowKey] as string | number;
}

export function useTableSelection<T = any>(
  options: UseTableSelectionOptions<T> = {},
): UseTableSelectionReturn<T> {
  const { rowKey = 'id' as keyof T, multiple = true } = options;

  const selectedRows: Ref<T[]> = ref([]);
  const allRows: Ref<T[]> = ref([]);

  const selectedIds = computed<(string | number)[]>(() =>
    selectedRows.value.map((row) => getRowId(row, rowKey)),
  );

  const selectStatus = computed<'none' | 'half' | 'all'>(() => {
    if (!allRows.value.length || !selectedRows.value.length) return 'none';
    const allSelected = allRows.value.every((row) =>
      selectedIds.value.includes(getRowId(row, rowKey)),
    );
    return allSelected ? 'all' : 'half';
  });

  function isSelected(row: T): boolean {
    return selectedIds.value.includes(getRowId(row, rowKey));
  }

  function onSelectionChange(rows: T[]): void {
    selectedRows.value = rows;
  }

  function toggleRow(row: T): void {
    const id = getRowId(row, rowKey);
    const idx = selectedRows.value.findIndex((r) => getRowId(r, rowKey) === id);
    if (idx >= 0) {
      selectedRows.value.splice(idx, 1);
    } else if (multiple) {
      selectedRows.value.push(row);
    } else {
      selectedRows.value = [row];
    }
  }

  function toggleAll(): void {
    if (selectStatus.value === 'all') {
      const allIds = allRows.value.map((r) => getRowId(r, rowKey));
      selectedRows.value = selectedRows.value.filter((r) => !allIds.includes(getRowId(r, rowKey)));
    } else {
      for (const row of allRows.value) {
        const id = getRowId(row, rowKey);
        if (!selectedIds.value.includes(id)) {
          selectedRows.value.push(row);
        }
      }
    }
  }

  function setAllRows(rows: T[]): void {
    allRows.value = rows;
  }

  function clearSelection(): void {
    selectedRows.value = [];
  }

  return {
    selectedRows,
    selectedIds,
    selectStatus,
    onSelectionChange,
    toggleRow,
    toggleAll,
    setAllRows,
    clearSelection,
    isSelected,
  };
}
