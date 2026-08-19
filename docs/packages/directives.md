# Directives 指令

`@ku-utils/directives` 提供一组 Vue 3 自定义指令，并导出 `installDirectives` 用于一次性注册。

## 安装

```bash
pnpm add @ku-utils/directives vue
```

## 使用示例

```typescript
import { createApp } from 'vue';
import { installDirectives } from '@ku-utils/directives';
import App from './App.vue';

const app = createApp(App);
installDirectives(app);
app.mount('#app');
```

## 导出清单

| 名称                | 说明                    |
| ------------------- | ----------------------- |
| `vPermission`       | 权限控制显示/交互       |
| `vLoading`          | 元素加载态              |
| `vClickOutside`     | 点击外部关闭            |
| `vCopy`             | 一键复制                |
| `vDebounce`         | 事件防抖                |
| `vLazyLoad`         | 懒加载（如图片）        |
| `vLongpress`        | 长按                    |
| `installDirectives` | 在 `App` 上注册上述指令 |

`vLoading` / `vTooltip` 的颜色、圆角、层级走 `@ku-utils/skin` 的 `--ku-*`（带 lark 浅色 fallback）。应用侧建议 `import '@ku-utils/skin'`，不引入时指令仍按默认皮肤显示。
