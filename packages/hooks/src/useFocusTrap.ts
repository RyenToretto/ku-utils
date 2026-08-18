import { onMounted, onUnmounted, type Ref, unref, watch } from 'vue';

export interface UseFocusTrapOptions {
  /** Esc 键按下时的回调；用于关闭 Dialog */
  escClose?: () => void;
  /** 容器出现时是否自动 focus 第一个可聚焦元素（默认 true） */
  autoFocus?: boolean;
  /** 容器消失时是否还原触发元素焦点（默认 true） */
  restoreFocus?: boolean;
  /** 是否禁用焦点循环（仅保留 Esc）；默认 false */
  disableLoop?: boolean;
}

export interface UseFocusTrapReturn {
  /** 手动激活焦点陷阱 */
  activate: () => void;
  /** 手动停用焦点陷阱（含还原焦点） */
  deactivate: () => void;
}

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'area[href]',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'button:not([disabled])',
  'iframe',
  'object',
  'embed',
  '[contenteditable]:not([contenteditable="false"])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

type TargetSource = Ref<HTMLElement | null> | (() => HTMLElement | null);

/**
 * 焦点陷阱组合式函数（用于 Dialog / Modal / Drawer 的无障碍合规）
 *
 * 行为：
 *   - 容器元素出现时（target ref 从 null 变为非空），保存当前 activeElement，
 *     并将焦点移到容器内第一个可聚焦元素（可通过 autoFocus=false 关掉）
 *   - 容器存在期间，Tab / Shift+Tab 在容器内循环，焦点不会跑到容器外
 *   - 按 Esc 触发 escClose 回调
 *   - 容器消失时还原焦点到打开前的元素（可通过 restoreFocus=false 关掉）
 *
 * 用法：
 * ```ts
 * const panelRef = ref<HTMLElement | null>(null);
 * useFocusTrap(panelRef, { escClose: () => emit('close') });
 * ```
 *
 * 设计参考：WCAG 2.1 AA / ARIA Authoring Practices 模态对话框模式。
 */
export function useFocusTrap(
  target: TargetSource,
  options: UseFocusTrapOptions = {},
): UseFocusTrapReturn {
  const { escClose, autoFocus = true, restoreFocus = true, disableLoop = false } = options;

  let previousActive: HTMLElement | null = null;
  let active = false;

  const resolveEl = (): HTMLElement | null => {
    if (typeof target === 'function') return target();
    return unref(target) as HTMLElement | null;
  };

  const getFocusable = (root: HTMLElement): HTMLElement[] => {
    const nodes = root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    return Array.from(nodes).filter(
      (el) => el.offsetParent !== null || el.getClientRects().length > 0,
    );
  };

  const handleKeydown = (e: KeyboardEvent): void => {
    const root = resolveEl();
    if (!root) return;

    if (e.key === 'Escape' && typeof escClose === 'function') {
      e.preventDefault();
      escClose();
      return;
    }

    if (e.key !== 'Tab' || disableLoop) return;

    const focusable = getFocusable(root);
    if (focusable.length === 0) {
      e.preventDefault();
      root.focus();
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const currentActive = document.activeElement as HTMLElement | null;

    if (e.shiftKey) {
      if (currentActive === first || !root.contains(currentActive)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (currentActive === last || !root.contains(currentActive)) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const activate = (): void => {
    if (active || typeof window === 'undefined') return;
    const root = resolveEl();
    if (!root) return;
    active = true;
    previousActive = (document.activeElement as HTMLElement | null) ?? null;
    document.addEventListener('keydown', handleKeydown, true);
    if (autoFocus) {
      const focusable = getFocusable(root);
      const first = focusable[0] ?? root;
      // 异步以确保 transition 完成 / display 切换生效
      requestAnimationFrame(() => first.focus());
    }
  };

  const deactivate = (): void => {
    if (!active || typeof window === 'undefined') return;
    active = false;
    document.removeEventListener('keydown', handleKeydown, true);
    if (restoreFocus && previousActive && typeof previousActive.focus === 'function') {
      try {
        previousActive.focus();
      } catch {
        // ignore: 触发元素已被卸载 / 不可聚焦
      }
    }
    previousActive = null;
  };

  // watch target 出现/消失 → activate / deactivate
  const watchSource =
    typeof target === 'function' ? target : () => unref(target) as HTMLElement | null;
  watch(
    watchSource,
    (el, prev) => {
      if (el && !prev) activate();
      else if (!el && prev) deactivate();
    },
    { flush: 'post' },
  );

  // 兜底：组件挂载/卸载时同步状态
  onMounted(() => {
    if (resolveEl()) activate();
  });
  onUnmounted(() => deactivate());

  return { activate, deactivate };
}
