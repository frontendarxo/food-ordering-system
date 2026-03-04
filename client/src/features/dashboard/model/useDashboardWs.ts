import { useEffect, useRef, useCallback, useState } from 'react';
import { WS_URL } from '../../../api/config';
import type { DashboardUpdateMessage } from '../api/types';

const RECONNECT_DELAY_MS = 3000;
const MAX_RECONNECT_DELAY_MS = 30000;

export function useDashboardWs(onUpdate: () => void, enabled: boolean) {
  const [connected, setConnected] = useState(false);
  const onUpdateRef = useRef(onUpdate);
  const reconnectDelayRef = useRef(RECONNECT_DELAY_MS);
  const wsRef = useRef<WebSocket | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  onUpdateRef.current = onUpdate;

  const connect = useCallback(() => {
    if (!enabled) return;
    setConnected(false);
    try {
      const ws = new WebSocket(`${WS_URL}/ws`);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as DashboardUpdateMessage;
          if (msg.type === 'dashboard_update') {
            onUpdateRef.current();
          }
        } catch {
          // ignore
        }
      };

      ws.onclose = () => {
        wsRef.current = null;
        setConnected(false);
        if (!enabled) return;
        timeoutRef.current = setTimeout(() => {
          reconnectDelayRef.current = Math.min(
            reconnectDelayRef.current + RECONNECT_DELAY_MS,
            MAX_RECONNECT_DELAY_MS
          );
          connect();
        }, reconnectDelayRef.current);
      };

      ws.onopen = () => {
        reconnectDelayRef.current = RECONNECT_DELAY_MS;
        setConnected(true);
      };
    } catch {
      setConnected(false);
      if (enabled) {
        timeoutRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
      }
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setConnected(false);
    }
    connect();
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setConnected(false);
    };
  }, [connect, enabled]);
  return { connected };
}
