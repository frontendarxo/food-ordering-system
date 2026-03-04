var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { UnauthorizedError } from '../errors/unauthorized.js';
import { getAdminDashboard, getWorkerDashboard } from '../services/analyticsService.js';
export const getAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (res.locals.userRole !== 'admin') {
            throw new UnauthorizedError('Доступ только для администратора');
        }
        const startDate = typeof req.query.startDate === 'string' ? req.query.startDate : undefined;
        const endDate = typeof req.query.endDate === 'string' ? req.query.endDate : undefined;
        const data = yield getAdminDashboard({ startDate, endDate });
        res.json(data);
    }
    catch (error) {
        next(error);
    }
});
export const getWorker = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (res.locals.userRole !== 'worker' || !res.locals.userLocation) {
            throw new UnauthorizedError('Доступ только для работника с назначенной локацией');
        }
        const data = yield getWorkerDashboard(res.locals.userLocation);
        res.json(data);
    }
    catch (error) {
        next(error);
    }
});
