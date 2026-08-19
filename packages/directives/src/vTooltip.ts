import type { Directive, DirectiveBinding } from 'vue';

interface TooltipHTMLElement extends HTMLElement {
  _tooltipEl?: HTMLDivElement;
  _showTooltip?: () => void;
  _hideTooltip?: () => void;
}

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipOptions {
  content: string;
  placement?: TooltipPlacement;
  delay?: number;
}

function getOptions(binding: DirectiveBinding): TooltipOptions {
  if (typeof binding.value === 'string') {
    return { content: binding.value, placement: 'top', delay: 200 };
  }
  return { placement: 'top', delay: 200, ...binding.value };
}

function createTooltipEl(content: string): HTMLDivElement {
  const el = document.createElement('div');
  el.className = 'du-tooltip';
  el.textContent = content;
  el.style.cssText = `
    position: fixed;
    padding: 6px 10px;
    background: var(--ku-bg-tooltip, #1f2329);
    color: var(--ku-text-inverse, #ffffff);
    font-size: var(--ku-font-size-xs, 0.75rem);
    border-radius: var(--ku-radius-sm, 0.25rem);
    white-space: nowrap;
    pointer-events: none;
    z-index: var(--ku-z-tooltip, 1070);
    opacity: 0;
    transition: opacity var(--ku-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
  `;
  return el;
}

function positionTooltip(
  target: HTMLElement,
  tooltip: HTMLDivElement,
  placement: TooltipPlacement,
): void {
  const rect = target.getBoundingClientRect();
  const tipRect = tooltip.getBoundingClientRect();
  let top = 0;
  let left = 0;

  switch (placement) {
    case 'top':
      top = rect.top - tipRect.height - 8;
      left = rect.left + (rect.width - tipRect.width) / 2;
      break;
    case 'bottom':
      top = rect.bottom + 8;
      left = rect.left + (rect.width - tipRect.width) / 2;
      break;
    case 'left':
      top = rect.top + (rect.height - tipRect.height) / 2;
      left = rect.left - tipRect.width - 8;
      break;
    case 'right':
      top = rect.top + (rect.height - tipRect.height) / 2;
      left = rect.right + 8;
      break;
  }

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

/**
 * v-tooltip 工具提示指令
 *
 * 用法：
 * - v-tooltip="'提示文本'"
 * - v-tooltip="{ content: '提示', placement: 'bottom', delay: 300 }"
 */
export const vTooltip: Directive<TooltipHTMLElement> = {
  mounted(el, binding) {
    const options = getOptions(binding);
    const tooltipEl = createTooltipEl(options.content);
    el._tooltipEl = tooltipEl;

    let timer: ReturnType<typeof setTimeout> | null = null;

    el._showTooltip = () => {
      timer = setTimeout(() => {
        document.body.appendChild(tooltipEl);
        positionTooltip(el, tooltipEl, options.placement!);
        requestAnimationFrame(() => {
          tooltipEl.style.opacity = '1';
        });
      }, options.delay);
    };

    el._hideTooltip = () => {
      if (timer) clearTimeout(timer);
      tooltipEl.style.opacity = '0';
      setTimeout(() => {
        tooltipEl.parentNode?.removeChild(tooltipEl);
      }, 150);
    };

    el.addEventListener('mouseenter', el._showTooltip);
    el.addEventListener('mouseleave', el._hideTooltip);
  },

  updated(el, binding) {
    const options = getOptions(binding);
    if (el._tooltipEl) {
      el._tooltipEl.textContent = options.content;
    }
  },

  unmounted(el) {
    if (el._showTooltip) el.removeEventListener('mouseenter', el._showTooltip);
    if (el._hideTooltip) el.removeEventListener('mouseleave', el._hideTooltip);
    el._tooltipEl?.parentNode?.removeChild(el._tooltipEl);
  },
};
