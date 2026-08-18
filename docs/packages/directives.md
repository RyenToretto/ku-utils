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

具体绑定值与修饰符以源码与类型为准。
