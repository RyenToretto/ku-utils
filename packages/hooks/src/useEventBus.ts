import type { EventCallback, EventBusInstance } from './types';

class EventBus<
  EventMap extends Record<string, any> = Record<string, any>,
> implements EventBusInstance<EventMap> {
  private eventsMap = new Map<string, Set<EventCallback>>();

  on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): () => void {
    if (!this.eventsMap.has(event as string)) {
      this.eventsMap.set(event as string, new Set());
    }
    const listeners = this.eventsMap.get(event as string)!;
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.eventsMap.delete(event as string);
      }
    };
  }

  emit<K extends keyof EventMap>(event: K, data?: EventMap[K]): void {
    const listeners = this.eventsMap.get(event as string);
    if (!listeners) return;
    Array.from(listeners).forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Event callback error for "${String(event)}":`, error);
      }
    });
  }

  off<K extends keyof EventMap>(event: K, callback?: EventCallback<EventMap[K]>): void {
    const listeners = this.eventsMap.get(event as string);
    if (!listeners) return;
    if (callback) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.eventsMap.delete(event as string);
      }
    } else {
      this.eventsMap.delete(event as string);
    }
  }

  once<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void {
    const onceCallback = (data: any) => {
      callback(data);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  clear(): void {
    this.eventsMap.clear();
  }

  getListenerCount(event?: keyof EventMap): number {
    if (event) {
      return this.eventsMap.get(event as string)?.size || 0;
    }
    return Array.from(this.eventsMap.values()).reduce(
      (total, listeners) => total + listeners.size,
      0,
    );
  }
}

/**
 * 创建一个全新的事件总线实例（不走 scope 缓存）。
 * SSR 环境下返回 no-op，避免在服务端污染状态。
 */
export function createEventBus<
  EventMap extends Record<string, any> = Record<string, any>,
>(): EventBusInstance<EventMap> {
  if (typeof window === 'undefined') {
    return {
      on: () => () => void 0,
      emit: () => void 0,
      off: () => void 0,
      once: () => void 0,
      clear: () => void 0,
      getListenerCount: () => 0,
    } as EventBusInstance<EventMap>;
  }
  return new EventBus<EventMap>();
}

const busCache = new Map<string, EventBusInstance<any>>();

/**
 * 按 scope 复用事件总线实例。
 * 同一个 scope 多次调用拿到的是同一个 bus；不传 scope 则用 'default'。
 * SSR 环境下每次返回独立的 no-op 实例（不进缓存）。
 */
export function useEventBus<EventMap extends Record<string, any> = Record<string, any>>(
  scope = 'default',
): EventBusInstance<EventMap> {
  if (typeof window === 'undefined') {
    return createEventBus<EventMap>();
  }

  if (!busCache.has(scope)) {
    busCache.set(scope, createEventBus<EventMap>());
  }
  return busCache.get(scope)! as EventBusInstance<EventMap>;
}
