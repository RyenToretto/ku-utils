const UUID_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');

function readStorage(key: string): string {
  if (typeof window === 'undefined' || !key) return '';
  try {
    return window.localStorage.getItem(key) || '';
  } catch {
    return '';
  }
}

function writeStorage(key: string, value: string): void {
  if (typeof window === 'undefined' || !key) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore
  }
}

/**
 * 生成指定长度的随机 UUID
 * @example
 *   doUUID() // 32 位
 *   doUUID(16) // 16 位
 */
export function doUUID(length = 32, radix = 62): string {
  const chars = UUID_CHARS;
  const uuid: string[] = [];
  let r: number;
  let i: number;

  radix = radix || chars.length;

  if (length) {
    i = -1;
    while (++i < length) {
      uuid[i] = chars[0 | (Math.random() * radix)];
    }
  } else {
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    i = -1;
    while (++i < 36) {
      if (!uuid[i]) {
        r = 0 | (Math.random() * 16);
        uuid[i] = chars[i === 19 ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join('');
}

/**
 * 生成 UUID v4 风格字符串，可选 localStorage 持久化
 *
 * @param useNew - true 强制重新生成；false 时若 sKey 已有值则复用
 * @param sKey - localStorage 键名
 */
export function generateUUID(useNew = false, sKey = '__uuid__'): string {
  if (!useNew && sKey) {
    const existed = readStorage(sKey);
    if (existed) return existed;
  }

  let timeStick = new Date().getTime();
  const newId = 'xxxxxxxxxxxxxxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = ((timeStick + Math.random() * 16) % 16) | 0;
    timeStick = Math.floor(timeStick / 16);
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });

  if (sKey) writeStorage(sKey, newId);
  return newId;
}

/**
 * 包名 → 存储键
 *   ktk('myApp') // '__myApp__'
 */
export function ktk(pkg: string): string {
  return `__${pkg || 'ktk'}__`;
}

/**
 * 获取或生成与包名关联的持久化 UUID
 */
export function uuid(pkg: string): string {
  return generateUUID(false, ktk(pkg));
}

/**
 * 获取或设置与包名关联的 Token，未设置时回退到 uuid(pkg)
 */
export function useToken(pkg: string, tk = ''): string {
  if (typeof window === 'undefined') return tk || '';
  if (tk) writeStorage(ktk(pkg), tk);
  const newToken = tk || readStorage(ktk(pkg));
  return newToken || uuid(pkg);
}

/**
 * 版本号字符串拼成数字串
 *   makeVersionCode('1.2.3') // '10203'
 *   makeVersionCode('1.0.1') // '10001'
 */
export function makeVersionCode(vn: string): string {
  if (!vn) return vn;
  return vn.split('.').join('0');
}
