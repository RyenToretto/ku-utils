# @ku-utils/ui-vue2

> Vue 2 业务组件库（维护模式，新项目请使用 `@ku-utils/ui`）。

## 安装

```bash
pnpm add @ku-utils/ui-vue2
```

## 组件

`DuButton` · `DuEmpty` · `DuStatusTag`

## 使用

```js
import { install } from '@ku-utils/ui-vue2';
import '@ku-utils/ui-vue2/style';

Vue.use(install);
```

```vue
<template>
  <DuButton type="primary">提交</DuButton>
</template>
```

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
