import type { Directive } from 'vue';

function injectStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('du-loading-styles')) return;

  const style = document.createElement('style');
  style.id = 'du-loading-styles';
  style.textContent = `
.du-loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ku-loading-bg, rgba(247, 243, 235, 0.88));
  z-index: var(--ku-z-overlay, 1040);
  transition: opacity var(--ku-transition-base, 200ms cubic-bezier(0.4, 0, 0.2, 1));
}
.du-loading-spinner {
  color: var(--ku-color-primary, #9a6328);
}
`;
  document.head.appendChild(style);
}

export const vLoading: Directive<HTMLElement, boolean> = {
  mounted(el, binding) {
    injectStyles();

    const overlay = document.createElement('div');
    overlay.className = 'du-loading-overlay';
    overlay.innerHTML = `
      <div class="du-loading-spinner">
        <svg viewBox="0 0 50 50" width="40" height="40">
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-dasharray="80,200" stroke-dashoffset="0">
            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
    `;

    el.style.position = el.style.position || 'relative';
    (el as unknown as Record<string, HTMLElement>).__loadingOverlay = overlay;

    if (binding.value) {
      el.appendChild(overlay);
    }
  },
  updated(el, binding) {
    const overlay = (el as unknown as Record<string, HTMLElement>).__loadingOverlay;
    if (!overlay) return;

    if (binding.value && !el.contains(overlay)) {
      el.appendChild(overlay);
    } else if (!binding.value && el.contains(overlay)) {
      el.removeChild(overlay);
    }
  },
  unmounted(el) {
    const overlay = (el as unknown as Record<string, HTMLElement>).__loadingOverlay;
    if (overlay && el.contains(overlay)) {
      el.removeChild(overlay);
    }
  },
};
