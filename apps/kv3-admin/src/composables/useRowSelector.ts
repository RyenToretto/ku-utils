import { computed, ref, type Ref } from 'vue';

export type RowSelectorStatus = 'none-selected' | 'half-selected' | 'all-selected';

export type UseRowSelectorOptions<T extends Record<string, unknown>> = {
  /** 当前页行数据 */
  tableData: Ref<T[]>;
  lineKey?: keyof T & string;
  isMultiple?: Ref<boolean> | boolean;
  enableCache?: Ref<boolean> | boolean;
  enableSelector?: Ref<boolean> | boolean;
  checkedIds?: Ref<Array<string | number>> | Array<string | number>;
  disabledIds?: Ref<Array<string | number>> | Array<string | number>;
  onChange?: (value: T | T[] | undefined) => void;
};

function unwrapBool(v: Ref<boolean> | boolean | undefined, fallback: boolean): boolean {
  if (v == null) return fallback;
  return typeof v === 'boolean' ? v : v.value;
}

function unwrapIds(
  v: Ref<Array<string | number>> | Array<string | number> | undefined,
): Array<string | number> {
  if (v == null) return [];
  return Array.isArray(v) ? v : v.value;
}

function sameId(a: unknown, b: unknown) {
  return String(a) === String(b);
}

/** 表格行选中（单/多选、跨页缓存、表头批量） */
export function useRowSelector<T extends Record<string, unknown>>(
  options: UseRowSelectorOptions<T>,
) {
  const lineKey = (options.lineKey || 'id') as keyof T & string;
  const selectRows = ref<T[]>([]) as Ref<T[]>;
  const cacheSelected = ref<T[]>([]) as Ref<T[]>;

  const statusOfSelect = computed<RowSelectorStatus>(() => {
    const list = options.tableData.value;
    if (!list.length) return 'none-selected';
    let cannotBeAll = false;
    let cannotBeNone = false;
    for (const each of list) {
      const selected = selectRows.value.some((s) => sameId(s[lineKey], each[lineKey]));
      if (!selected) cannotBeAll = true;
      if (selected) cannotBeNone = true;
    }
    if (!cannotBeNone) return 'none-selected';
    if (cannotBeAll) return 'half-selected';
    return 'all-selected';
  });

  function rowKeyOf(row: T): string | number {
    return row[lineKey] as string | number;
  }

  function idInList(list: T[], id: string | number) {
    return list.some((s) => sameId(s[lineKey], id));
  }

  function isRowSelected(row: T): boolean {
    const id = rowKeyOf(row);
    if (idInList(selectRows.value, id)) return true;
    if (idInList(cacheSelected.value, id)) return true;
    if (unwrapIds(options.checkedIds).some((cid) => sameId(cid, id))) return true;
    return false;
  }

  function isRowTransparent(row: T): boolean {
    const id = rowKeyOf(row);
    const inChecked = unwrapIds(options.checkedIds).some((cid) => sameId(cid, id));
    const inSelect = idInList(selectRows.value, id);
    return inChecked && !inSelect;
  }

  function emitChange() {
    const enableSelector = unwrapBool(options.enableSelector, false);
    const isMultiple = unwrapBool(options.isMultiple, true);
    const enableCache = unwrapBool(options.enableCache, false);
    if (!enableSelector && !options.onChange) return;

    const origin =
      enableSelector && isMultiple && enableCache ? cacheSelected.value : selectRows.value;
    const result = isMultiple ? [...origin] : origin[0];
    options.onChange?.(result as T | T[] | undefined);
  }

  function addSelection(row: T) {
    if (idInList(selectRows.value, rowKeyOf(row))) return;
    selectRows.value = [...selectRows.value, row];
  }

  function removeSelection(row: T) {
    selectRows.value = selectRows.value.filter((s) => !sameId(s[lineKey], row[lineKey]));
  }

  function addCache(row: T) {
    if (!unwrapBool(options.enableCache, false)) return;
    if (idInList(cacheSelected.value, rowKeyOf(row))) return;
    cacheSelected.value = [...cacheSelected.value, { ...row }];
  }

  function removeCache(row: T) {
    if (!unwrapBool(options.enableCache, false)) return;
    cacheSelected.value = cacheSelected.value.filter((s) => !sameId(s[lineKey], row[lineKey]));
  }

  function chooseRow(row: T) {
    const isMultiple = unwrapBool(options.isMultiple, true);
    if (!isMultiple) {
      selectRows.value = [row];
      emitChange();
      return;
    }
    if (unwrapIds(options.disabledIds).some((cid) => sameId(cid, rowKeyOf(row)))) return;

    // 跨页：以 cache / 当前页选中任一为准，避免「仅在 cache 中」时误当成未选再添加
    const exists =
      idInList(selectRows.value, rowKeyOf(row)) ||
      (unwrapBool(options.enableCache, false) && idInList(cacheSelected.value, rowKeyOf(row)));

    if (exists) {
      removeSelection(row);
      removeCache(row);
    } else {
      addSelection(row);
      addCache(row);
    }
    emitChange();
  }

  function toggleBatchSelect() {
    const list = options.tableData.value;
    if (statusOfSelect.value === 'all-selected') {
      for (const each of list) {
        removeCache(each);
        removeSelection(each);
      }
      emitChange();
      return;
    }
    for (const each of list) {
      addCache(each);
      addSelection(each);
    }
    emitChange();
  }

  /**
   * 回显已选
   * @param silent 为 true 时不触发 onChange（翻页恢复勾选，避免冲掉父级 selectorModel）
   */
  function setChecked(ids: Array<string | number>, originList: T[] = [], silent = false) {
    if (!ids.length) {
      selectRows.value = [];
      if (unwrapBool(options.enableCache, false)) cacheSelected.value = [];
      if (!silent) emitChange();
      return;
    }
    const currentList = options.tableData.value;
    const checkedRows: T[] = [];
    for (const eachId of ids) {
      const fromPage = currentList.find((e) => sameId(e[lineKey], eachId));
      if (fromPage) {
        checkedRows.push(fromPage);
        continue;
      }
      const fromOrigin = originList.find((e) => sameId(e[lineKey], eachId));
      checkedRows.push(fromOrigin || ({ [lineKey]: eachId } as T));
    }
    if (unwrapBool(options.enableCache, false)) {
      cacheSelected.value = checkedRows.map((row) => ({ ...row }));
      selectRows.value = currentList.filter((row) => ids.some((id) => sameId(id, row[lineKey])));
    } else {
      selectRows.value = checkedRows;
    }
    if (!silent) emitChange();
  }

  function clearSelection() {
    selectRows.value = [];
    cacheSelected.value = [];
    emitChange();
  }

  function syncPageFromCache() {
    if (!unwrapBool(options.enableCache, false)) return;
    const page = options.tableData.value;
    const next = page.filter((row) => idInList(cacheSelected.value, rowKeyOf(row)));
    selectRows.value = next;
  }

  return {
    selectRows,
    cacheSelected,
    statusOfSelect,
    isRowSelected,
    isRowTransparent,
    chooseRow,
    toggleBatchSelect,
    setChecked,
    clearSelection,
    syncPageFromCache,
    emitChange,
  };
}
