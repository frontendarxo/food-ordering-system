var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { WebSocketServer } from 'ws';
import redisClient from '../utils/redis.js';
import { getOrdersChannel } from '../services/dashboardEvents.js';
import { getWsUser } from './parseAuth.js';
function createMessage(payload) {
    return JSON.stringify(payload);
}
export function attachWebSocket(httpServer) {
    const wss = new WebSocketServer({ noServer: true });
    httpServer.on('upgrade', (request, socket, head) => {
        var _a;
        const url = new URL((_a = request.url) !== null && _a !== void 0 ? _a : '', `http://${request.headers.host}`);
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
    wss.on('connection', (ws, _request, user) => {
        const send = (msg) => {
            try {
                if (ws.readyState === 1)
                    ws.send(createMessage(msg));
            }
            catch (_a) {
                // ignore
            }
        };
        const onRedisMessage = (raw) => {
            try {
                const event = JSON.parse(raw);
                if (event.type === 'order_created' || event.type === 'order_status_updated') {
                    if (user.role === 'admin') {
                        send({ type: 'dashboard_update', event: event.type });
                    }
                    else if (user.role === 'worker' && user.location && event.location === user.location) {
                        send({ type: 'dashboard_update', event: event.type });
                    }
                }
            }
            catch (_a) {
                // ignore
            }
        };
        const channel = getOrdersChannel();
        const subscriber = redisClient.duplicate();
        (() => __awaiter(this, void 0, void 0, function* () {
            try {
                if (!subscriber.isOpen)
                    yield subscriber.connect();
                yield subscriber.subscribe(channel, onRedisMessage);
            }
            catch (_a) {
                // ignore
            }
        }))();
        ws.on('close', () => {
            subscriber.quit().catch(() => { });
        });
    });
    wss.on('error', () => { });
}
