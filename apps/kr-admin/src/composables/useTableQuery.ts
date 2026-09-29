import { useCallback, useEffect, useRef, useState } from 'react';

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 500;

export type TableQueryFetchContext = { silent: boolean };

export type UseTableQueryOptions<
  TRow extends Record<string, unknown>,
  TFilter extends Record<string, unknown>,
> = {
  defaultFilters: TFilter;
  fetcher: (
    query: Record<string, unknown>,
    signal: AbortSignal,
    ctx: TableQueryFetchContext,
  ) => Promise<{ data?: { lists?: TRow[]; total?: number } } | { lists?: TRow[]; total?: number }>;
  enablePagination?: boolean;
  defaultPageSize?: number;
  immediate?: boolean;
  transformQuery?: (query: Record<string, unknown>) => Record<string, unknown>;
  onLoaded?: () => void;
  onError?: () => void;
};

export function useTableQuery<
  TRow extends Record<string, unknown>,
  TFilter extends Record<string, unknown>,
>(options: UseTableQueryOptions<TRow, TFilter>) {
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

  const [filters, setFilters] = useState(() => ({ ...defaultFilters }) as TFilter);
  const [tableData, setTableData] = useState<TRow[]>([]);
  const [tableTotal, setTableTotal] = useState(0);
  const [tableLoading, setTableLoading] = useState(false);
  const [tableLoadFailed, setTableLoadFailed] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const abortRef = useRef<AbortController | null>(null);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const pageRef = useRef({ pageNum, pageSize });
  pageRef.current = { pageNum, pageSize };

  const search = useCallback(
    async (resetPage = true, silent = false) => {
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;
      const nextPage = resetPage ? 1 : pageRef.current.pageNum;
      if (resetPage) {
        setPageNum(1);
        pageRef.current = { ...pageRef.current, pageNum: 1 };
      }
      if (!silent) {
        setTableLoading(true);
        setTableLoadFailed(false);
      }
      try {
        let query: Record<string, unknown> = { ...filtersRef.current };
        if (enablePagination) {
          query.pageNum = nextPage;
          query.pageSize = pageRef.current.pageSize;
        }
        if (transformQuery) query = transformQuery(query);
        const res = await fetcher(query, ac.signal, { silent });
        const data =
          (res as { data?: { lists?: TRow[]; total?: number } }).data ??
          (res as { lists?: TRow[]; total?: number });
        setTableData(Array.isArray(data?.lists) ? data.lists : []);
        setTableTotal(Number(data?.total) || 0);
        setTableLoadFailed(false);
        onLoaded?.();
      } catch (err) {
        if (
          (err as { name?: string })?.name === 'CanceledError' ||
          (err as { code?: string })?.code === 'ERR_CANCELED'
        ) {
          return;
        }
        if (!silent) {
          setTableData([]);
          setTableTotal(0);
          setTableLoadFailed(true);
          onError?.();
        }
      } finally {
        if (!silent) setTableLoading(false);
      }
    },
    [enablePagination, fetcher, transformQuery, onLoaded, onError],
  );

  const setListFilters = useCallback((patch: Partial<TFilter>) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      filtersRef.current = next;
      return next;
    });
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      setPageNum(page);
      pageRef.current = { ...pageRef.current, pageNum: page };
      return search(false);
    },
    [search],
  );

  const handleSizeChange = useCallback(
    (size: number) => {
      setPageSize(size);
      setPageNum(1);
      pageRef.current = { pageNum: 1, pageSize: size };
      return search(false);
    },
    [search],
  );

  useEffect(() => {
    if (immediate) void search(true);
    return () => abortRef.current?.abort();
    // 仅挂载时拉首屏；search 引用变化不重跑
  }, []);

  const listFilters = {
    ...filters,
    pageNum,
    pageSize,
  } as TFilter & { pageNum: number; pageSize: number };

  return {
    filters,
    setFilters,
    setListFilters,
    listFilters,
    tableData,
    tableTotal,
    tableLoading,
    tableLoadFailed,
    pageNum,
    pageSize,
    setPageNum,
    setPageSize,
    search,
    handlePageChange,
    handleSizeChange,
    onPageChange(page: number, size: number) {
      if (size !== pageSize) return handleSizeChange(size);
      return handlePageChange(page);
    },
  };
}
