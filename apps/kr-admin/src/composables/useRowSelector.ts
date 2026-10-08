import { useMemo, useReducer, useRef } from 'react';

export type RowSelectorStatus = 'none-selected' | 'half-selected' | 'all-selected';

type RowId = string | number;

export type UseRowSelectorOptions<T extends object> = {
  /** 当前页行数据 */
  tableData: T[];
  lineKey?: keyof T & string;
  isMultiple?: boolean;
  /** 外部已选 id（仅用于回显；未进入本地选中时显示为半透明） */
  checkedIds?: RowId[];
  disabledIds?: RowId[];
  /** 首次挂载时的已选行（跨页回填用完整行，避免只剩 id） */
  initialSelected?: T[];
  onChange?: (value: T | T[] | undefined) => void;
};

function sameId(a: unknown, b: unknown) {
  return String(a) === String(b);
}

/** 表格行选中（单/多选、跨页保留、表头批量），对齐 kv3 `useRowSelector` */
export function useRowSelector<T extends object>(options: UseRowSelectorOptions<T>) {
  const optsRef = useRef(options);
  optsRef.current = options;
  const selectedRef = useRef<T[]>(options.initialSelected ? [...options.initialSelected] : []);
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  const api = useMemo(() => {
    const keyOf = (row: T) =>
      (row as Record<string, unknown>)[optsRef.current.lineKey || 'id'] as RowId;
    const inList = (list: T[], id: RowId) => list.some((row) => sameId(keyOf(row), id));
    const isMultiple = () => optsRef.current.isMultiple ?? true;

    function commit(next: T[], silent = false) {
      selectedRef.current = next;
      rerender();
      if (silent) return;
      optsRef.current.onChange?.(isMultiple() ? [...next] : next[0]);
    }

    function chooseRow(row: T) {
      const id = keyOf(row);
      if (!isMultiple()) {
        commit([row]);
        return;
      }
      if ((optsRef.current.disabledIds || []).some((cid) => sameId(cid, id))) return;
      const list = selectedRef.current;
      commit(inList(list, id) ? list.filter((item) => !sameId(keyOf(item), id)) : [...list, row]);
    }

    function toggleBatchSelect() {
      const page = optsRef.current.tableData;
      const list = selectedRef.current;
      const allSelected = page.length > 0 && page.every((row) => inList(list, keyOf(row)));
      if (allSelected) {
        commit(list.filter((item) => !inList(page, keyOf(item))));
        return;
      }
      commit([...list, ...page.filter((row) => !inList(list, keyOf(row)))]);
    }

    /** 回显已选；silent 时不触发 onChange */
    function setChecked(ids: RowId[], originList: T[] = [], silent = false) {
      const page = optsRef.current.tableData;
      const lineKey = optsRef.current.lineKey || 'id';
      const rows = ids.map(
        (id) =>
          page.find((row) => sameId(keyOf(row), id)) ||
          originList.find((row) => sameId(keyOf(row), id)) ||
          ({ [lineKey]: id } as T),
      );
      commit(rows, silent);
    }

    function clearSelection() {
      commit([]);
    }

    return { keyOf, inList, chooseRow, toggleBatchSelect, setChecked, clearSelection };
  }, []);

  const selectRows = selectedRef.current;
  const { tableData, checkedIds = [] } = options;
  const pageSelectedCount = tableData.filter((row) =>
    api.inList(selectRows, api.keyOf(row)),
  ).length;
  const statusOfSelect: RowSelectorStatus =
    !tableData.length || !pageSelectedCount
      ? 'none-selected'
      : pageSelectedCount < tableData.length
        ? 'half-selected'
        : 'all-selected';

  function isRowSelected(row: T) {
    const id = api.keyOf(row);
    return api.inList(selectRows, id) || checkedIds.some((cid) => sameId(cid, id));
  }

  function isRowTransparent(row: T) {
    const id = api.keyOf(row);
    return checkedIds.some((cid) => sameId(cid, id)) && !api.inList(selectRows, id);
  }

  return {
    selectRows,
    statusOfSelect,
    isRowSelected,
    isRowTransparent,
    chooseRow: api.chooseRow,
    toggleBatchSelect: api.toggleBatchSelect,
    setChecked: api.setChecked,
    clearSelection: api.clearSelection,
  };
}

export type RowSelector<T extends object> = ReturnType<typeof useRowSelector<T>>;
