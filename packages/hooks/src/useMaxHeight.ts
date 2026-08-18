import { getViewHeight } from '@ku-utils/utils';
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import type { ComputedRef } from 'vue';

export interface UseMaxHeightOptions {
  /** 外层容器选择器，默认 '.main-body' */
  containSelector?: string;
  /** 目标表格选择器，默认 '.table-wrap .el-table' */
  targetSelector?: string;
  /** 页脚选择器（其高度从可用高度中扣除），默认 '.main-footer' */
  footerSelector?: string;
  /** 兜底高度，默认 200 */
  defaultHeight?: number;
  /** 最小高度，默认 332 */
  minHeight?: number;
}

function createDebounce(fn: () => void, delay: number) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  const debounced = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(fn, delay);
  };
  debounced.cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  return debounced;
}

function getPxValue(str: string | null): number {
  if (!str) return 0;
  const n = Number.parseFloat(str.replace(/px/g, ''));
  return Number.isNaN(n) ? 0 : n;
}

function getElementOuterHeight(dom: Element): number {
  const rect = dom.getBoundingClientRect();
  const cssInfo = window.getComputedStyle(dom);
  return rect.height + getPxValue(cssInfo.marginTop) + getPxValue(cssInfo.marginBottom);
}

function getScrollableAncestor(ele: Element, stopAt: Element): Element | null {
  let node: Element | null = ele.parentElement;
  while (node && node !== stopAt) {
    const oy = window.getComputedStyle(node).overflowY;
    if (oy === 'auto' || oy === 'scroll') return node;
    node = node.parentElement;
  }
  return null;
}

function getAfterSiblingsHeight(targetEle: Element, containEle: Element): number {
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

function resolveTargetInContain(contain: Element | null, targetSelector: string): Element | null {
  if (!targetSelector) return null;
  if (contain) {
    const scoped = contain.querySelector(targetSelector);
    if (scoped) return scoped;
  }
  return document.querySelector(targetSelector);
}

/**
 * 动态计算表格最大高度。
 *
 * 监听 resize 与容器 DOM 变化自动重算；目标元素延迟挂载（如 v-if 空态→表格）时会在 update 内重新解析。
 */
export function useMaxHeight(
  containSelector = '.main-body',
  targetSelector = '.table-wrap .el-table',
  defaultHeight = 200,
  options: Pick<UseMaxHeightOptions, 'footerSelector' | 'minHeight'> = {},
): ComputedRef<number> {
  const { footerSelector = '.main-footer', minHeight = 332 } = options;

  const observer = ref<MutationObserver | null>(null);
  const sizeObserver = ref<ResizeObserver | null>(null);
  const maxHeight = ref(defaultHeight);
  const lastHeightInfo = ref('');
  let observedRoot: Element | null = null;

  function disconnectObservers(): void {
    observer.value?.disconnect();
    observer.value = null;
    sizeObserver.value?.disconnect();
    sizeObserver.value = null;
    observedRoot = null;
  }

  function listenDom(ele: Element): void {
    if (observedRoot === ele && observer.value) return;
    disconnectObservers();
    observedRoot = ele;
    observer.value = new window.MutationObserver(debouncedUpdate);
    observer.value.observe(ele, { subtree: true, childList: true });
    if (typeof ResizeObserver !== 'undefined') {
      sizeObserver.value = new ResizeObserver(debouncedUpdate);
      sizeObserver.value.observe(ele);
    }
  }

  function ensureObserveRoot(): void {
    const contain = containSelector ? document.querySelector(containSelector) : null;
    listenDom(contain ?? document.body);
  }

  function update(): void {
    ensureObserveRoot();

    const contain = containSelector ? document.querySelector(containSelector) : null;
    const target = resolveTargetInContain(contain, targetSelector);

    if (!contain || !target) return;

    const targetRect = target.getBoundingClientRect();
    const scrollParent = getScrollableAncestor(target, document.documentElement);

    let availableHeight: number;
    let tableTopInContainer: number;

    let scrollPaddingBottom = 0;
    if (scrollParent) {
      const spRect = scrollParent.getBoundingClientRect();
      tableTopInContainer = targetRect.top - spRect.top + scrollParent.scrollTop;
      availableHeight = scrollParent.clientHeight;
      // clientHeight 含 padding；底 padding 会计入 scrollHeight，不扣会挤出外层滚动条
      scrollPaddingBottom = getPxValue(window.getComputedStyle(scrollParent).paddingBottom);
    } else {
      tableTopInContainer = targetRect.top;
      availableHeight = getViewHeight();
    }

    const footerEle = footerSelector ? document.querySelector(footerSelector) : null;
    const footerHeight = footerEle ? getElementOuterHeight(footerEle) : 0;
    const afterHeight = getAfterSiblingsHeight(target, contain);

    const newHeightInfo = `1_${Math.round(tableTopInContainer)}_${availableHeight}_${Math.round(footerHeight)}_${Math.round(afterHeight)}_${Math.round(scrollPaddingBottom)}`;
    if (newHeightInfo === lastHeightInfo.value) return;
    lastHeightInfo.value = newHeightInfo;

    maxHeight.value = Math.floor(
      availableHeight - tableTopInContainer - footerHeight - afterHeight - scrollPaddingBottom - 1,
    );
  }

  const debouncedUpdate = createDebounce(update, 300);

  onMounted(() => {
    window.addEventListener('resize', debouncedUpdate);
    ensureObserveRoot();
    update();
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', debouncedUpdate);
    debouncedUpdate.cancel();
    disconnectObservers();
  });

  return computed(() => Math.max(maxHeight.value, minHeight));
}
