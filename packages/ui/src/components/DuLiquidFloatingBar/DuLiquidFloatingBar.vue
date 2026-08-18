<template>
  <div
    class="du-liquid-floating-bar"
    :class="[
      `du-liquid-floating-bar-${placement}`,
      {
        'du-liquid-floating-bar-sticky': sticky && placement !== 'static',
        'du-liquid-floating-bar-condensed': isCondensed,
        'du-liquid-floating-bar-transparent': isTransparent,
      },
    ]"
    :style="barStyle"
  >
    <DuLiquidGlass
      class="du-liquid-floating-bar-glass"
      :filter-id="glassId"
      :mode="glassMode"
      :disabled="isTransparent"
      :radius="isCondensed ? condensedRadius : expandedRadius"
      :blur="blur"
      :saturate="saturate"
      :tint="tint"
      :border-color="borderColor"
      :border-width="borderWidth"
      :shadow="shadow"
      :displacement-scale="displacementScale"
      :edge="edge"
      :highlight="highlight"
    >
      <div class="du-liquid-floating-bar-inner">
        <slot :condensed="isCondensed" />
      </div>
    </DuLiquidGlass>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import type { CSSProperties } from 'vue';

import DuLiquidGlass from '../DuLiquidGlass/DuLiquidGlass.vue';

defineOptions({ name: 'DuLiquidFloatingBar' });

const props = withDefaults(defineProps<Props>(), {
  glassId: undefined,
  mode: 'liquid',
  placement: 'top',
  sticky: true,
  transparentAtTop: true,
  forceCondensed: false,
  condenseOn: 64,
  condenseOff: 24,
  offset: '0px',
  zIndex: 10,
  expandedWidth: '100%',
  condensedWidth: 'min(1280px, calc(100% - 32px))',
  expandedHeight: '64px',
  condensedHeight: '52px',
  expandedMargin: '0 auto',
  condensedMargin: '10px auto 0',
  expandedRadius: '0',
  condensedRadius: 'var(--ku-radius-full)',
  transitionDuration: 420,
  blur: 7,
  saturate: 1.4,
  tint: 'color-mix(in srgb, var(--ku-bg-card) 58%, transparent)',
  borderColor: 'color-mix(in srgb, var(--ku-border-default) 62%, transparent)',
  borderWidth: '1px',
  shadow:
    'inset 0 0 2px 1px color-mix(in srgb, var(--ku-bg-card) 68%, transparent), inset 0 0 10px 4px color-mix(in srgb, var(--ku-bg-card) 28%, transparent), 0 8px 28px color-mix(in srgb, var(--ku-neutral-900) 8%, transparent), 0 14px 44px color-mix(in srgb, var(--ku-neutral-900) 6%, transparent)',
  displacementScale: 50,
  optimizeLiquidDuringTransition: true,
  edge: false,
  highlight: true,
});

const emit = defineEmits<{
  'update:condensed': [value: boolean];
}>();

interface Props {
  /**
   * 透传给内部 DuLiquidGlass 的稳定 filter id，SSR 页面建议显式传入。
   */
  glassId?: string;
  mode?: 'plain' | 'liquid';
  placement?: 'top' | 'bottom' | 'static';
  sticky?: boolean;
  transparentAtTop?: boolean;
  forceCondensed?: boolean;
  condenseOn?: number;
  condenseOff?: number;
  offset?: string;
  zIndex?: number | string;
  expandedWidth?: string;
  condensedWidth?: string;
  expandedHeight?: string;
  condensedHeight?: string;
  expandedMargin?: string;
  condensedMargin?: string;
  expandedRadius?: string;
  condensedRadius?: string;
  transitionDuration?: number;
  blur?: number;
  saturate?: number;
  tint?: string;
  borderColor?: string;
  borderWidth?: string;
  shadow?: string;
  displacementScale?: number;
  optimizeLiquidDuringTransition?: boolean;
  edge?: boolean;
  highlight?: boolean;
}

const scrolledCondensed = ref(false);
const isTransitioning = ref(false);
let scrollFrame = 0;
let transitionTimer = 0;

