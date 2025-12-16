import { AppError } from "./app-error.js";

export class UnauthorizedError extends AppError {
    statusCode = 401;

    constructor(message = 'Неверный номер или пароль') {
        super(message);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}