import type { ColumnsType, ColumnType } from 'antd/es/table';
import { useLayoutEffect, useMemo, useState } from 'react';

/** el-table 未给 width/min-width 的列按 80 计 */
const DEFAULT_MIN_WIDTH = 80;

function leafColumns<T>(columns: ColumnsType<T>): ColumnType<T>[] {
  return columns.flatMap((col) =>
    'children' in col && col.children?.length ? leafColumns(col.children) : [col as ColumnType<T>],
  );
}

function minWidthOf<T>(col: ColumnType<T>): number {
  return typeof col.minWidth === 'number' ? col.minWidth : DEFAULT_MIN_WIDTH;
}

/**
 * 与 el-table `fit` 同算法分配列宽：给了 width 的列不动；
 * 余宽按 minWidth 比例摊给未给 width 的列（向下取整，余数归第一列），不足则各取 minWidth 横向滚动。
 * antd 默认把余宽平均摊给弹性列，多弹性列时与 kv3 列宽不一致。
 */
export function useFlexColumns<T>(columns: ColumnsType<T>, pageSelector: string): ColumnsType<T> {
  const [bodyWidth, setBodyWidth] = useState(0);

  useLayoutEffect(() => {
    const contain = document.querySelector(pageSelector);
    if (!contain) return;
    const measure = () => {
      const body = contain.querySelector('.ant-table-body, .ant-table-content');
      setBodyWidth(body?.clientWidth ?? 0);
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(contain);
    return () => resizeObserver.disconnect();
  }, [pageSelector]);

  return useMemo(() => {
    if (!bodyWidth) return columns;
    const leaves = leafColumns(columns);
    const flexLeaves = leaves.filter((col) => typeof col.width !== 'number');
    if (!flexLeaves.length) return columns;

    const fixedWidth = leaves.reduce(
      (sum, col) => sum + (typeof col.width === 'number' ? col.width : 0),
      0,
    );
    const flexMinWidth = flexLeaves.reduce((sum, col) => sum + minWidthOf(col), 0);
    const restWidth = bodyWidth - fixedWidth - flexMinWidth;
    const widths = new Map<ColumnType<T>, number>();

    if (restWidth <= 0) {
      flexLeaves.forEach((col) => widths.set(col, minWidthOf(col)));
    } else {
      const perPixel = restWidth / flexMinWidth;
      let othersExtra = 0;
      flexLeaves.slice(1).forEach((col) => {
        const extra = Math.floor(minWidthOf(col) * perPixel);
        othersExtra += extra;
        widths.set(col, minWidthOf(col) + extra);
      });
      widths.set(flexLeaves[0], minWidthOf(flexLeaves[0]) + restWidth - othersExtra);
    }

    const apply = (cols: ColumnsType<T>): ColumnsType<T> =>
      cols.map((col) => {
        if ('children' in col && col.children?.length) {
          return { ...col, children: apply(col.children) };
        }
        const width = widths.get(col as ColumnType<T>);
        return width === undefined ? col : { ...col, width };
      });
    return apply(columns);
  }, [bodyWidth, columns]);
}
