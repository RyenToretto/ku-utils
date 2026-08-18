<template>
  <div
    ref="rootRef"
    class="du-liquid-glass"
    :class="[`du-liquid-glass-${mode}`, { 'du-liquid-glass-disabled': disabled }]"
    :style="containerStyle"
  >
    <svg
      v-if="mode === 'liquid' && !disabled"
      class="du-liquid-glass-defs"
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
    >
      <defs>
        <filter
          :id="resolvedFilterId"
          color-interpolation-filters="sRGB"
        >
          <feImage
            ref="mapRef"
            x="0"
            y="0"
            width="100%"
            height="100%"
            preserveAspectRatio="none"
            result="map"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            xChannelSelector="R"
            yChannelSelector="B"
            :scale="redDisplacement"
            result="dispRed"
          />
          <feColorMatrix
            in="dispRed"
            type="matrix"
            values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
            result="red"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            xChannelSelector="R"
            yChannelSelector="B"
            :scale="greenDisplacement"
            result="dispGreen"
          />
          <feColorMatrix
            in="dispGreen"
            type="matrix"
            values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
            result="green"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="map"
            xChannelSelector="R"
            yChannelSelector="B"
            :scale="blueDisplacement"
            result="dispBlue"
          />
          <feColorMatrix
            in="dispBlue"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"
            result="blue"
          />
          <feBlend
            in="red"
            in2="green"
            mode="screen"
            result="rg"
          />
          <feBlend
            in="rg"
            in2="blue"
            mode="screen"
            result="output"
          />
          <feGaussianBlur
            in="output"
            :stdDeviation="channelBlur"
          />
        </filter>
      </defs>
    </svg>

    <div
      class="du-liquid-glass-surface"
      aria-hidden="true"
      :style="surfaceStyle"
    />
    <div
      v-if="edge && !disabled"
      class="du-liquid-glass-edge"
      aria-hidden="true"
    />
    <div
      v-if="highlight && !disabled"
      class="du-liquid-glass-highlight"
      aria-hidden="true"
    />

    <div class="du-liquid-glass-content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import type { CSSProperties } from 'vue';

defineOptions({ name: 'DuLiquidGlass' });

const props = withDefaults(defineProps<Props>(), {
  filterId: undefined,
  mode: 'liquid',
  disabled: false,
  radius: 'var(--du-radius-xl)',
  blur: 7,
  saturate: 1.4,
  tint: 'color-mix(in srgb, var(--du-color-bg-primary) 58%, transparent)',
  borderColor: 'color-mix(in srgb, var(--du-color-border) 62%, transparent)',
  borderWidth: '1px',
  shadow:
    'inset 0 0 2px 1px color-mix(in srgb, var(--du-color-bg-primary) 68%, transparent), inset 0 0 10px 4px color-mix(in srgb, var(--du-color-bg-primary) 28%, transparent), 0 8px 28px color-mix(in srgb, var(--du-neutral-900) 8%, transparent)',
  displacementScale: 50,
  mapBlur: undefined,
  mapAlpha: 0.93,
  mapLightness: 50,
  channelBlur: 0.7,
  edge: false,
  highlight: true,
});

interface Props {
  /**
   * 稳定的 SVG filter id。
   * SSR 场景建议显式传入，避免服务端和客户端实例 uid 不一致导致 hydration mismatch。
   */
  filterId?: string;
  mode?: 'plain' | 'liquid';
  disabled?: boolean;
  radius?: string;
  blur?: number;
  saturate?: number;
  tint?: string;
  borderColor?: string;
  borderWidth?: string;
  shadow?: string;
  displacementScale?: number;
  mapBlur?: number;
  mapAlpha?: number;
  mapLightness?: number;
  channelBlur?: number;
  edge?: boolean;
  highlight?: boolean;
}

const instance = getCurrentInstance();
const rootRef = ref<HTMLElement | null>(null);
const mapRef = ref<SVGFEImageElement | null>(null);
const resolvedFilterId = computed(() => props.filterId ?? `du-liquid-glass-${instance?.uid ?? 0}`);

let resizeObserver: ResizeObserver | undefined;
let mapTimer: number | undefined;

const redDisplacement = computed(() => -props.displacementScale);
const greenDisplacement = computed(() => -Math.max(props.displacementScale - 3, 0));
const blueDisplacement = computed(() => -Math.max(props.displacementScale - 6, 0));

const backdropFilter = computed(() => {
  const base = `blur(${props.blur}px) saturate(${props.saturate})`;

  if (props.disabled) return 'none';
  if (props.mode === 'liquid') return `url('#${resolvedFilterId.value}') ${base}`;

  return base;
});

