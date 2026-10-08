import { computed, signal, type Signal } from '@angular/core';

export type RowSelectorStatus = 'none-selected' | 'half-selected' | 'all-selected';

type RowId = string | number;

export type InjectRowSelectorOptions<T extends object> = {
  /** 当前页行数据 */
  tableData: Signal<T[]>;
  lineKey?: keyof T & string;
  isMultiple?: boolean;
  /** 外部已选 id（仅用于回显；未进入本地选中时显示为半透明） */
  checkedIds?: Signal<RowId[]>;
  disabledIds?: Signal<RowId[]>;
  /** 首次创建时的已选行（跨页回填用完整行，避免只剩 id） */
  initialSelected?: T[];
  onChange?: (value: T | T[] | undefined) => void;
};

function sameId(a: unknown, b: unknown) {
  return String(a) === String(b);
}

/** 表格行选中（单/多选、跨页保留、表头批量），对齐 kv3 / kr `useRowSelector` */
export function injectRowSelector<T extends object>(options: InjectRowSelectorOptions<T>) {
  const lineKey = options.lineKey || 'id';
  const isMultiple = options.isMultiple ?? true;
  const selected = signal<T[]>(options.initialSelected ? [...options.initialSelected] : []);

  const keyOf = (row: T) => (row as Record<string, unknown>)[lineKey] as RowId;
  const inList = (list: T[], id: RowId) => list.some((row) => sameId(keyOf(row), id));

  function commit(next: T[], silent = false) {
    selected.set(next);
    if (silent) return;
    options.onChange?.(isMultiple ? [...next] : next[0]);
  }

  function chooseRow(row: T) {
    const id = keyOf(row);
    if (!isMultiple) {
      commit([row]);
      return;
    }
    if ((options.disabledIds?.() || []).some((cid) => sameId(cid, id))) return;
    const list = selected();
    commit(inList(list, id) ? list.filter((item) => !sameId(keyOf(item), id)) : [...list, row]);
  }

  function toggleBatchSelect() {
    const page = options.tableData();
    const list = selected();
    const allSelected = page.length > 0 && page.every((row) => inList(list, keyOf(row)));
    if (allSelected) {
      commit(list.filter((item) => !inList(page, keyOf(item))));
      return;
    }
    commit([...list, ...page.filter((row) => !inList(list, keyOf(row)))]);
  }

  /** 回显已选；silent 时不触发 onChange */
  function setChecked(ids: RowId[], originList: T[] = [], silent = false) {
    const page = options.tableData();
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

  const statusOfSelect = computed<RowSelectorStatus>(() => {
    const page = options.tableData();
    const list = selected();
    const pageSelectedCount = page.filter((row) => inList(list, keyOf(row))).length;
    if (!page.length || !pageSelectedCount) return 'none-selected';
    return pageSelectedCount < page.length ? 'half-selected' : 'all-selected';
  });

  function isRowSelected(row: T) {
    const id = keyOf(row);
    return inList(selected(), id) || (options.checkedIds?.() || []).some((cid) => sameId(cid, id));
  }

  function isRowTransparent(row: T) {
    const id = keyOf(row);
    return (options.checkedIds?.() || []).some((cid) => sameId(cid, id)) && !inList(selected(), id);
  }

  return {
    selectRows: selected.asReadonly(),
    statusOfSelect,
    isRowSelected,
    isRowTransparent,
    chooseRow,
    toggleBatchSelect,
    setChecked,
    clearSelection,
  };
}

export type RowSelector<T extends object> = ReturnType<typeof injectRowSelector<T>>;
