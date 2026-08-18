---
name: hooks
description: 使用 @ku-utils/hooks 中的 Vue 3 Composables（useRequest、usePagination、useClipboard 等）。当需要处理异步请求、分页、剪贴板、定时器等场景时使用。
---

# @ku-utils/hooks Skill

Vue 3 组合式函数集合，内置 loading/error/cleanup。

## 安装

```bash
npm install @ku-utils/hooks
```

---

## useRequest — 异步请求

```ts
import { useRequest } from '@ku-utils/hooks';

// 基本用法
const { data, loading, error, execute, refresh } = useRequest((id: string) => getUserById(id));

// 立即执行
const { data: userList, loading } = useRequest(() => getUserList(), {
  immediate: true,
  initialData: [],
});

// 带回调
const { execute: createUser } = useRequest((form: CreateUserDto) => createUserApi(form), {
  onSuccess: (user) => {
    message.success('创建成功');
    router.push(`/users/${user.id}`);
  },
  onError: (err) => message.error(err.message),
});

await execute('user-123');
await refresh(); // 重试上次参数
```

---

## usePagination — 分页列表

```ts
import { usePagination } from '@ku-utils/hooks';

const { list, total, page, pageSize, loading, fetch, changePage, changePageSize, reset } =
  usePagination(({ page, pageSize }) => getUserList({ page, pageSize }), {
    defaultPage: 1,
    defaultPageSize: 10,
    pageSizes: [10, 20, 50],
  });

onMounted(() => fetch());
```

```html
<el-table
  :data="list"
  v-loading="loading"
/>
<el-pagination
  :current-page="page"
  :page-size="pageSize"
  :total="total"
  @current-change="changePage"
  @size-change="changePageSize"
/>
```

---

## useClipboard — 剪贴板

```ts
import { useClipboard } from '@ku-utils/hooks';

const { copy, copied, text } = useClipboard();

async function handleCopy(content: string) {
  const ok = await copy(content);
  if (ok) message.success('已复制');
}
```

---

## useLoading — loading 状态

```ts
import { useLoading } from '@ku-utils/hooks';

const { loading, wrap, start, stop } = useLoading();

// wrap 自动管理 loading 开关
const result = await wrap(() => fetchData());

// 手动控制
start();
try {
  await fetchData();
} finally {
  stop();
}
```

---

## useCountdown — 倒计时

```ts
import { useCountdown } from '@ku-utils/hooks';

// 返回：{ count, isActive, start, stop, reset }
// 注意：count（不是 remaining），isActive（不是 isRunning）
const { count, isActive, start, stop, reset } = useCountdown(60);

async function sendCode() {
  await sendSmsCode(phone.value);
  start(); // 从 60 开始倒计时
}
// count.value 从 60 递减到 0，isActive 自动更新
```

---

## useInterval — 定时器

```ts
import { useInterval } from '@ku-utils/hooks';

// 返回：{ isActive, start, stop }
// 注意：不是 { pause, resume }
const { isActive, start, stop } = useInterval(() => fetchStatus(), 5000);
// 组件卸载自动清理
```

---

## useStorage — 响应式存储

```ts
import { useStorage } from '@ku-utils/hooks';

// localStorage（默认）
const theme = useStorage('app-theme', 'light');
theme.value = 'dark'; // 自动同步到 localStorage

// sessionStorage
const token = useStorage('session-token', '', { storage: 'sessionStorage' });
```

---

## useDialogState — 弹窗状态

```ts
import { useDialogState } from '@ku-utils/hooks';

// 返回：{ visible, show, hide, toggle }
// 注意：方法名是 show/hide，不是 open/close
const { visible, show, hide, toggle } = useDialogState();
```

```html
<el-dialog :visible.sync="visible" />
<el-button @click="show">打开</el-button>
<el-button @click="hide">关闭</el-button>
```

---

## useWebSocket — WebSocket

```ts
import { useWebSocket } from '@ku-utils/hooks';

// status: 'connecting' | 'open' | 'closed'（小写，3 种状态）
const { status, data, send, close, connect } = useWebSocket('ws://api.example.com/ws', {
  reconnect: true,
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  onMessage: (msg) => console.log('收到消息:', msg),
});

watch(data, (msg) => processMessage(msg));
send(JSON.stringify({ type: 'ping' }));
```

---

## useBreakpoint — 响应式断点

```ts
import { useBreakpoint } from '@ku-utils/hooks';

// 返回：{ sm, md, lg, xl, xxl }（布尔 Ref，表示当前宽度是否达到该断点）
// 注意：不是 { isMobile, isTablet, isDesktop, current }
const { sm, md, lg, xl } = useBreakpoint();

// 判断移动端（小于 md 断点）
const isMobile = computed(() => !md.value);
```

如需设备类型检测（SSR 安全、含 UA 检测），使用 `useDeviceDetect`：

```ts
import { useDeviceDetect } from '@ku-utils/hooks';

const { isMobile } = useDeviceDetect();
```

---

## useFullscreen — 全屏

```ts
import { useFullscreen } from '@ku-utils/hooks';

const { isFullscreen, enter, exit, toggle } = useFullscreen(targetEl);
```

---

## useEventBus — 跨组件通信

```ts
import { createEventBus, useEventBus } from '@ku-utils/hooks';

// 方式一：createEventBus — 创建独立 bus（不走 scope 缓存，适合模块级单例）
export const userBus = createEventBus<{ 'user:updated': UserInfo }>();

// 发布
userBus.emit('user:updated', updatedUser);

// 订阅（EventBusInstance API：on/off/once/emit/clear）
const unsubscribe = userBus.on('user:updated', (user) => {
  console.log('用户已更新:', user);
});
// 手动取消订阅
unsubscribe();

// 方式二：useEventBus(scope?) — 按 scope 复用单例 bus（适合组件间共用）
// 注意：第一个参数是 scope 字符串，不是 bus 实例
const bus = useEventBus<{ 'theme:change': string }>('global');
bus.emit('theme:change', 'dark');
bus.on('theme:change', (theme) => applyTheme(theme));
```

---

## useFocusTrap — 焦点陷阱（无障碍）

```ts
import { useFocusTrap } from '@ku-utils/hooks';

const dialogRef = ref<HTMLElement | null>(null);

useFocusTrap(dialogRef, {
  escClose: () => emit('close'),
  autoFocus: true, // 自动聚焦第一个可聚焦元素
  restoreFocus: true, // 关闭后恢复焦点到打开前的元素
});
```
