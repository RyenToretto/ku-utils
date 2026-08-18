import { deepClone } from './function';

type EnvValue = string | boolean | number | null | undefined;
type EnvRecord = Record<string, EnvValue>;

function coerceValue(raw: unknown): EnvValue {
  const realValue =
    typeof raw === 'string' && raw.replace ? raw.replace(/\\n/g, '\n') : (raw as EnvValue);

  if (realValue === 'true' || realValue === 'false') return realValue === 'true';
  if (typeof realValue === 'string' && /^\d+$/.test(realValue)) return Number(realValue);
  if (realValue === 'null') return null;
  if (realValue === 'undefined') return undefined;
  return realValue as EnvValue;
}

/**
 * 读取并类型化 Vite 风格的 import.meta.env
 *   "true" / "false" → boolean
 *   纯数字字符串 → number
 *   "null" / "undefined" → null / undefined
 *   含 \n 转义 → 真实换行
 */
export function getDoEnv(): EnvRecord {
  let curEnv: Record<string, unknown> = {};
  try {
    const meta = (import.meta as { env?: Record<string, unknown> } | undefined) ?? {};
    curEnv = meta.env || {};
  } catch {
    curEnv = {};
  }
  const doEnv = deepClone(curEnv) as EnvRecord;

  Object.entries(curEnv).forEach(([key, value]) => {
    doEnv[key] = coerceValue(value);
  });

  return doEnv;
}

/**
 * 解析任意 env 对象，将字符串值转换为对应 JS 类型
 * 适用于 Vite loadEnv 的输出
 */
export function parseEnv<T extends EnvRecord = EnvRecord>(env: Record<string, string>): T {
  const result = deepClone(env) as EnvRecord;
  for (const [key, value] of Object.entries(env)) {
    result[key] = coerceValue(value);
  }
  return result as T;
}
