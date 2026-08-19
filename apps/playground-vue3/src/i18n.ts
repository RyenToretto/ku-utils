import { createI18n, setGlobalI18n } from '@ku-utils/i18n';

export const playgroundI18n = createI18n({
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

setGlobalI18n(playgroundI18n);
