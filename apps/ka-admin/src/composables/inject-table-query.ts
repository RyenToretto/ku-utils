import { afterNextRender, computed, DestroyRef, inject, signal } from '@angular/core';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 500;

export type TableQueryFetchContext = { silent: boolean };

type ListPayload<TRow> = { lists?: TRow[]; total?: number };

export type InjectTableQueryOptions<
  TRow extends Record<string, unknown>,
  TFilter extends Record<string, unknown>,
> = {
  defaultFilters: TFilter;
  fetcher: (
    query: Record<string, unknown>,
    signal: AbortSignal,
    ctx: TableQueryFetchContext,
  ) => Promise<{ data?: ListPayload<TRow> } | ListPayload<TRow>>;
  enablePagination?: boolean;
  defaultPageSize?: number;
  immediate?: boolean;
  transformQuery?: (query: Record<string, unknown>) => Record<string, unknown>;
  onLoaded?: () => void;
  onError?: () => void;
};

/**
 * 列表查询状态（对齐 kv3 `useTableQuery` / kr `useTableQuery`）：
 * 筛选 / 分页 / loading / 失败态 / AbortSignal 竞态丢弃。须在注入上下文调用。
 */
export function injectTableQuery<
  TRow extends Record<string, unknown>,
  TFilter extends Record<string, unknown>,
>(options: InjectTableQueryOptions<TRow, TFilter>) {
  const {
    defaultFilters,
    fetcher,
    enablePagination = true,
    defaultPageSize = DEFAULT_PAGE_SIZE,
    immediate = true,
    transformQuery,
    onLoaded,
    onError,
  } = options;

  const filters = signal<TFilter>({ ...defaultFilters });
  const tableData = signal<TRow[]>([]);
  const tableTotal = signal(0);
  const tableLoading = signal(false);
  const tableLoadFailed = signal(false);
  const pageNum = signal(1);
  const pageSize = signal(defaultPageSize);
  let abortController: AbortController | null = null;

  async function search(resetPage = true, silent = false) {
    abortController?.abort();
    const ac = new AbortController();
    abortController = ac;
    if (resetPage) pageNum.set(1);
    if (!silent) {
      tableLoading.set(true);
      tableLoadFailed.set(false);
    }
    try {
      let query: Record<string, unknown> = { ...filters() };
      if (enablePagination) {
        query['pageNum'] = pageNum();
        query['pageSize'] = pageSize();
      }
      if (transformQuery) query = transformQuery(query);
      const res = await fetcher(query, ac.signal, { silent });
      // fetcher 未透传 signal 时旧请求仍会返回，丢弃以免覆盖新结果
      if (ac.signal.aborted) return;
      const data = (res as { data?: ListPayload<TRow> }).data ?? (res as ListPayload<TRow>);
      tableData.set(Array.isArray(data?.lists) ? data.lists : []);
      tableTotal.set(Number(data?.total) || 0);
      tableLoadFailed.set(false);
      onLoaded?.();
    } catch (err) {
      if (ac.signal.aborted || (err as { name?: string })?.name === 'AbortError') return;
      if (!silent) {
        tableData.set([]);
        tableTotal.set(0);
        tableLoadFailed.set(true);
        onError?.();
      }
    } finally {
      if (abortController === ac) tableLoading.set(false);
    }
  }

  function setListFilters(patch: Partial<TFilter>) {
    filters.update((prev) => ({ ...prev, ...patch }));
  }

  function reset(nextFilters?: TFilter) {
    filters.set({ ...(nextFilters ?? defaultFilters) });
    return search(true);
  }

  /** 行内操作（开关等）成功后只改本行，不重拉列表，避免翻页/滚动位置丢失 */
  function patchRow(match: (row: TRow) => boolean, patch: Partial<TRow>) {
    tableData.update((prev) => prev.map((row) => (match(row) ? { ...row, ...patch } : row)));
  }

  function handlePageChange(page: number) {
    pageNum.set(page);
    return search(false);
  }

  function handleSizeChange(size: number) {
    pageSize.set(size);
    pageNum.set(1);
    return search(false);
  }

  inject(DestroyRef).onDestroy(() => abortController?.abort());
  // 首屏查询放到首帧渲染后（对齐 React useEffect 挂载时机，且组件字段已全部初始化）
  if (immediate) afterNextRender(() => void search(true));

  const listFilters = computed(
    () =>
      ({ ...filters(), pageNum: pageNum(), pageSize: pageSize() }) as TFilter & {
        pageNum: number;
        pageSize: number;
      },
  );

  return {
    filters: filters.asReadonly(),
    setListFilters,
    listFilters,
    tableData: tableData.asReadonly(),
    tableTotal: tableTotal.asReadonly(),
    tableLoading: tableLoading.asReadonly(),
    tableLoadFailed: tableLoadFailed.asReadonly(),
    pageNum: pageNum.asReadonly(),
    pageSize: pageSize.asReadonly(),
    search,
    reset,
    patchRow,
    handlePageChange,
    handleSizeChange,
    onPageChange(page: number, size: number) {
      if (size !== pageSize()) return handleSizeChange(size);
      return handlePageChange(page);
    },
  };
}

export type TableQuery<
  TRow extends Record<string, unknown>,
  TFilter extends Record<string, unknown>,
> = ReturnType<typeof injectTableQuery<TRow, TFilter>>;
