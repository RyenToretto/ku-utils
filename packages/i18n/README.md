# @ku-utils/i18n

> 多语言工具（Vue 响应式），支持浏览器语言检测。

## 安装

```bash
pnpm add @ku-utils/i18n
```

## 使用

```ts
import { createI18n, setGlobalI18n, useI18n } from '@ku-utils/i18n';

const i18n = createI18n({ locale: 'zh-CN', messages });
setGlobalI18n(i18n);

// 在组件中
const { t } = useI18n();
```

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
