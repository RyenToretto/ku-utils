import { unref, type Ref } from 'vue';

import type { IntersectionCallback, IntersectionOptions } from './types';

interface IntersectionState {
  observer: IntersectionObserver | null;
  callbacks: Map<Element, IntersectionCallback>;
  initialized: boolean;
}

const stateMap = new Map<string, IntersectionState>();

function getOrCreateState(key: string, options: Required<IntersectionOptions>): IntersectionState {
  if (stateMap.has(key)) return stateMap.get(key)!;

  const state: IntersectionState = {
    observer: null,
    callbacks: new Map(),
    initialized: false,
  };

  if (typeof window !== 'undefined') {
    const vh = window.innerHeight || 800;
    const margin = Math.round(vh * options.rootMarginRatio);

    state.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const cb = state.callbacks.get(entry.target);
          if (cb) cb(entry.isIntersecting, entry);
        }
      },
      {
        threshold: options.threshold,
        rootMargin: `${margin}px 0px ${margin}px 0px`,
      },
    );
    state.initialized = true;
  }

  stateMap.set(key, state);
  return state;
}

export function useIntersection(options: IntersectionOptions = {}) {
  const { rootMarginRatio = 0.5, threshold = 0.1 } = options;

  const key = `${rootMarginRatio}-${threshold}`;
  const state = getOrCreateState(key, { rootMarginRatio, threshold });

  const observe = (element: Element | Ref<Element | undefined>, callback: IntersectionCallback) => {
    if (!state.observer) return;
    const el = unref(element);
    if (!el) return;
    state.callbacks.set(el, callback);
    state.observer.observe(el);
  };

  const unobserve = (element: Element | Ref<Element | undefined>) => {
    if (!state.observer) return;
    const el = unref(element);
    if (!el) return;
    state.observer.unobserve(el);
    state.callbacks.delete(el);
  };

  return { observe, unobserve };
}
