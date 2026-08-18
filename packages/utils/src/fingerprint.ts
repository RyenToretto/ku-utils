/**
 * 浏览器指纹生成
 * 收集浏览器/Canvas/WebGL 等可识别特征，生成 64 位 hex 哈希
 * 注意：非加密用途，可被篡改，仅用于风控辅助/匿名 ID
 */

export function simpleStringHash(str: string): string {
  let h1 = 5381;
  let h2 = 2166136261;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    h1 = ((h1 << 5) + h1) ^ char;
    h2 ^= char;
    h2 = Math.imul(h2, 16777619);
  }

  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

function longHash(str: string): string {
  const parts: string[] = [];
  let input = str;
  for (let i = 0; i < 4; i++) {
    const hash = simpleStringHash(input + i.toString());
    parts.push(hash);
    input = hash + str;
  }
  return parts.join('');
}

export function getBrowserFingerprint(): string {
  if (typeof window === 'undefined') return '';

  const features = [
    navigator.userAgent,
    `${screen.width}x${screen.height}`,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.language,
    navigator.platform,
    navigator.hardwareConcurrency || 0,
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 0,
  ];

  return longHash(features.join('|'));
}

export function getDeviceId(storageKey = 'device_id'): string {
  if (typeof window === 'undefined') return '';

  let deviceId = localStorage.getItem(storageKey);
  if (!deviceId) {
    const fingerprint = getBrowserFingerprint();
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    deviceId = longHash(`${fingerprint}-${timestamp}-${random}`);
    localStorage.setItem(storageKey, deviceId);
  }
  return deviceId;
}

export function generateAnonymousUserId(): string {
  const deviceId = getDeviceId();
  const timestamp = Date.now();
  return `anon_${deviceId.substring(0, 16)}_${timestamp}`;
}

export function clearDeviceId(storageKey = 'device_id'): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(storageKey);
}

export function getCanvasFingerprint(): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') return '';

  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = 200;
    canvas.height = 50;

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Browser Fingerprint', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Browser Fingerprint', 4, 17);

    const dataUrl = canvas.toDataURL();
    return simpleStringHash(dataUrl);
  } catch {
    return '';
  }
}

export function getWebGLFingerprint(): string {
  if (typeof window === 'undefined' || typeof document === 'undefined') return '';

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return '';

    const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return '';

    const vendor = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

    return simpleStringHash(`${vendor}~${renderer}`);
  } catch {
    return '';
  }
}

export function getComprehensiveFingerprint(): string {
  const browserFingerprint = getBrowserFingerprint();
  const canvasFingerprint = getCanvasFingerprint();
  const webglFingerprint = getWebGLFingerprint();

  const combined = [browserFingerprint, canvasFingerprint, webglFingerprint]
    .filter(Boolean)
    .join('|');

  return longHash(combined);
}
