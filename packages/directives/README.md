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

## AI Skill

安装后自动同步至 `.cursor/skills/directives/SKILL.md`，在 Cursor 对话中可按需调用：

> 使用 @ku-utils/directives 中的 Vue 3 自定义指令（v-permission、v-loading、v-copy、v-debounce 等）。当需要权限控制、加载状态、复制、防抖、懒加载等功能时使用。

---

详细文档请参考 [ku-utils 文档站](../../docs/)
