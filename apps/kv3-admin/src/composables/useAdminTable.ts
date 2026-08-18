import { onMounted, reactive, ref, type Ref } from 'vue';

/** Element Plus 表格排序 order */
export type ElementSortOrder = 'ascending' | 'descending' | null;

/** 巨效 API 排序方向（apis.md） */
export type ApiSortOrder = 'asc' | 'desc';

export type AdminTableSortState = {
  prop: string;
  order: ElementSortOrder;
};

export type AdminTablePageResult<TRow> = {
  lists?: TRow[];
  total?: number;
  pageNum?: number;
  pageSize?: number;
};

export type AdminTableFetcherResult<TRow> =
  { data: AdminTablePageResult<TRow> } | AdminTablePageResult<TRow>;

export type UseAdminTableOptions<
  TRow extends Record<string, unknown>,
  TFilter extends Record<string, unknown>,
> = {
  /** 业务筛选项初始值（不含分页；分页字段由 hook 注入） */
  defaultFilters: TFilter;
  /** 列表请求；入参为业务筛选 + 可选分页/排序 */
  fetcher: (query: Record<string, unknown>) => Promise<AdminTableFetcherResult<TRow>>;
  /** 是否启用分页参数与页码逻辑，默认 true */
  enablePagination?: boolean;
  /** 默认每页条数，对齐 apis.md 为 20 */
  defaultPageSize?: number;
  /** 是否启用排序参数，默认 false */
  enableSort?: boolean;
  /** 默认排序（Element order） */
  defaultSort?: AdminTableSortState;
  /** 挂载后立即 search(true)，默认 true */
  immediate?: boolean;
  /** search 防抖毫秒，0 表示不防抖 */
  debounceMs?: number;
  /** 发出请求前改写 query（如锁定 status） */
  transformQuery?: (query: Record<string, unknown>) => Record<string, unknown>;
  onBeforeSearch?: (ctx: { resetPage: boolean }) => void;
  onAfterSearch?: (ctx: { resetPage: boolean; tableData: TRow[]; tableTotal: number }) => void;
};

export const defaultSortOrders: Array<ElementSortOrder> = ['descending', 'ascending', null];

/** Element order → API sortOrder；清空排序返回 undefined */
export function mapElementOrderToApi(order: ElementSortOrder): ApiSortOrder | undefined {
  if (order === 'ascending') return 'asc';
  if (order === 'descending') return 'desc';
  return undefined;
}

function unwrapPageResult<TRow>(result: AdminTableFetcherResult<TRow>): AdminTablePageResult<TRow> {
  if (result && typeof result === 'object' && 'data' in result && result.data) {
    return result.data;
  }
  return result as AdminTablePageResult<TRow>;
}

/**
 * 管理端表格列表查询（分页 / 不分页均可）。
 * 分页/排序字段对齐巨效 apis.md：pageNum / pageSize / sortField / sortOrder。
 */
export function useAdminTable<
  TRow extends Record<string, unknown>,
  TFilter extends Record<string, unknown>,
>(options: UseAdminTableOptions<TRow, TFilter>) {
  const enablePagination = options.enablePagination !== false;
  const enableSort = !!options.enableSort;
  const defaultPageSize = options.defaultPageSize ?? 20;
  const immediate = options.immediate !== false;
  const debounceMs = options.debounceMs ?? 0;

  const defaultSort: AdminTableSortState = {
    prop: options.defaultSort?.prop || '',
    order: options.defaultSort?.order ?? null,
  };

  const sortState = reactive<AdminTableSortState>({
    prop: defaultSort.prop,
    order: defaultSort.order,
  });

  const listFilters = reactive({
    ...structuredClone(options.defaultFilters),
    ...(enablePagination
      ? {
          pageNum: 1,
          pageSize: defaultPageSize,
        }
      : {}),
  }) as TFilter & { pageNum?: number; pageSize?: number };

  const tableData = ref<TRow[]>([]) as Ref<TRow[]>;
  const tableTotal = ref(0);
  const tableLoading = ref(false);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let searchSeq = 0;

  function buildQuery(): Record<string, unknown> {
    const query: Record<string, unknown> = { ...listFilters };

    if (!enablePagination) {
      delete query.pageNum;
      delete query.pageSize;
    }

    if (enableSort) {
      const apiOrder = mapElementOrderToApi(sortState.order);
      if (sortState.prop && apiOrder) {
        query.sortField = sortState.prop;
        query.sortOrder = apiOrder;
      } else {
        delete query.sortField;
        delete query.sortOrder;
      }
    }

    return options.transformQuery ? options.transformQuery(query) : query;
  }

  async function runSearch(resetPage = false) {
    options.onBeforeSearch?.({ resetPage });

    if (enablePagination && resetPage) {
      listFilters.pageNum = 1;
    }

    const seq = ++searchSeq;
    tableLoading.value = true;
    try {
      const result = unwrapPageResult(await options.fetcher(buildQuery()));
      if (seq !== searchSeq) return;
      tableData.value = result.lists || [];
      tableTotal.value = result.total ?? 0;
      options.onAfterSearch?.({
        resetPage,
        tableData: tableData.value,
        tableTotal: tableTotal.value,
      });
    } catch {
      if (seq !== searchSeq) return;
      tableData.value = [];
      tableTotal.value = 0;
    } finally {
      if (seq === searchSeq) {
        tableLoading.value = false;
      }
    }
  }

  function search(resetPage = false) {
    if (debounceMs <= 0) {
      void runSearch(resetPage);
      return;
    }
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      void runSearch(resetPage);
    }, debounceMs);
  }

  function handlePageNumChange(pageNum: number) {
    if (!enablePagination) return;
    listFilters.pageNum = pageNum;
    search(false);
  }

  function handlePageSizeChange(pageSize: number) {
    if (!enablePagination) return;
    listFilters.pageSize = pageSize;
    search(true);
  }

  function handleSortChange(payload: {
    prop?: string | null;
    order?: ElementSortOrder | null;
    column?: { sortable?: boolean | string };
  }) {
    if (!enableSort) return;
    if (payload.column && payload.column.sortable !== 'custom') return;
    sortState.prop = payload.prop || '';
    sortState.order = payload.order ?? null;
    search(true);
  }

  /** 恢复业务筛选项（及默认排序）；默认重新查询，弹层关闭时可传 `{ search: false }` 避免误请求 */
  function resetListFilters(patch?: Partial<TFilter>, opts?: { search?: boolean }) {
    const next = {
      ...structuredClone(options.defaultFilters),
      ...(patch || {}),
    } as TFilter;
    for (const key of Object.keys(options.defaultFilters)) {
      (listFilters as Record<string, unknown>)[key] = structuredClone(
        (next as Record<string, unknown>)[key],
      );
    }
    if (enablePagination) {
      listFilters.pageNum = 1;
    }
    if (enableSort) {
      sortState.prop = defaultSort.prop;
      sortState.order = defaultSort.order;
    }
    if (opts?.search === false) {
      tableData.value = [];
      tableTotal.value = 0;
      return;
    }
    search(true);
  }

  if (immediate) {
    onMounted(() => search(true));
  }

  return {
    listFilters,
    tableData,
    tableTotal,
    tableLoading,
    defaultSort,
    sortState,
    defaultSortOrders,
    search,
    handlePageNumChange,
    handlePageSizeChange,
    handleSortChange,
    resetListFilters,
  };
}
