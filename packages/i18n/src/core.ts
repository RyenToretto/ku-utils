import { type ComputedRef, type Ref, computed, ref } from 'vue';

export interface I18nOptions {
  locale: string;
  fallbackLocale?: string;
  messages: Record<string, Record<string, unknown>>;
}

export interface I18nInstance {
  locale: Ref<string>;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLocale: (locale: string) => void;
  addMessages: (locale: string, messages: Record<string, unknown>) => void;
}

export interface UseI18nReturn {
  locale: Ref<string>;
  t: (key: string, params?: Record<string, string | number>) => string;
  tc: (key: string, params?: Record<string, string | number>) => ComputedRef<string>;
  setLocale: (locale: string) => void;
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function createI18n(options: I18nOptions): I18nInstance {
  const locale = ref(options.locale);
  const fallbackLocale = options.fallbackLocale || 'zh-CN';
  const messages = { ...options.messages };

  function t(key: string, params?: Record<string, string | number>): string {
    const currentLocale = locale.value;
    const msg =
      getNestedValue(messages[currentLocale] || {}, key) ??
      getNestedValue(messages[fallbackLocale] || {}, key);

    if (typeof msg !== 'string') return key;

    if (!params) return msg;

    return msg.replace(/\{(\w+)\}/g, (_, k) => {
      return params[k] !== undefined ? String(params[k]) : `{${k}}`;
    });
  }

  function setLocale(newLocale: string) {
    locale.value = newLocale;
  }

  function addMessages(loc: string, newMessages: Record<string, unknown>) {
    messages[loc] = { ...messages[loc], ...newMessages };
  }

  return { locale, t, setLocale, addMessages };
}

let globalI18n: I18nInstance | null = null;

export function setGlobalI18n(instance: I18nInstance) {
  globalI18n = instance;
}

export function useI18n(): UseI18nReturn {
  if (!globalI18n) {
    throw new Error('[ku-utils/i18n] 请先调用 createI18n() 并通过 setGlobalI18n() 注册全局实例');
  }

  const { locale, t, setLocale } = globalI18n;

  function tc(key: string, params?: Record<string, string | number>): ComputedRef<string> {
    return computed(() => t(key, params));
  }

  return { locale, t, setLocale, tc };
}
