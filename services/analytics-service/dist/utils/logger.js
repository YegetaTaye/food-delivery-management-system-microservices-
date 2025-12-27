"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
const env_1 = require("../config/env");
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const logger = winston_1.default.createLogger({
    level: env_1.config.nodeEnv === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: env_1.config.serviceName },
    transports: [
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.printf(({ timestamp, level, message, service, ...meta }) => {
                let metaString = '';
                if (Object.keys(meta).length > 0) {
                    metaString = ` ${JSON.stringify(meta)}`;
                }
                return `${timestamp} [${service}] ${level}: ${message}${metaString}`;
            })),
        }),
    ],
});
exports.default = logger;
//# sourceMappingURL=logger.js.map