const isCondensed = computed(() => {
  if (props.forceCondensed) return true;
  if (!props.transparentAtTop) return true;
  return scrolledCondensed.value;
});

const isTransparent = computed(() => props.transparentAtTop && !isCondensed.value);
const glassMode = computed(() => {
  if (props.optimizeLiquidDuringTransition && isTransitioning.value) return 'plain';

  return props.mode;
});

const barStyle = computed<CSSProperties>(() => ({
  '--ku-liquid-floating-bar-width': isCondensed.value ? props.condensedWidth : props.expandedWidth,
  '--ku-liquid-floating-bar-height': isCondensed.value
    ? props.condensedHeight
    : props.expandedHeight,
  '--ku-liquid-floating-bar-margin': isCondensed.value
    ? props.condensedMargin
    : props.expandedMargin,
  '--ku-liquid-floating-bar-offset': props.offset,
  '--ku-liquid-floating-bar-z-index': String(props.zIndex),
  '--ku-liquid-floating-bar-transition-duration': `${props.transitionDuration}ms`,
  '--ku-liquid-floating-bar-will-change': isTransitioning.value ? 'width, height, margin' : 'auto',
}));

function markTransitioning() {
  if (typeof window === 'undefined' || props.transitionDuration <= 0) return;

  isTransitioning.value = true;
  window.clearTimeout(transitionTimer);
  transitionTimer = window.setTimeout(() => {
    isTransitioning.value = false;
  }, props.transitionDuration + 80);
}

function updateScrollState() {
  if (typeof window === 'undefined') return;

  if (!props.transparentAtTop) {
    scrolledCondensed.value = true;
    return;
  }

  const scrollTop = window.scrollY;

  if (!scrolledCondensed.value && scrollTop > props.condenseOn) {
    scrolledCondensed.value = true;
  } else if (scrolledCondensed.value && scrollTop < props.condenseOff) {
    scrolledCondensed.value = false;
  }
}

function onScroll() {
  if (scrollFrame || typeof window === 'undefined') return;

  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = 0;
    updateScrollState();
  });
}

watch(
  () => [props.transparentAtTop, props.forceCondensed],
  () => {
    updateScrollState();
  },
);

watch(isCondensed, (value, oldValue) => {
  if (value !== oldValue) {
    markTransitioning();
  }

  emit('update:condensed', value);
});

onMounted(() => {
  updateScrollState();
  window.addEventListener('scroll', onScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll);

  if (scrollFrame) {
    window.cancelAnimationFrame(scrollFrame);
  }

  window.clearTimeout(transitionTimer);
});
</script>

<style>
.du-liquid-floating-bar {
  width: var(--ku-liquid-floating-bar-width);
  height: var(--ku-liquid-floating-bar-height);
  margin: var(--ku-liquid-floating-bar-margin);
  contain: layout;
  transform: translateZ(0);
  backface-visibility: hidden;
  will-change: var(--ku-liquid-floating-bar-will-change);
  transition:
    width var(--ku-liquid-floating-bar-transition-duration) cubic-bezier(0.22, 0.61, 0.36, 1),
    height var(--ku-liquid-floating-bar-transition-duration) cubic-bezier(0.22, 0.61, 0.36, 1),
    margin var(--ku-liquid-floating-bar-transition-duration) cubic-bezier(0.22, 0.61, 0.36, 1);
}

.du-liquid-floating-bar-sticky {
  position: sticky;
  z-index: var(--ku-liquid-floating-bar-z-index);
}

.du-liquid-floating-bar-top.du-liquid-floating-bar-sticky {
  top: var(--ku-liquid-floating-bar-offset);
}

.du-liquid-floating-bar-bottom.du-liquid-floating-bar-sticky {
  bottom: var(--ku-liquid-floating-bar-offset);
}

.du-liquid-floating-bar-static {
  position: relative;
}

.du-liquid-floating-bar-glass,
.du-liquid-floating-bar-inner {
  width: 100%;
  height: 100%;
}

.du-liquid-floating-bar-inner {
  display: flex;
  align-items: center;
}

@media (prefers-reduced-motion: reduce) {
  .du-liquid-floating-bar {
    transition: none;
  }
}
</style>
