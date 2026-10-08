import { useMaxHeight, type UseMaxHeightOptions } from '@ku-utils/hooks-react';
import { useEffect, useMemo, useState } from 'react';

const LAYOUT_SCROLLER_CANDIDATES = ['.domain-module-main', '.main-container-inner'] as const;

function getPxValue(str: string | null): number {
  if (!str) return 0;
  const n = Number.parseFloat(str.replace(/px/g, ''));
  return Number.isNaN(n) ? 0 : n;
}

function resolveLayoutScroller(): Element | null {
  if (typeof document === 'undefined') return null;
  for (const selector of LAYOUT_SCROLLER_CANDIDATES) {
    const el = document.querySelector(selector);
    if (el) return el;
  }
  return null;
}

export function getAfterSiblingsHeight(targetEle: Element, containEle: Element): number {
  let height = 0;
  let node: Element = targetEle;

  while (node.parentElement && node !== containEle) {
    const parent = node.parentElement;
    const parentStyle = window.getComputedStyle(parent);
    const isFlexContainer = parentStyle.display === 'flex' || parentStyle.display === 'inline-flex';
    const isHorizontal =
      isFlexContainer &&
      (parentStyle.flexDirection === 'row' || parentStyle.flexDirection === 'row-reverse');

    if (!isHorizontal) {
      let afterNode = false;
      for (const sibling of Array.from(parent.children)) {
        if (sibling === node) {
          afterNode = true;
          continue;
        }
        if (!afterNode) continue;
        const siblingRect = sibling.getBoundingClientRect();
        if (siblingRect.height > 0) {
          const cssInfo = window.getComputedStyle(sibling);
          height +=
            siblingRect.height + getPxValue(cssInfo.marginTop) + getPxValue(cssInfo.marginBottom);
        }
      }
    }

    node = parent;
    if (node === containEle) break;
  }

  const containStyle = window.getComputedStyle(containEle);
  height += getPxValue(containStyle.paddingBottom);

  return height;
}

export function getScrollerPaddingBottom(scroller: Element): number {
  return getPxValue(window.getComputedStyle(scroller).paddingBottom);
}

export function measureAdminTableMaxHeight(
  scroller: Element,
  contain: Element,
  table: Element,
): number {
  const spRect = scroller.getBoundingClientRect();
  const tableRect = table.getBoundingClientRect();
  const scrollTop = 'scrollTop' in scroller ? (scroller as HTMLElement).scrollTop : 0;
  const tableTopInContainer = tableRect.top - spRect.top + scrollTop;
  const afterHeight = getAfterSiblingsHeight(table, contain);
  const scrollerPaddingBottom = getScrollerPaddingBottom(scroller);
  const clientHeight = 'clientHeight' in scroller ? (scroller as HTMLElement).clientHeight : 0;
  return clientHeight - tableTopInContainer - afterHeight - scrollerPaddingBottom;
}

/** antd `scroll.y` 只约束表体，表头与边框等非表体高度需从整表可用高度中扣除 */
function getTableChromeHeight(table: Element): number {
  const body = table.querySelector('.ant-table-body');
  if (body) return table.getBoundingClientRect().height - body.getBoundingClientRect().height;
  const thead = table.querySelector('.ant-table-thead');
  return thead ? thead.getBoundingClientRect().height : 0;
}

/**
 * Admin 列表页表格 `scroll.y`（Ant Design 表体 max-height，已扣表头）
 */
export function useAdminTableMaxHeight(
  pageSelector: string,
  defaultHeight = 200,
  options?: Pick<UseMaxHeightOptions, 'footerSelector' | 'minHeight'>,
): number {
  const minHeight = options?.minHeight ?? Math.min(defaultHeight, 200);
  const { maxHeight: baseMaxHeight } = useMaxHeight({
    containSelector: pageSelector,
    targetSelector: '.table-wrap .ant-table',
    defaultHeight,
    minHeight,
    footerSelector: options?.footerSelector,
  });

  const [layoutRevision, setLayoutRevision] = useState(0);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const bump = () => setLayoutRevision((n) => n + 1);
    const contain = document.querySelector(pageSelector);
    const scroller = resolveLayoutScroller();

    const mutationObserver = contain ? new MutationObserver(bump) : null;
    mutationObserver?.observe(contain!, { subtree: true, childList: true });

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(bump) : null;
    if (scroller) resizeObserver?.observe(scroller);
    if (contain) resizeObserver?.observe(contain);

    const timers = [120, 400].map((ms) => setTimeout(bump, ms));
    window.addEventListener('resize', bump);
    bump();

    return () => {
      timers.forEach((t) => clearTimeout(t));
      window.removeEventListener('resize', bump);
      mutationObserver?.disconnect();
      resizeObserver?.disconnect();
    };
  }, [pageSelector]);

  return useMemo(() => {
    void layoutRevision;
    if (typeof document === 'undefined') {
      return Math.max(baseMaxHeight, minHeight);
    }

    const scroller = resolveLayoutScroller();
    const contain = document.querySelector(pageSelector);
    const table = contain?.querySelector('.table-wrap .ant-table') ?? null;

    if (!scroller || !table || !contain) {
      return Math.max(baseMaxHeight, minHeight);
    }

    const scrollerPaddingBottom = getScrollerPaddingBottom(scroller);
    const chromeHeight = getTableChromeHeight(table);
    const measured = measureAdminTableMaxHeight(scroller, contain, table) - chromeHeight;
    if (measured <= 0) {
      return Math.max(baseMaxHeight - scrollerPaddingBottom - chromeHeight, minHeight);
    }

    return Math.max(Math.floor(measured) - 1, minHeight);
  }, [baseMaxHeight, layoutRevision, minHeight, pageSelector]);
}
