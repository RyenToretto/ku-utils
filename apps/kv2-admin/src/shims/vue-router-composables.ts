/**
 * vue-router@3 无官方 composables；供从 vue-router / vue-router/composables 导入的代码使用。
 */
import { getCurrentInstance, type ComponentInternalInstance } from 'vue';
import type VueRouter from 'vue-router';
import type { Route } from 'vue-router';

function getProxy(): Vue {
  const inst = getCurrentInstance() as ComponentInternalInstance | null;
  const proxy = inst?.proxy as Vue | undefined;
  if (!proxy) {
    throw new Error('vue-router composable 必须在 setup() 内调用');
  }
  return proxy;
}

export function useRoute(): Route {
  return getProxy().$route;
}

export function useRouter(): VueRouter {
  return getProxy().$router;
}

export function onBeforeRouteLeave(
  guard: (to: Route, from: Route, next: (v?: unknown) => void) => void,
) {
  const proxy = getProxy();
  // Vue Router 3：组件 beforeRouteLeave
  const options = (proxy.$options || {}) as Record<string, unknown>;
  const prev = options.beforeRouteLeave as typeof guard | Array<typeof guard> | undefined;
  if (Array.isArray(prev)) {
    prev.push(guard);
  } else if (prev) {
    options.beforeRouteLeave = [prev, guard];
  } else {
    options.beforeRouteLeave = guard;
  }
}

export function onBeforeRouteUpdate(
  guard: (to: Route, from: Route, next: (v?: unknown) => void) => void,
) {
  const proxy = getProxy();
  const options = (proxy.$options || {}) as Record<string, unknown>;
  const prev = options.beforeRouteUpdate as typeof guard | Array<typeof guard> | undefined;
  if (Array.isArray(prev)) {
    prev.push(guard);
  } else if (prev) {
    options.beforeRouteUpdate = [prev, guard];
  } else {
    options.beforeRouteUpdate = guard;
  }
}
