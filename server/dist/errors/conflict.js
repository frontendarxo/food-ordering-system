import { AppError } from "./app-error.js";
export class ConflictError extends AppError {
    constructor(message = 'Данные уже существуют') {
        super(message);
        this.statusCode = 409;
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}
