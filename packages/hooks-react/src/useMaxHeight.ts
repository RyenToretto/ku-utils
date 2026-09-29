import { getViewHeight } from '@ku-utils/utils';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseMaxHeightOptions {
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

export interface UseMaxHeightReturn {
  /** 计算后的表格最大高度（已应用 minHeight） */
  maxHeight: number;
  /** 手动触发一次高度重算 */
  refresh: () => void;
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
 * 监听 resize 与容器 DOM 变化自动重算；目标元素延迟挂载（如条件渲染空态→表格）时会在 update 内重新解析。
 */
export function useMaxHeight(options: UseMaxHeightOptions = {}): UseMaxHeightReturn {
  const {
    containSelector = '.main-body',
    targetSelector = '.table-wrap .ant-table',
    footerSelector = '.main-footer',
    defaultHeight = 200,
    minHeight = 332,
  } = options;

  const [rawHeight, setRawHeight] = useState(defaultHeight);
  const lastHeightInfo = useRef('');
  const observerRef = useRef<MutationObserver | null>(null);
  const sizeObserverRef = useRef<ResizeObserver | null>(null);
  const observedRootRef = useRef<Element | null>(null);
  const debouncedUpdateRef = useRef<ReturnType<typeof createDebounce> | null>(null);

  const optionsRef = useRef({ containSelector, targetSelector, footerSelector });
  optionsRef.current = { containSelector, targetSelector, footerSelector };

  const disconnectObservers = useCallback((): void => {
    observerRef.current?.disconnect();
    observerRef.current = null;
    sizeObserverRef.current?.disconnect();
    sizeObserverRef.current = null;
    observedRootRef.current = null;
  }, []);

  const listenDom = useCallback(
    (ele: Element): void => {
      const onChange = debouncedUpdateRef.current;
      if (!onChange) return;
      if (observedRootRef.current === ele && observerRef.current) return;
      disconnectObservers();
      observedRootRef.current = ele;
      observerRef.current = new window.MutationObserver(onChange);
      observerRef.current.observe(ele, { subtree: true, childList: true });
      if (typeof ResizeObserver !== 'undefined') {
        sizeObserverRef.current = new ResizeObserver(onChange);
        sizeObserverRef.current.observe(ele);
      }
    },
    [disconnectObservers],
  );

  const ensureObserveRoot = useCallback((): void => {
    const { containSelector: cs } = optionsRef.current;
    const contain = cs ? document.querySelector(cs) : null;
    listenDom(contain ?? document.body);
  }, [listenDom]);

  const update = useCallback((): void => {
    ensureObserveRoot();

    const { containSelector: cs, targetSelector: ts, footerSelector: fs } = optionsRef.current;

    const contain = cs ? document.querySelector(cs) : null;
    const target = resolveTargetInContain(contain, ts);

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

    const footerEle = fs ? document.querySelector(fs) : null;
    const footerHeight = footerEle ? getElementOuterHeight(footerEle) : 0;
    const afterHeight = getAfterSiblingsHeight(target, contain);

    const newHeightInfo = `1_${Math.round(tableTopInContainer)}_${availableHeight}_${Math.round(footerHeight)}_${Math.round(afterHeight)}_${Math.round(scrollPaddingBottom)}`;
    if (newHeightInfo === lastHeightInfo.current) return;
    lastHeightInfo.current = newHeightInfo;

    setRawHeight(
      Math.floor(
        availableHeight -
          tableTopInContainer -
          footerHeight -
          afterHeight -
          scrollPaddingBottom -
          1,
      ),
    );
  }, [ensureObserveRoot]);

  const refresh = useCallback((): void => {
    update();
  }, [update]);

  useEffect(() => {
    const debouncedUpdate = createDebounce(update, 300);
    debouncedUpdateRef.current = debouncedUpdate;

    window.addEventListener('resize', debouncedUpdate);
    ensureObserveRoot();
    update();

    return () => {
      window.removeEventListener('resize', debouncedUpdate);
      debouncedUpdate.cancel();
      debouncedUpdateRef.current = null;
      disconnectObservers();
    };
  }, [disconnectObservers, ensureObserveRoot, update]);

  return {
    maxHeight: Math.max(rawHeight, minHeight),
    refresh,
  };
}
