"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = __importDefault(require("../utils/logger"));
const errorHandler = (error, req, res, _next) => {
    const status = error.status || error.statusCode || 500;
    const message = error.message || 'Internal Server Error';
    logger_1.default.error(`Error: ${message}`, {
        status,
        path: req.path,
        method: req.method,
        stack: error.stack,
    });
    const response = {
        message,
        status,
    };
    if (process.env.NODE_ENV === 'development') {
        response.stack = error.stack;
    }
    return res.status(status).json(response);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map