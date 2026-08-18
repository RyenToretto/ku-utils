# @ku-utils/directives

> Vue 3 自定义指令集合。

## 安装

```bash
pnpm add @ku-utils/directives
```

## 可用指令

`vLoading` · `vPermission` · `vDebounce` · `vCopy` · `vClickOutside` · `vLazyLoad` · `vLongpress` · `vTooltip`

## 使用

按需导入：

```ts
import { vLoading } from '@ku-utils/directives';
```

全局注册：

```ts
import { installDirectives } from '@ku-utils/directives';
app.use(installDirectives);
```

## 安装源

发布于 npmjs.org，直接 `pnpm add` 即可。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
