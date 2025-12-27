"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const rabbitmq_1 = require("./config/rabbitmq");
const rabbitmq_consumer_1 = require("./messaging/rabbitmq.consumer");
const logger_1 = __importDefault(require("./utils/logger"));
const startServer = async () => {
    try {
        logger_1.default.info('Initializing database connection...');
        await (0, database_1.initializeDatabase)();
        logger_1.default.info('Initializing RabbitMQ connection...');
        await (0, rabbitmq_1.initializeRabbitMQ)();
        logger_1.default.info('Starting event consumer...');
        await (0, rabbitmq_consumer_1.startEventConsumer)();
        const server = app_1.default.listen(env_1.config.port, () => {
            logger_1.default.info(`🚀 ${env_1.config.serviceName} is running on port ${env_1.config.port}`);
            logger_1.default.info(`📚 API Documentation available at http://localhost:${env_1.config.port}/docs`);
            logger_1.default.info(`💚 Health check available at http://localhost:${env_1.config.port}/health`);
            logger_1.default.info(`📊 Analytics API available at http://localhost:${env_1.config.port}/analytics`);
            logger_1.default.info(`Environment: ${env_1.config.nodeEnv}`);
        });
        const gracefulShutdown = async (signal) => {
            logger_1.default.info(`${signal} received. Starting graceful shutdown...`);
            server.close(async () => {
                logger_1.default.info('HTTP server closed');
                try {
                    await (0, rabbitmq_1.closeRabbitMQ)();
                    await (0, database_1.closeDatabase)();
                    logger_1.default.info('All connections closed. Exiting process.');
                    process.exit(0);
                }
                catch (error) {
                    logger_1.default.error('Error during graceful shutdown:', error);
                    process.exit(1);
                }
            });
            setTimeout(() => {
                logger_1.default.error('Forced shutdown due to timeout');
                process.exit(1);
            }, 10000);
        };
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('unhandledRejection', (reason) => {
            logger_1.default.error('Unhandled Rejection:', reason);
        });
        process.on('uncaughtException', (error) => {
            logger_1.default.error('Uncaught Exception:', error);
            gracefulShutdown('UNCAUGHT_EXCEPTION');
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map