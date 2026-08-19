import { createI18n, setGlobalI18n } from '@ku-utils/i18n';

export default defineNuxtPlugin(() => {
  const i18n = createI18n({
    locale: 'zh-CN',
    fallbackLocale: 'zh-CN',
    messages: {
      'zh-CN': {
        demo: {
          hello: '你好，{name}',
          switch: '切换为英文',
        },
      },
      'en-US': {
        demo: {
          hello: 'Hello, {name}',
          switch: 'Switch to Chinese',
        },
      },
    },
  });
  setGlobalI18n(i18n);

  if (import.meta.client) {
    localStorage.setItem('ku_utils_user_permissions', JSON.stringify(['pg:ok']));
  }
});
