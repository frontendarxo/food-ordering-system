import { AppError } from "./app-error.js";
export class UnauthorizedError extends AppError {
    constructor(message = 'Неверный номер или пароль') {
        super(message);
        this.statusCode = 401;
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}
