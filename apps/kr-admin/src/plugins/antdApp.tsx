import { App, Modal, message as staticMessage, notification as staticNotification } from 'antd';

type AppApi = ReturnType<typeof App.useApp>;

let appApi: AppApi | null = null;

/**
 * 挂在 antd `<App>` 内，把带主题上下文的 message / modal / notification 注册给非组件代码（axios、列表回调）。
 * 静态方法无法消费 ConfigProvider 主题（暗色等），且 React 19 下需经此通道渲染。
 */
export function AntdAppBridge() {
  appApi = App.useApp();
  return null;
}

function delegate<T extends object>(pick: (api: AppApi) => T, fallback: T): T {
  return new Proxy(fallback, {
    get(_target, key) {
      const source = appApi ? pick(appApi) : fallback;
      return Reflect.get(source, key);
    },
  });
}

/** App 挂载前（bootstrap 拉用户信息失败等）回落到静态实现 */
export const message: AppApi['message'] = delegate((api) => api.message, staticMessage);
export const modal: AppApi['modal'] = delegate(
  (api) => api.modal,
  Modal as unknown as AppApi['modal'],
);
export const notification: AppApi['notification'] = delegate(
  (api) => api.notification,
  staticNotification,
);
