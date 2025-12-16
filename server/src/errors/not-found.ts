import { AppError } from "./app-error.js";

export class NotFoundError extends AppError {
    statusCode = 404;

    constructor(message = 'Not found') {
        super(message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}