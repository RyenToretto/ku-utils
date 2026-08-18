export type EventCallback<T = any> = (data?: T) => void;

export interface EventBusInstance<EventMap extends Record<string, any> = Record<string, any>> {
  on<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): () => void;
  emit<K extends keyof EventMap>(event: K, data?: EventMap[K]): void;
  off<K extends keyof EventMap>(event: K, callback?: EventCallback<EventMap[K]>): void;
  once<K extends keyof EventMap>(event: K, callback: EventCallback<EventMap[K]>): void;
  clear(): void;
  getListenerCount(event?: keyof EventMap): number;
}

export interface IntersectionOptions {
  rootMarginRatio?: number;
  threshold?: number;
}

export type IntersectionCallback = (
  isIntersecting: boolean,
  entry: IntersectionObserverEntry,
) => void;
