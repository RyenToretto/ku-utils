import { useMaxHeight, type UseMaxHeightOptions } from '@ku-utils/hooks';
import { computed, onBeforeUnmount, onMounted, ref, type ComputedRef } from 'vue';

/**
 * Admin 内容滚动容器：
 * - 业务域：`DomainModuleShell` 的 `.domain-module-main`
 * - Demo：`_example/index.vue` 的 `.main-container-inner`
 */
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

/**
 * 沿祖先链累加表格之后的垂直兄弟高度 + 页根 padding-bottom（与 @ku-utils/hooks useMaxHeight 口径一致）。
 */
export function getAfterSiblingsHeight(targetEle: Element, containEle: Element): number {
  let height = 0;
  let node: Element = targetEle;

  while (node.parentElement && node !== containEle) {
    const parent = node.parentElement;
    const parentStyle = window.getComputedStyle(parent);
    // flex-direction 初始值恒为 row，非 flex 容器也会算成 row，必须先确认 display
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

/** 滚动容器 padding-bottom：计入 scrollHeight，不扣则表格贴满后仍会挤出外层滚动条 */
export function getScrollerPaddingBottom(scroller: Element): number {
  return getPxValue(window.getComputedStyle(scroller).paddingBottom);
}

/** 基于域内容滚动容器实测表格可用 max-height */
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

/**
 * Admin 列表页表格 max-height：
 * - contain 用页面根 `.page-*`（勿用默认 `.main-body`，本仓不存在）
 * - 以 `.domain-module-main`（Demo 为 `.main-container-inner`）二次测量为主真源
 * - 必须扣除滚动容器 padding-bottom（壳层底留白）
 */
export function useAdminTableMaxHeight(
  pageSelector: string,
  defaultHeight = 200,
  options?: Pick<UseMaxHeightOptions, 'footerSelector' | 'minHeight'>,
): ComputedRef<number> {
  const minHeight = options?.minHeight ?? Math.min(defaultHeight, 200);
  const baseMaxHeight = useMaxHeight(pageSelector, '.table-wrap .el-table', defaultHeight, {
    ...options,
    minHeight,
  });

  const layoutRevision = ref(0);
  let mutationObserver: MutationObserver | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let timers: ReturnType<typeof setTimeout>[] = [];

  const bumpLayoutRevision = () => {
    layoutRevision.value += 1;
  };

  const setupObservers = () => {
    if (typeof document === 'undefined') return;

    const contain = document.querySelector(pageSelector);
    const scroller = resolveLayoutScroller();

    mutationObserver?.disconnect();
    if (contain) {
      mutationObserver = new MutationObserver(bumpLayoutRevision);
      mutationObserver.observe(contain, { subtree: true, childList: true });
    }

    resizeObserver?.disconnect();
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(bumpLayoutRevision);
      if (scroller) resizeObserver.observe(scroller);
      if (contain) resizeObserver.observe(contain);
    }
  };

  onMounted(() => {
    setupObservers();
    bumpLayoutRevision();
    timers = [120, 400].map((ms) => setTimeout(bumpLayoutRevision, ms));
    window.addEventListener('resize', bumpLayoutRevision);
  });

  onBeforeUnmount(() => {
    timers.forEach((timer) => clearTimeout(timer));
    timers = [];
    window.removeEventListener('resize', bumpLayoutRevision);
    mutationObserver?.disconnect();
    mutationObserver = null;
    resizeObserver?.disconnect();
    resizeObserver = null;
  });

  return computed(() => {
    void layoutRevision.value;

    const baseVal = baseMaxHeight.value;
    if (typeof document === 'undefined') {
      return Math.max(baseVal, minHeight);
    }

    const scroller = resolveLayoutScroller();
    const contain = document.querySelector(pageSelector);
    const table = contain?.querySelector('.table-wrap .el-table') ?? null;

    if (!scroller || !table || !contain) {
      return Math.max(baseVal, minHeight);
    }

    const scrollerPaddingBottom = getScrollerPaddingBottom(scroller);
    const measured = measureAdminTableMaxHeight(scroller, contain, table);
    if (measured <= 0) {
      // hooks 基线未扣滚动容器底 padding，回落时补扣，避免偶发外层滚动条
      return Math.max(baseVal - scrollerPaddingBottom, minHeight);
    }

    // 向下取整并预留 1px：抵消亚像素与 table-wrap 边框，避免外层出现 1px 级滚动条
    return Math.max(Math.floor(measured) - 1, minHeight);
  });
}
