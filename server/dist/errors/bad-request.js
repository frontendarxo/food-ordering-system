import { AppError } from "./app-error.js";
export class BadRequestError extends AppError {
    constructor(message = 'Некорректные данные') {
        super(message);
        this.statusCode = 400;
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}