const containerStyle = computed<CSSProperties>(() => ({
  '--du-liquid-glass-radius': props.radius,
  '--du-liquid-glass-tint': props.disabled ? 'transparent' : props.tint,
  '--du-liquid-glass-border-color': props.disabled ? 'transparent' : props.borderColor,
  '--du-liquid-glass-border-width': props.disabled ? '0' : props.borderWidth,
  '--du-liquid-glass-shadow': props.disabled ? 'none' : props.shadow,
}));

const surfaceStyle = computed<CSSProperties>(() => ({
  backdropFilter: backdropFilter.value,
  WebkitBackdropFilter: backdropFilter.value,
}));

function buildGlassMap(width: number, height: number) {
  const radius = Math.round(height / 2);
  const inset = Math.max(1.6, height * 0.035);
  const blur = props.mapBlur ?? Math.max(9, height * 0.2);
  const innerWidth = Math.max(1, width - inset * 2);
  const innerHeight = Math.max(1, height - inset * 2);
  const svg = `<svg viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="red" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#000"/><stop offset="100%" stop-color="red"/></linearGradient><linearGradient id="blue" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#000"/><stop offset="100%" stop-color="blue"/></linearGradient></defs><rect x="0" y="0" width="${width}" height="${height}" fill="black"/><rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#red)"/><rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" fill="url(#blue)" style="mix-blend-mode:difference"/><rect x="${inset}" y="${inset}" width="${innerWidth}" height="${innerHeight}" rx="${radius}" fill="hsl(0 0% ${props.mapLightness}% / ${props.mapAlpha})" style="filter:blur(${blur}px)"/></svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function syncGlassMap() {
  if (typeof window === 'undefined' || props.mode !== 'liquid' || props.disabled) return;
  if (!rootRef.value || !mapRef.value) return;

  const rect = rootRef.value.getBoundingClientRect();
  const width = Math.max(1, Math.round(rect.width));
  const height = Math.max(1, Math.round(rect.height));
  const uri = buildGlassMap(width, height);

  mapRef.value.setAttribute('href', uri);
  mapRef.value.setAttributeNS('http://www.w3.org/1999/xlink', 'href', uri);
}

function scheduleGlassMap() {
  if (typeof window === 'undefined') return;

  window.clearTimeout(mapTimer);
  mapTimer = window.setTimeout(syncGlassMap, 140);
}

watch(
  () => [
    props.filterId,
    props.mode,
    props.disabled,
    props.radius,
    props.displacementScale,
    props.mapBlur,
    props.mapAlpha,
    props.mapLightness,
  ],
  () => {
    nextTick(scheduleGlassMap);
  },
);

onMounted(() => {
  nextTick(syncGlassMap);

  if (rootRef.value && window.ResizeObserver) {
    resizeObserver = new ResizeObserver(scheduleGlassMap);
    resizeObserver.observe(rootRef.value);
  }
});

onUnmounted(() => {
  window.clearTimeout(mapTimer);
  resizeObserver?.disconnect();
});

defineExpose({ syncGlassMap });
</script>

<style>
.du-liquid-glass {
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  border: var(--du-liquid-glass-border-width) solid var(--du-liquid-glass-border-color);
  border-radius: var(--du-liquid-glass-radius);
  background: transparent;
  box-shadow: var(--du-liquid-glass-shadow);
  isolation: isolate;
  contain: layout;
  transform: translateZ(0);
  backface-visibility: hidden;
}

.du-liquid-glass-defs {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}

.du-liquid-glass-surface {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background: var(--du-liquid-glass-tint);
  transition:
    background var(--du-transition-base),
    opacity var(--du-transition-base);
  pointer-events: none;
}

.du-liquid-glass-edge,
.du-liquid-glass-highlight {
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
  pointer-events: none;
}

.du-liquid-glass-edge {
  box-shadow: inset 0 -1px 0 color-mix(in srgb, var(--du-color-bg-primary) 42%, transparent);
  mask-image: linear-gradient(to bottom, transparent 0, transparent 62%, #fff 100%);
}

.du-liquid-glass-highlight {
  box-shadow:
    inset 0 1px 0 color-mix(in srgb, var(--du-color-bg-primary) 64%, transparent),
    inset 0 -10px 30px color-mix(in srgb, var(--du-color-bg-primary) 12%, transparent);
  opacity: 0.9;
}

.du-liquid-glass-content {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
}

.du-liquid-glass-disabled {
  box-shadow: none;
}

@supports not (backdrop-filter: blur(1px)) {
  .du-liquid-glass-surface {
    background: color-mix(in srgb, var(--du-color-bg-primary) 88%, transparent);
  }
}

@media (prefers-reduced-motion: reduce) {
  .du-liquid-glass-surface {
    transition: none;
  }
}
</style>
