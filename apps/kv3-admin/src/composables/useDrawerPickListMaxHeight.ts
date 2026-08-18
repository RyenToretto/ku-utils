import { useMaxHeight } from '@ku-utils/hooks';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, type ComputedRef } from 'vue';

/** Drawer 根节点 class，与 Selector 上 el-drawer 保持一致 */
export const DRAWER_MODEL_SELECTOR_CLASS = '.drawer-model-selector';

const WRAP_BD_SELECTOR = `${DRAWER_MODEL_SELECTOR_CLASS} .drawer-pick-table-wrap .table-wrap__bd`;

/**
 * Drawer 内表格 max-height。
 *
 * **优先**用 `table-wrap__bd` 实测高度填满（flex 已扣掉筛区/分页），避免：
 * 1) 与偏小的 viewport 算法结果取 `min` 导致半截表 + 底部空白
 * 2) 按行高 snap 再吃掉数十 px
 *
 * DOM 约定：
 * - el-drawer 带 class `drawer-model-selector`
 * - 内容壳带 `do-drawer__view`（flex 撑满 body）
 * - TableWrap 带 class `drawer-pick-table-wrap`
 * - el-table 带传入的 `tableClass` + `do-inner-scroller page-table hide-table-border`
 * - `@opened` 调用返回的 `remeasureAfterLayout()`（nextTick + 双 rAF 后重测）
 */
export function useDrawerPickListMaxHeight(
  tableClass: string,
  minHeight = 200,
): {
  maxHeight: ComputedRef<number>;
  remeasure: () => void;
  remeasureAfterLayout: () => Promise<void>;
} {
  const wrapBdHeight = ref(0);
  const targetSelector = `${DRAWER_MODEL_SELECTOR_CLASS} .drawer-pick-table-wrap .el-table.${tableClass}`;

  const rawMaxHeight = useMaxHeight(
    `${DRAWER_MODEL_SELECTOR_CLASS} .el-drawer__body`,
    targetSelector,
    minHeight,
    {
      footerSelector: `${DRAWER_MODEL_SELECTOR_CLASS} .el-drawer__footer`,
      minHeight,
    },
  );

  let resizeObserver: ResizeObserver | null = null;
  let observedWrapBd: Element | null = null;

  function ensureWrapObserver() {
    const wrapBd = document.querySelector(WRAP_BD_SELECTOR);
    wrapBdHeight.value = wrapBd?.clientHeight ?? 0;
    if (!wrapBd || typeof ResizeObserver === 'undefined') return;
    if (observedWrapBd === wrapBd) return;
    resizeObserver?.disconnect();
    resizeObserver = new ResizeObserver(() => {
      wrapBdHeight.value = wrapBd.clientHeight;
    });
    resizeObserver.observe(wrapBd);
    observedWrapBd = wrapBd;
  }

  function remeasure() {
    ensureWrapObserver();
    window.dispatchEvent(new Event('resize'));
  }

  async function remeasureAfterLayout() {
    await nextTick();
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => resolve());
      });
    });
    remeasure();
  }

  onMounted(() => {
    ensureWrapObserver();
    window.addEventListener('resize', ensureWrapObserver);
  });

  onBeforeUnmount(() => {
    resizeObserver?.disconnect();
    observedWrapBd = null;
    window.removeEventListener('resize', ensureWrapObserver);
  });

  const maxHeight = computed(() => {
    // wrapBd 已是表格可用区（不含 TableWrap 分页 ft）；有实测则以其为准填满
    if (wrapBdHeight.value > 0) {
      return Math.max(Math.floor(wrapBdHeight.value), minHeight);
    }
    // 抽屉未铺开时的兜底：viewport 算法
    return Math.max(Math.floor(rawMaxHeight.value), minHeight);
  });

  return { maxHeight, remeasure, remeasureAfterLayout };
}
