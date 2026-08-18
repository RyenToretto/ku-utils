import { getRealType } from './is';

type AnyObj = Record<string, unknown>;

/**
 * 将源对象的指定属性扩展到目标对象
 * 函数自动 bind 上下文，方便构建 facade
 */
export function doExtend(
  targetObj: AnyObj,
  sourceObj: AnyObj,
  key: string,
  context?: unknown,
): void {
  if (!sourceObj || !Object.prototype.hasOwnProperty.call(sourceObj, key)) return;
  const value = sourceObj[key];
  if (typeof value === 'function') {
    targetObj[key] = (value as (...args: unknown[]) => unknown).bind(context || sourceObj);
  } else {
    targetObj[key] = value;
  }
}

/**
 * 批量扩展属性
 */
export function doExtendAll(
  targetObj: AnyObj,
  sourceObj: AnyObj,
  keys: string[],
  context?: unknown,
): void {
  for (const key of keys) {
    doExtend(targetObj, sourceObj, key, context);
  }
}

function isPlainObject(val: unknown): val is AnyObj {
  if (val === null || typeof val !== 'object') return false;
  const proto = Object.getPrototypeOf(val);
  return proto === null || proto === Object.prototype;
}

/**
 * 深合并：以 defaultObj 填充 targetObj 中 null/undefined 的字段
 * 不修改原对象
 */
export function deepMerge<T extends AnyObj>(targetObj: T, defaultObj: Partial<T>): T {
  if (!isPlainObject(defaultObj)) return targetObj;
  if (!isPlainObject(targetObj)) return targetObj;

  const merge = (target: AnyObj, source: AnyObj): AnyObj => {
    const result: AnyObj = { ...target };
    for (const key of Object.keys(source)) {
      const sv = source[key];
      const tv = result[key];
      if (tv === null || tv === undefined) {
        result[key] = sv;
      } else if (isPlainObject(tv) && isPlainObject(sv)) {
        result[key] = merge(tv, sv);
      }
    }
    return result;
  };

  return merge(targetObj as AnyObj, defaultObj as AnyObj) as T;
}

/**
 * 在元组数组中按 code 查映射值
 *   matchMap('A', [['A', 1], ['B', 2]]) // 1
 */
export function matchMap<C, V>(code: C, data: Array<[C, V]> = []): C | V {
  const valid = data.every((v) => getRealType(v) === 'array');
  if (!valid) return code;
  const matched = data.find((v) => v[0] === code);
  return matched ? matched[1] : code;
}

/**
 * 在普通对象映射中按 code 查展示值，未命中时返回 fallback 或原 code。
 */
export function mapKeyToValue<V>(
  code: PropertyKey,
  map: Partial<Record<PropertyKey, V>> = {},
  fallback?: unknown,
): PropertyKey | V | unknown {
  if (!map || typeof map !== 'object') return fallback ?? code;
  return Object.prototype.hasOwnProperty.call(map, code) ? map[code] : (fallback ?? code);
}

/**
 * 对象数组按键匹配，返回 targetKey 字段
 */
export function matchObjProperty<C>(
  code: C,
  sourceKey = '',
  targetKey = '',
  data: AnyObj[] = [],
): unknown {
  const valid = data.every((v) => getRealType(v) === 'object');
  if (!valid) return code;
  const matched = data.find((v) => v[sourceKey] === code);
  return matched ? matched[targetKey] : code;
}
