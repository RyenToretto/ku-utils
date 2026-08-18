function addLight(color: string, amount: number): string {
  const parsed = parseInt(color, 16);
  const cc = (Number.isNaN(parsed) ? 0 : parsed) + amount;
  const c = Math.max(0, Math.min(255, cc));
  return c.toString(16).length > 1 ? c.toString(16) : `0${c.toString(16)}`;
}

/**
 * 将 HEX 颜色按百分比变浅
 *   lighten('#3366ff', 20) // 较浅版本
 */
export function lighten(color: string, amount: number): string {
  const c = color.indexOf('#') >= 0 ? color.substring(1, color.length) : color;
  const a = Math.trunc((255 * amount) / 100);
  return `#${addLight(c.substring(0, 2), a)}${addLight(c.substring(2, 4), a)}${addLight(
    c.substring(4, 6),
    a,
  )}`;
}
