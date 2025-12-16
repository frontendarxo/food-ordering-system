import { AppError } from "./app-error.js";

export class BadRequestError extends AppError {
    statusCode = 400;

    constructor(message = 'Некорректные данные') {
        super(message);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}