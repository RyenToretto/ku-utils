import {
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  reactive,
  ref,
  type Ref,
} from 'vue';

/** 默认 / 上限分页（本仓约定，与列表 Mock 常用档对齐） */
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 500;

/** Element Plus 表格排序 order */
export type ElementSortOrder = 'ascending' | 'descending' | null;

/** API 排序方向 */
export type ApiSortOrder = 'asc' | 'desc';

export type TableQuerySortState = {
  prop: string;
  order: ElementSortOrder;
};

export type TableQueryPageResult<TRow> = {
  lists?: TRow[];
  total?: number;
  pageNum?: number;
  pageSize?: number;
};

export type TableQueryFetcherResult<TRow> =
  { data: TableQueryPageResult<TRow> } | TableQueryPageResult<TRow>;

/**
 * 本次请求是不是静默刷新。
 * 静默给轮询用：须把 `silent` 传到 request 层，避免失败时按间隔弹 Toast。
 */
export type TableQueryFetchContext = {
  silent: boolean;
};

export type UseTableQueryOptions<
  TRow extends Record<string, unknown>,
  TFilter extends Record<string, unknown>,
> = {
  /** 业务筛选项初始值（不含分页；分页字段由 hook 注入） */
  defaultFilters: TFilter;
  /**
   * 列表请求。第二参 AbortSignal：新查询会 abort 上一笔。
   * 第三参 `ctx.silent` 为静默刷新标记。
   */
  fetcher: (
    query: Record<string, unknown>,
    signal: AbortSignal,
    ctx: TableQueryFetchContext,
  ) => Promise<TableQueryFetcherResult<TRow>>;
  enablePagination?: boolean;
  defaultPageSize?: number;
  maxPageSize?: number;
  enableSort?: boolean;
  defaultSort?: TableQuerySortState;
  immediate?: boolean;
  /** KeepAlive 回访静默重拉；选择器模式勿开 */
  refreshOnActivated?: boolean;
  debounceMs?: number;
  transformQuery?: (query: Record<string, unknown>) => Record<string, unknown>;
  onBeforeSearch?: (ctx: { resetPage: boolean; silent: boolean }) => void;
  onLoaded?: (ctx: {
    resetPage: boolean;
    silent: boolean;
    tableData: TRow[];
    tableTotal: number;
  }) => void;
  onError?: (ctx: { resetPage: boolean; silent: boolean; error: unknown }) => void;
};

export const defaultSortOrders: Array<ElementSortOrder> = ['descending', 'ascending', null];

export function mapElementOrderToApi(order: ElementSortOrder): ApiSortOrder | undefined {
  if (order === 'ascending') return 'asc';
  if (order === 'descending') return 'desc';
  return undefined;
}

function clampPageSize(size: number, max: number) {
  return Math.min(Math.max(1, size), max);
}

function unwrapPageResult<TRow>(result: TableQueryFetcherResult<TRow>): TableQueryPageResult<TRow> {
  if (result && typeof result === 'object' && 'data' in result && result.data) {
    return result.data;
  }
  return result as TableQueryPageResult<TRow>;
}

function isAbortError(error: unknown, signal: AbortSignal) {
  if (signal.aborted) return true;
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: string }).code;
  return code === 'ERR_CANCELED' || code === 'ECONNABORTED';
}

/**
 * 列表页通用查询（分页 / 不分页均可）。
 * - 状态：`listFilters` / `tableData` / `tableTotal` / `tableLoading` / `tableLoadFailed`
 * - 翻页竞态：AbortController；失败置 `tableLoadFailed` 并再抛出
 */
export function useTableQuery<
  TRow extends Record<string, unknown>,
  TFilter extends Record<string, unknown>,
