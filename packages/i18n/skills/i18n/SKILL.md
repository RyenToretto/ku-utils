---
name: i18n
description: 使用 @ku-utils/i18n 实现多语言国际化（createI18n、useI18n、detectBrowserLocale）。当项目需要支持多语言时使用。
---

# @ku-utils/i18n Skill

轻量 i18n 核心，支持嵌套 key、参数插值、浏览器语言检测、消息合并。

## 安装

```bash
npm install @ku-utils/i18n
```

## 初始化

```ts
// src/plugins/i18n.ts
import { createI18n, detectBrowserLocale } from '@ku-utils/i18n';

export const i18n = createI18n({
  locale: detectBrowserLocale(['zh-CN', 'en']) || 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': {
      common: {
        save: '保存',
        cancel: '取消',
        confirm: '确认',
        delete: '删除',
        search: '搜索',
      },
      user: {
        greeting: '你好，{name}！',
        loginSuccess: '登录成功',
      },
    },
    en: {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        confirm: 'Confirm',
        delete: 'Delete',
        search: 'Search',
      },
      user: {
        greeting: 'Hello, {name}!',
        loginSuccess: 'Login successful',
      },
    },
  },
});

export const { t, setLocale, locale } = i18n;
```

## Vue 3 全局注入

```ts
// main.ts
import { setGlobalI18n } from '@ku-utils/i18n';
import { i18n } from '@/plugins/i18n';

setGlobalI18n(i18n);
app.config.globalProperties.$t = i18n.t;
```

## Vue 3 Composable

```ts
// 在 setup() 中使用
import { useI18n } from '@ku-utils/i18n';

const { t, tc, locale, setLocale } = useI18n();

// 翻译
t('common.save'); // => '保存'
t('user.greeting', { name: '张三' }); // => '你好，张三！'

// 响应式翻译（computed，locale 变化自动更新）
const label = tc('common.save'); // ComputedRef<string>

// 切换语言
setLocale('en');
```

## 在 Vue 2 中使用（直接用 i18n 实例）

```js
// Vue 2 没有 Composition API，直接使用 i18n 实例
import { t, setLocale } from '@/plugins/i18n';

export default {
  computed: {
    saveLabel() {
      return t('common.save');
    },
  },
  methods: {
    switchToEnglish() {
      setLocale('en');
    },
  },
};
```

## 模块化 locale 文件 + mergeMessages

```ts
// src/locales/zh-CN/common.ts
export default {
  save: '保存',
  cancel: '取消',
};

// src/locales/zh-CN/user.ts
export default {
  greeting: '你好，{name}！',
};

// src/locales/zh-CN/index.ts
import { mergeMessages } from '@ku-utils/i18n';
import common from './common';
import user from './user';

export default mergeMessages({ common, user });
// => { common: { save: '保存', cancel: '取消' }, user: { greeting: '...' } }

// src/plugins/i18n.ts
import zhCN from '@/locales/zh-CN';
import en from '@/locales/en';

const i18n = createI18n({
  locale: 'zh-CN',
  messages: { 'zh-CN': zhCN, en: en },
});
```

## 浏览器语言检测

```ts
import { detectBrowserLocale } from '@ku-utils/i18n';

// 从 navigator.language 检测，匹配支持的语言列表
const locale = detectBrowserLocale(['zh-CN', 'en', 'ja']);
// navigator.language = 'zh-CN' → 'zh-CN'
// navigator.language = 'zh-TW' → 'zh-CN'（zh 前缀匹配）
// navigator.language = 'fr'    → undefined（无匹配，用 fallbackLocale）
```
