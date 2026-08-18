import { getCurrentScope, onScopeDispose, ref } from 'vue';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onMessage?: (data: unknown) => void;
  onError?: (error: Event) => void;
}

export function useWebSocket(url: string, options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnect = true,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
    onMessage,
    onError,
  } = options;

  const data = ref<unknown>(null);
  const status = ref<'connecting' | 'open' | 'closed'>('closed');
  let ws: WebSocket | null = null;
  let reconnectAttempts = 0;

  function connect() {
    if (typeof WebSocket === 'undefined') return;
    status.value = 'connecting';
    ws = new WebSocket(url);

    ws.onopen = () => {
      status.value = 'open';
      reconnectAttempts = 0;
    };

    ws.onmessage = (event) => {
      try {
        data.value = JSON.parse(event.data);
      } catch {
        data.value = event.data;
      }
      onMessage?.(data.value);
    };

    ws.onerror = (event) => {
      onError?.(event);
    };

    ws.onclose = () => {
      status.value = 'closed';
      if (reconnect && reconnectAttempts < maxReconnectAttempts) {
        reconnectAttempts++;
        setTimeout(connect, reconnectInterval);
      }
    };
  }

  function send(payload: unknown) {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(typeof payload === 'string' ? payload : JSON.stringify(payload));
    }
  }

  function close() {
    reconnectAttempts = maxReconnectAttempts;
    ws?.close();
  }

  if (autoConnect) connect();

  if (getCurrentScope()) {
    onScopeDispose(() => close());
  }

  return { data, status, send, close, connect };
}
