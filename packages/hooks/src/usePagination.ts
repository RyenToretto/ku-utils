import { computed, reactive, ref, watch } from 'vue';

interface PaginationOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  pageSizes?: number[];
}

export function usePagination(
  fetchFn: (params: {
    page: number;
    pageSize: number;
  }) => Promise<{ total: number; list: unknown[] }>,
  options: PaginationOptions = {},
) {
  const { defaultPage = 1, defaultPageSize = 10, pageSizes = [10, 20, 50, 100] } = options;

  const page = ref(defaultPage);
  const pageSize = ref(defaultPageSize);
  const total = ref(0);
  const list = ref<unknown[]>([]);
  const loading = ref(false);

  const totalPages = computed(() => Math.ceil(total.value / pageSize.value));

  async function fetch() {
    loading.value = true;
    try {
      const result = await fetchFn({ page: page.value, pageSize: pageSize.value });
      total.value = result.total;
      list.value = result.list;
    } finally {
      loading.value = false;
    }
  }

  function changePage(p: number) {
    page.value = p;
  }

  function changePageSize(size: number) {
    pageSize.value = size;
    page.value = 1;
  }

  function reset() {
    page.value = defaultPage;
    pageSize.value = defaultPageSize;
  }

  watch([page, pageSize], () => fetch(), { immediate: true });

  return reactive({
    page,
    pageSize,
    total,
    totalPages,
    list,
    loading,
    pageSizes,
    fetch,
    changePage,
    changePageSize,
    reset,
  });
}
