import { afterNextRender, computed, DestroyRef, inject, type Signal, signal } from '@angular/core';
import { getViewHeight } from '@ku-utils/utils';

export interface InjectMaxHeightOptions {
  /** 外层容器选择器，默认 '.main-body' */
  containSelector?: string;
  /** 目标表格选择器，默认 '.table-wrap .ant-table' */
  targetSelector?: string;
  /** 页脚选择器（其高度从可用高度中扣除），默认 '.main-footer' */
  footerSelector?: string;
  /** 兜底高度，默认 200 */
  defaultHeight?: number;
  /** 最小高度，默认 332 */
  minHeight?: number;
}

export interface InjectMaxHeightReturn {
  /** 计算后的表格最大高度（已应用 minHeight） */
  maxHeight: Signal<number>;
  /** 手动触发一次高度重算 */
  refresh: () => void;
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
 * 动态计算表格最大高度（须在注入上下文调用）。
 *
 * 首帧渲染后计算，监听 resize 与容器 DOM 变化自动重算；销毁时由 DestroyRef 统一清理。
 */
export function injectMaxHeight(options: InjectMaxHeightOptions = {}): InjectMaxHeightReturn {
  const {
    containSelector = '.main-body',
    targetSelector = '.table-wrap .ant-table',
    footerSelector = '.main-footer',
    defaultHeight = 200,
    minHeight = 332,
  } = options;

  const destroyRef = inject(DestroyRef);
  const rawHeight = signal(defaultHeight);
  let lastHeightInfo = '';
  let mutationObserver: MutationObserver | null = null;
  let sizeObserver: ResizeObserver | null = null;
  let observedRoot: Element | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let destroyed = false;

  const debouncedUpdate = (): void => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(update, 300);
  };

  function disconnectObservers(): void {
    mutationObserver?.disconnect();
    mutationObserver = null;
    sizeObserver?.disconnect();
    sizeObserver = null;
    observedRoot = null;
  }

  function ensureObserveRoot(): void {
    if (destroyed) return;
    const root = (containSelector && document.querySelector(containSelector)) || document.body;
    if (observedRoot === root && mutationObserver) return;
    disconnectObservers();
    observedRoot = root;
    mutationObserver = new MutationObserver(debouncedUpdate);
    mutationObserver.observe(root, { subtree: true, childList: true });
    if (typeof ResizeObserver !== 'undefined') {
      sizeObserver = new ResizeObserver(debouncedUpdate);
      sizeObserver.observe(root);
    }
  }

  function update(): void {
    if (destroyed) return;
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

    const nextInfo = `1_${Math.round(tableTopInContainer)}_${availableHeight}_${Math.round(footerHeight)}_${Math.round(afterHeight)}_${Math.round(scrollPaddingBottom)}`;
    if (nextInfo === lastHeightInfo) return;
    lastHeightInfo = nextInfo;

    rawHeight.set(
      Math.floor(
        availableHeight -
          tableTopInContainer -
          footerHeight -
          afterHeight -
          scrollPaddingBottom -
          1,
      ),
    );
  }

  afterNextRender(() => {
    window.addEventListener('resize', debouncedUpdate);
    ensureObserveRoot();
    update();
  });

  destroyRef.onDestroy(() => {
    destroyed = true;
    if (typeof window !== 'undefined') window.removeEventListener('resize', debouncedUpdate);
    if (timer) clearTimeout(timer);
    disconnectObservers();
  });

  return {
    maxHeight: computed(() => Math.max(rawHeight(), minHeight)),
    refresh: update,
  };
}
