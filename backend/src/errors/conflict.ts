import { AppError } from "./app-error.js";

export class ConflictError extends AppError {
    
    statusCode = 409;

    constructor(message = 'Данные уже существуют') {
        super(message);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}