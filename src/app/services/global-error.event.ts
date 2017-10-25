
import { ErrorHandler } from '@angular/core';

export class GlobalErrorHandler implements ErrorHandler {

    constructor() {}

    public handleError(error) {
        console.warn('-->', error);
    }
}
