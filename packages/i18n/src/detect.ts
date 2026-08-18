export function detectBrowserLocale(supportedLocales: string[] = ['zh-CN', 'en-US']): string {
  if (typeof navigator === 'undefined') return supportedLocales[0];

  const browserLang =
    navigator.language || (navigator as unknown as { userLanguage: string }).userLanguage;
  if (!browserLang) return supportedLocales[0];

  const exact = supportedLocales.find((l) => l === browserLang);
  if (exact) return exact;

  const prefix = browserLang.split('-')[0];
  const partial = supportedLocales.find((l) => l.startsWith(prefix));
  return partial || supportedLocales[0];
}
