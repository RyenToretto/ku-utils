import { camelCase } from './string';

let scrollBarWidth: number;

/**
 * 获取滚动条宽度（结果缓存）
 */
export function getScrollBarWidth(): number {
  if (scrollBarWidth !== undefined) return scrollBarWidth;

  const outer = document.createElement('div');
  outer.style.visibility = 'hidden';
  outer.style.width = '100px';
  outer.style.position = 'absolute';
  outer.style.top = '-9999px';
  document.body.appendChild(outer);

  const widthNoScroll = outer.offsetWidth;
  outer.style.overflow = 'scroll';

  const inner = document.createElement('div');
  inner.style.width = '100%';
  outer.appendChild(inner);

  const widthWithScroll = inner.offsetWidth;
  outer.parentNode?.removeChild(outer);
  scrollBarWidth = widthNoScroll - widthWithScroll;

  return scrollBarWidth;
}

/**
 * 锁定 body 滚动（自动 padding 补偿滚动条）
 */
export function lockScroll(): void {
  const sbw = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = 'hidden';
  if (sbw > 0) {
    document.body.style.paddingRight = `${sbw}px`;
  }
}

/**
 * 恢复 body 滚动
 */
export function restoreScroll(): void {
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
}

/**
 * 阻止事件冒泡 + 默认行为（容错版）
 */
export function stopPropagation(e: Event): void {
  try {
    if (e?.stopImmediatePropagation) e.stopImmediatePropagation();
    if (e?.stopPropagation) e.stopPropagation();
    if (e?.preventDefault) e.preventDefault();
  } catch {
    // ignore
  }
}

/**
 * 平滑滚动到顶部
 */
export function scrollToTop(): void {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * 容器内滚到子元素（用于下拉、虚拟列表等）
 */
export function doScrollTo(container: HTMLElement, selected: HTMLElement | null): void {
  if (!selected) {
    container.scrollTop = 0;
    return;
  }

  const offsetParents: HTMLElement[] = [];
  let pointer = selected.offsetParent as HTMLElement | null;
  while (pointer && container !== pointer && container.contains(pointer)) {
    offsetParents.push(pointer);
    pointer = pointer.offsetParent as HTMLElement | null;
  }

  const top = selected.offsetTop + offsetParents.reduce((prev, curr) => prev + curr.offsetTop, 0);
  const bottom = top + selected.offsetHeight;
  const viewRectTop = container.scrollTop;
  const viewRectBottom = viewRectTop + container.clientHeight;

  if (top < viewRectTop) {
    container.scrollTop = top;
  } else if (bottom > viewRectBottom) {
    container.scrollTop = bottom - container.clientHeight;
  }
}

/**
 * getComputedStyle 封装（兼容 'float' → 'cssFloat'）
 */
export function getStyle(element: HTMLElement, styleName: string): string | null {
  if (!element || !styleName) return null;
  const name = camelCase(styleName === 'float' ? 'cssFloat' : styleName);
  try {
    const computed = window.getComputedStyle(element, '');
    return computed
      ? computed.getPropertyValue(styleName) ||
          (computed as unknown as Record<string, string>)[name]
      : (element.style as unknown as Record<string, string>)[name];
  } catch {
    return (element.style as unknown as Record<string, string>)[name];
  }
}

/**
 * 批量设置元素样式（数字自动加 px）
 */
export function setStyle(element: HTMLElement, styles: Record<string, string | number>): void {
  if (!element) return;
  for (const [key, value] of Object.entries(styles)) {
    const styleName = camelCase(key);
    (element.style as unknown as Record<string, string>)[styleName] =
      typeof value === 'number' ? `${value}px` : value;
  }
}

export function addClass(element: HTMLElement, className: string): void {
  if (!element || !className) return;
  element.classList.add(...className.split(' ').filter(Boolean));
}

export function removeClass(element: HTMLElement, className: string): void {
  if (!element || !className) return;
  element.classList.remove(...className.split(' ').filter(Boolean));
}

export function toggleClass(element: HTMLElement, className: string): void {
  if (!element || !className) return;
  element.classList.toggle(className);
}

export function hasClass(element: HTMLElement, className: string): boolean {
  if (!element || !className) return false;
  return element.classList.contains(className);
}

/**
 * 元素相对文档的偏移
 */
export function getOffset(element: HTMLElement): { top: number; left: number } {
  const rect = element.getBoundingClientRect();
  return {
    top: rect.top + window.scrollY,
    left: rect.left + window.scrollX,
  };
}

/**
 * 视口高度（优先 visualViewport）
 */
export function getViewHeight(): number {
  if (typeof window === 'undefined') return 0;
  if (window.visualViewport) return window.visualViewport.height;

  const htmlHeight = document.documentElement.clientHeight;
  const bodyHeight = document.body.clientHeight;
  return htmlHeight && bodyHeight ? Math.min(htmlHeight, bodyHeight) : htmlHeight || bodyHeight;
}

/**
 * 鼠标相对元素位置（含 top/right/bottom/left）
 */
export function posInElement(
  obj: HTMLElement,
  e: MouseEvent,
): { top: number; right: number; bottom: number; left: number } {
  if (!obj) return { top: 0, right: 0, bottom: 0, left: 0 };

  const mouseX = e.clientX;
  const mouseY = e.clientY;

  const objX = obj.getBoundingClientRect().left - document.documentElement.clientLeft;
  const objY = obj.getBoundingClientRect().top - document.documentElement.clientTop;

  return {
    top: mouseY - objY,
    left: mouseX - objX,
    bottom: obj.offsetHeight - (mouseY - objY),
    right: obj.offsetWidth - (mouseX - objX),
  };
}
