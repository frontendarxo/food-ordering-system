import type { IncomingMessage } from 'http';
import type { Server as HttpServer } from 'http';
import type { WebSocket } from 'ws';
import { WebSocketServer } from 'ws';
import redisClient from '../utils/redis.js';
import { getOrdersChannel } from '../services/dashboardEvents.js';
import { getWsUser } from './parseAuth.js';

export interface DashboardUpdateMessage {
  type: 'dashboard_update';
  event: 'order_created' | 'order_status_updated';
}

function createMessage(payload: DashboardUpdateMessage): string {
  return JSON.stringify(payload);
}

export function attachWebSocket(httpServer: HttpServer): void {
  const wss = new WebSocketServer({ noServer: true });

  httpServer.on('upgrade', (request, socket, head) => {
    const url = new URL(request.url ?? '', `http://${request.headers.host}`);
    if (url.pathname !== '/ws') {
      socket.destroy();
      return;
    }
    const user = getWsUser(request);
    if (!user || (user.role !== 'admin' && user.role !== 'worker')) {
      socket.destroy();
      return;
    }
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request, user);
    });
  });

  wss.on('connection', (ws: WebSocket, _request: IncomingMessage, user: { role: string; location?: string }) => {
    const send = (msg: DashboardUpdateMessage) => {
      try {
        if (ws.readyState === 1) ws.send(createMessage(msg));
      } catch {
        // ignore
      }
    };

    const onRedisMessage = (raw: string) => {
      try {
        const event = JSON.parse(raw) as { type: string; location?: string };
        if (event.type === 'order_created' || event.type === 'order_status_updated') {
          if (user.role === 'admin') {
            send({ type: 'dashboard_update', event: event.type });
          } else if (user.role === 'worker' && user.location && event.location === user.location) {
            send({ type: 'dashboard_update', event: event.type });
          }
        }
      } catch {
        // ignore
      }
    };

    const channel = getOrdersChannel();
    const subscriber = redisClient.duplicate();

    (async () => {
      try {
        if (!subscriber.isOpen) await subscriber.connect();
        await subscriber.subscribe(channel, onRedisMessage);
      } catch {
        // ignore
      }
    })();

    ws.on('close', () => {
      subscriber.quit().catch(() => {});
    });
  });

  wss.on('error', () => {});
}
