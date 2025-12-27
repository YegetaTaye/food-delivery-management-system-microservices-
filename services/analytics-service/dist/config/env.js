"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const getEnvConfig = () => {
    return {
        port: parseInt(process.env.PORT || '4700', 10),
        serviceName: process.env.SERVICE_NAME || 'analytics-service',
        nodeEnv: process.env.NODE_ENV || 'development',
        rabbitmq: {
            url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
        },
        database: {
            url: process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/analytics_db',
        },
    };
};
exports.config = getEnvConfig();
//# sourceMappingURL=env.js.map