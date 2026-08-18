/**
 * v-watermark 指令
 *
 * 在目标容器内渲染斜排水印，绝对定位覆盖、pointer-events:none 不影响任何交互。
 * 若容器未设置 position 则自动补 position:relative。
 *
 * ─── 安装 ────────────────────────────────────────────────────────────────────
 * 方式一：通过 installDirectives 统一注册（全局可用）
 *   import { installDirectives } from '@ku-utils/directives'
 *   installDirectives(app)
 *   // 模板中直接 v-watermark
 *
 * 方式二：按需导入（推荐，仅在用到的组件里引入）
 *   import { vWatermark } from '@ku-utils/directives'
 *
 * ─── 基础用法 ─────────────────────────────────────────────────────────────────
 * 绑定值为 string[]，空字符串自动过滤。
 * 推荐将包含表格的 div 作为挂载目标：
 *
 *   <div v-watermark="[currentUser.displayName]">
 *     <el-table :data="list" />
 *   </div>
 *
 * ─── 多行水印 ─────────────────────────────────────────────────────────────────
 * 数组中每个元素为一行文字：
 *
 *   <div v-watermark="[currentUser.displayName, currentUser.username]">
 *     <el-table :data="list" />
 *   </div>
 *
 * ─── 响应式 ───────────────────────────────────────────────────────────────────
 * binding.value 变化时（如用户信息异步加载完成）会自动重绘，无需手动处理。
 */
import type { Directive } from 'vue';

interface WatermarkOptions {
  opacity?: number;
  fontSize?: number;
  angle?: number;
  gap?: [number, number];
}

function buildDataUrl(lines: string[], options: WatermarkOptions = {}): string {
  const { opacity = 0.06, fontSize = 14, angle = -22, gap = [120, 80] } = options;

  const ratio = window.devicePixelRatio || 1;
  const [gapX, gapY] = gap;
  const lineHeight = fontSize + 10;

  const probe = document.createElement('canvas').getContext('2d')!;
  probe.font = `${fontSize}px sans-serif`;
  const textWidth = Math.max(...lines.map((l) => probe.measureText(l).width), 60);
  const textHeight = lines.length * lineHeight;

  const cellW = textWidth + gapX;
  const cellH = textHeight + gapY;

  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(cellW * ratio);
  canvas.height = Math.ceil(cellH * ratio);

  const ctx = canvas.getContext('2d')!;
  ctx.scale(ratio, ratio);

  ctx.save();
  ctx.translate(cellW / 2, cellH / 2);
  ctx.rotate((angle * Math.PI) / 180);

  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const totalH = lines.length * lineHeight;
  lines.forEach((line, i) => {
    if (line) {
      ctx.fillText(line, 0, -totalH / 2 + i * lineHeight + lineHeight / 2);
    }
  });

  ctx.restore();

  return canvas.toDataURL('image/png');
}

function createOverlay(lines: string[]): HTMLElement {
  const el = document.createElement('div');
  Object.assign(el.style, {
    position: 'absolute',
    inset: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: '9',
    backgroundImage: `url(${buildDataUrl(lines)})`,
    backgroundRepeat: 'repeat',
  });
  return el;
}

const overlayMap = new WeakMap<HTMLElement, HTMLElement>();

function mount(el: HTMLElement, lines: string[]): void {
  if (!lines.length) return;

  const existing = overlayMap.get(el);
  existing?.remove();

  const overlay = createOverlay(lines);
  overlayMap.set(el, overlay);

  const pos = getComputedStyle(el).position;
  if (!['relative', 'absolute', 'fixed', 'sticky'].includes(pos)) {
    el.style.position = 'relative';
  }

  el.appendChild(overlay);
}

function unmount(el: HTMLElement): void {
  overlayMap.get(el)?.remove();
  overlayMap.delete(el);
}

export const vWatermark: Directive<HTMLElement, string[]> = {
  mounted(el, binding) {
    const lines = (binding.value ?? []).filter(Boolean);
    mount(el, lines);
  },

  updated(el, binding) {
    const newLines = (binding.value ?? []).filter(Boolean);
    const oldLines = (binding.oldValue ?? []).filter(Boolean);
    if (JSON.stringify(newLines) !== JSON.stringify(oldLines)) {
      mount(el, newLines);
    }
  },

  beforeUnmount(el) {
    unmount(el);
  },
};