>(options: UseTableQueryOptions<TRow, TFilter>) {
  const enablePagination = options.enablePagination !== false;
  const enableSort = !!options.enableSort;
  const maxPageSize = options.maxPageSize ?? MAX_PAGE_SIZE;
  const defaultPageSize = clampPageSize(options.defaultPageSize ?? DEFAULT_PAGE_SIZE, maxPageSize);
  const immediate = options.immediate !== false;
  const debounceMs = options.debounceMs ?? 0;

  const defaultSort: TableQuerySortState = {
    prop: options.defaultSort?.prop || '',
    order: options.defaultSort?.order ?? null,
  };

  const sortState = reactive<TableQuerySortState>({
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
  const tableLoadFailed = ref(false);

  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let inFlight: { controller: AbortController; silent: boolean } | null = null;

  function buildQuery(): Record<string, unknown> {
    const query: Record<string, unknown> = { ...listFilters };

    if (!enablePagination) {
      delete query.pageNum;
      delete query.pageSize;
    } else if (typeof query.pageSize === 'number') {
      const clamped = clampPageSize(query.pageSize, maxPageSize);
      query.pageSize = clamped;
      listFilters.pageSize = clamped;
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

  async function fetchList(resetPage = false, silent = false) {
    if (silent && inFlight && !inFlight.silent) return;

    options.onBeforeSearch?.({ resetPage, silent });

    if (enablePagination && resetPage) {
      listFilters.pageNum = 1;
    }

    inFlight?.controller.abort();
    const controller = new AbortController();
    const signal = controller.signal;
    inFlight = { controller, silent };

    if (!silent) {
      tableLoading.value = true;
      tableLoadFailed.value = false;
    }
    try {
      const result = unwrapPageResult(await options.fetcher(buildQuery(), signal, { silent }));
      if (signal.aborted) return;
      tableData.value = result.lists || [];
      tableTotal.value = result.total ?? 0;
      tableLoadFailed.value = false;
      options.onLoaded?.({
        resetPage,
        silent,
        tableData: tableData.value,
        tableTotal: tableTotal.value,
      });
    } catch (error) {
      if (isAbortError(error, signal)) return;
      if (!silent) {
        tableData.value = [];
        tableTotal.value = 0;
        tableLoadFailed.value = true;
      }
      options.onError?.({ resetPage, silent, error });
      throw error;
    } finally {
      if (inFlight?.controller === controller) inFlight = null;
      if (!signal.aborted && !silent) {
        tableLoading.value = false;
      }
    }
  }

  function search(resetPage = false) {
    if (debounceMs <= 0) {
      return fetchList(resetPage);
    }
    if (debounceTimer) clearTimeout(debounceTimer);
    return new Promise<void>((resolve, reject) => {
      debounceTimer = setTimeout(() => {
        debounceTimer = null;
        void fetchList(resetPage).then(resolve, reject);
      }, debounceMs);
    });
  }

  function refresh(opts?: { silent?: boolean }) {
    return fetchList(false, opts?.silent === true);
  }

  function handlePageChange(pageNum: number) {
    if (!enablePagination) return Promise.resolve();
    listFilters.pageNum = pageNum;
    return fetchList(false);
  }

  function handleSizeChange(pageSize: number) {
    if (!enablePagination) return Promise.resolve();
    listFilters.pageSize = clampPageSize(pageSize, maxPageSize);
    listFilters.pageNum = 1;
    return fetchList(false);
  }

  function handleSortChange(payload: {
    prop?: string | null;
    order?: ElementSortOrder | null;
    column?: { sortable?: boolean | string };
  }) {
    if (!enableSort) return Promise.resolve();
    if (payload.column && payload.column.sortable !== 'custom') return Promise.resolve();
    sortState.prop = payload.prop || '';
    sortState.order = payload.order ?? null;
    return search(true);
  }

  function reset(patch?: Partial<TFilter>, opts?: { search?: boolean }) {
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
      listFilters.pageSize = defaultPageSize;
    }
    if (enableSort) {
      sortState.prop = defaultSort.prop;
      sortState.order = defaultSort.order;
    }
    if (opts?.search === false) {
      inFlight?.controller.abort();
      inFlight = null;
      tableData.value = [];
      tableTotal.value = 0;
      tableLoading.value = false;
      tableLoadFailed.value = false;
      return Promise.resolve();
    }
    return search(true);
  }

  onMounted(() => {
    if (immediate) void fetchList(true).catch(() => undefined);
  });

  let wasDeactivated = false;
  onDeactivated(() => {
    wasDeactivated = true;
  });
  onActivated(() => {
    if (!options.refreshOnActivated || !wasDeactivated) return;
    void refresh({ silent: true }).catch(() => undefined);
  });

  onBeforeUnmount(() => {
    if (debounceTimer) clearTimeout(debounceTimer);
    inFlight?.controller.abort();
    inFlight = null;
  });

  return {
    listFilters,
    tableData,
    tableTotal,
    tableLoading,
    tableLoadFailed,
    defaultSort,
    sortState,
    defaultSortOrders,
    search,
    refresh,
    reset,
    handlePageChange,
    handleSizeChange,
    handleSortChange,
  };
}
