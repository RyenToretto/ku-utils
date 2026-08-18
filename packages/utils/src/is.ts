export const isClient = typeof window !== 'undefined';
export const isServer = !isClient;

export function isString(val: unknown): val is string {
  return typeof val === 'string';
}

export function isNumber(val: unknown): val is number {
  return typeof val === 'number' && !Number.isNaN(val);
}

export function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean';
}

export function isObject(val: unknown): val is Record<string, unknown> {
  return val !== null && typeof val === 'object' && !Array.isArray(val);
}

export function isArray(val: unknown): val is unknown[] {
  return Array.isArray(val);
}

export function isFunction(val: unknown): val is (...args: unknown[]) => unknown {
  return typeof val === 'function';
}

export function isNullish(val: unknown): val is null | undefined {
  return val === null || val === undefined;
}

export function isEmpty(val: unknown): boolean {
  if (isNullish(val)) return true;
  if (isString(val) || isArray(val)) return val.length === 0;
  if (isObject(val)) return Object.keys(val).length === 0;
  return false;
}

export function isPhone(val: string): boolean {
  return /^1[3-9]\d{9}$/.test(val);
}

export function isEmail(val: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

export function isUrl(val: string): boolean {
  try {
    new URL(val);
    return true;
  } catch {
    return false;
  }
}

export function isIdCard(val: string): boolean {
  return /^\d{17}[\dXx]$/.test(val);
}

const toString = Object.prototype.toString;

export type RealType =
  | 'boolean'
  | 'number'
  | 'string'
  | 'function'
  | 'array'
  | 'date'
  | 'regExp'
  | 'undefined'
  | 'null'
  | 'object'
  | 'asyncFunction'
  | 'window'
  | 'set'
  | 'map'
  | 'symbol'
  | 'promise';

export function getRealType(val: unknown): RealType | string {
  const map: Record<string, RealType> = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object AsyncFunction]': 'asyncFunction',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object',
    '[object Window]': 'window',
    '[object Set]': 'set',
    '[object Map]': 'map',
    '[object Symbol]': 'symbol',
    '[object Promise]': 'promise',
  };
  const tag = toString.call(val);
  return map[tag] ?? tag.slice(8, -1).toLowerCase();
}

export function isDefined<T>(val: T | undefined): val is T {
  return val !== undefined;
}

export function safeParseJson<T = unknown>(val: unknown): T | unknown {
  if (!val) return val;
  try {
    return JSON.parse(val as string) as T;
  } catch {
    return val;
  }
}

export function isJSON(val: unknown): boolean {
  if (!val || typeof val !== 'string') return false;
  try {
    JSON.parse(val);
    return true;
  } catch {
    return false;
  }
}

export function isValidNumber(val: unknown): boolean {
  if (typeof val === 'number') return !Number.isNaN(val);
  if (typeof val !== 'string') return false;
  return !Number.isNaN(parseFloat(val)) && !Number.isNaN(Number(val));
}

export function isPromise<T = unknown>(val: unknown): val is Promise<T> {
  return (
    !!val &&
    (typeof val === 'object' || typeof val === 'function') &&
    typeof (val as { then?: unknown }).then === 'function' &&
    typeof (val as { catch?: unknown }).catch === 'function'
  );
}

export function isAsyncFunction<T = unknown>(val: unknown): val is () => Promise<T> {
  return toString.call(val) === '[object AsyncFunction]';
}

export function isWindow(val: unknown): val is Window {
  return typeof window !== 'undefined' && toString.call(val) === '[object Window]';
}

export function isAllSame(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;

  const ta = getRealType(a);
  const tb = getRealType(b);
  if (ta !== tb) return false;

  if (ta === 'date') return (a as Date).getTime() === (b as Date).getTime();
  if (ta === 'regExp') return String(a) === String(b);

  if (ta === 'array') {
    const arrA = a as unknown[];
    const arrB = b as unknown[];
    if (arrA.length !== arrB.length) return false;
    return arrA.every((v, i) => isAllSame(v, arrB[i]));
  }

  if (ta === 'set') {
    const setA = a as Set<unknown>;
    const setB = b as Set<unknown>;
    if (setA.size !== setB.size) return false;
    for (const v of setA) {
      if (!setB.has(v)) return false;
    }
    return true;
  }

  if (ta === 'map') {
    const mapA = a as Map<unknown, unknown>;
    const mapB = b as Map<unknown, unknown>;
    if (mapA.size !== mapB.size) return false;
    for (const [k, v] of mapA) {
      if (!mapB.has(k) || !isAllSame(v, mapB.get(k))) return false;
    }
    return true;
  }

  if (ta === 'object') {
    const objA = a as Record<string, unknown>;
    const objB = b as Record<string, unknown>;
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;
    return keysA.every((k) => isAllSame(objA[k], objB[k]));
  }

  return false;
}
