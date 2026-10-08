import {
  afterNextRender,
  computed,
  DestroyRef,
  inject,
  isSignal,
  signal,
  type Signal,
} from '@angular/core';

/** el-table 未给 width/min-width 的列按 80 计 */
const DEFAULT_MIN_WIDTH = 80;

export type FlexColumn = {
  key: string;
  width?: number;
  minWidth?: number;
};

function minWidthOf(col: FlexColumn): number {
  return typeof col.minWidth === 'number' ? col.minWidth : DEFAULT_MIN_WIDTH;
}

/**
 * 与 el-table `fit` 同算法分配列宽（对齐 kr `useFlexColumns`）：给了 width 的列不动；
 * 余宽按 minWidth 比例摊给未给 width 的列（向下取整，余数归第一列），不足则各取 minWidth 横向滚动。
 * `widths` 为 `key → 像素宽`；`widthConfig` 按列顺序给 nz-table `[nzWidthConfig]`。
 */
export function injectFlexColumns(
  columnsInput: FlexColumn[] | Signal<FlexColumn[]>,
  pageSelector: string,
) {
  const columns = isSignal(columnsInput) ? columnsInput : signal(columnsInput).asReadonly();
  const bodyWidth = signal(0);
  const destroyRef = inject(DestroyRef);

  afterNextRender(() => {
    const contain = document.querySelector(pageSelector);
    if (!contain) return;
    let body: Element | null = null;
    const resizeObserver = new ResizeObserver(() => measure());
    // 表体随 loading / 表格重建，需跟随新节点
    const measure = () => {
      const next = contain.querySelector('.ant-table-body, .ant-table-content');
      if (next !== body) {
        if (body) resizeObserver.unobserve(body);
        body = next;
        if (body) resizeObserver.observe(body);
      }
      bodyWidth.set(body?.clientWidth ?? 0);
    };
    const mutationObserver = new MutationObserver(measure);
    mutationObserver.observe(contain, { childList: true, subtree: true });
    resizeObserver.observe(contain);
    measure();
    destroyRef.onDestroy(() => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    });
  });

  const widths = computed(() => {
    const cols = columns();
    const widths: Record<string, number> = {};
    for (const col of cols) {
      if (typeof col.width === 'number') widths[col.key] = col.width;
    }
    const flex = cols.filter((col) => typeof col.width !== 'number');
    const total = bodyWidth();
    if (!flex.length) return widths;
    if (!total) {
      flex.forEach((col) => (widths[col.key] = minWidthOf(col)));
      return widths;
    }

    const fixedWidth = cols.reduce((sum, col) => sum + (col.width ?? 0), 0);
    const flexMinWidth = flex.reduce((sum, col) => sum + minWidthOf(col), 0);
    const restWidth = total - fixedWidth - flexMinWidth;

    if (restWidth <= 0) {
      flex.forEach((col) => (widths[col.key] = minWidthOf(col)));
      return widths;
    }
    const perPixel = restWidth / flexMinWidth;
    let othersExtra = 0;
    flex.slice(1).forEach((col) => {
      const extra = Math.floor(minWidthOf(col) * perPixel);
      othersExtra += extra;
      widths[col.key] = minWidthOf(col) + extra;
    });
    const first = flex[0]!;
    widths[first.key] = minWidthOf(first) + restWidth - othersExtra;
    return widths;
  });

  const widthConfig = computed(() => {
    const map = widths();
    return columns().map((col) => (map[col.key] != null ? `${map[col.key]}px` : null));
  });

  return { widths, widthConfig };
}
