# Hooks 组合式函数

`@ku-utils/hooks` 提供面向 Vue 3 的组合式 API，与 `@vue/composition-api` 无依赖，需 Vue `^3.4`。

## 安装

```bash
pnpm add @ku-utils/hooks vue
```

## 使用示例

```vue
<script setup lang="ts">
import { useClipboard, usePagination } from '@ku-utils/hooks';

const pager = usePagination(async ({ page, pageSize }) => {
  return { total: 100, list: [] };
});

const { copy, copied } = useClipboard();
</script>
```

## 导出清单

| 名称            | 说明                         |
| --------------- | ---------------------------- |
| `useLoading`    | 加载态封装                   |
| `useRequest`    | 请求与数据状态               |
| `usePagination` | 分页状态                     |
| `useClipboard`  | 剪贴板读写                   |
| `useCountdown`  | 倒计时                       |
| `useEventBus`   | 简易事件总线                 |
| `useMediaQuery` | 媒体查询                     |
| `useBreakpoint` | 断点（基于 `useMediaQuery`） |
| `useFullscreen` | 全屏 API                     |
| `useInterval`   | 定时器封装                   |
| `useWebSocket`  | WebSocket 连接               |

具体参数与返回值以包内类型定义为准。
