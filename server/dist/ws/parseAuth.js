import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../utils/jwt.js';
function parseCookie(cookieHeader) {
    if (!cookieHeader)
        return null;
    const match = cookieHeader.match(/\baccessToken=([^;]+)/);
    return match ? match[1].trim() : null;
}
export function getWsUser(req) {
    const token = parseCookie(req.headers.cookie);
    if (!token)
        return null;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return { userId: decoded.userId, role: decoded.role, location: decoded.location };
    }
    catch (_a) {
        return null;
    }
}
