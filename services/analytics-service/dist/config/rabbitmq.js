"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXCHANGE_TYPE = exports.EXCHANGE_NAME = exports.closeRabbitMQ = exports.getConnection = exports.getChannel = exports.initializeRabbitMQ = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const env_1 = require("./env");
const logger_1 = __importDefault(require("../utils/logger"));
let connection = null;
let channel = null;
const EXCHANGE_NAME = 'order.events';
exports.EXCHANGE_NAME = EXCHANGE_NAME;
const EXCHANGE_TYPE = 'direct';
exports.EXCHANGE_TYPE = EXCHANGE_TYPE;
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const initializeRabbitMQ = async () => {
    let retries = 0;
    while (retries < MAX_RETRIES) {
        try {
            logger_1.default.info(`Connecting to RabbitMQ at ${env_1.config.rabbitmq.url}...`);
            connection = await amqplib_1.default.connect(env_1.config.rabbitmq.url);
            channel = await connection.createChannel();
            await channel.assertExchange(EXCHANGE_NAME, EXCHANGE_TYPE, {
                durable: true,
            });
            logger_1.default.info('✅ RabbitMQ connection established successfully');
            logger_1.default.info(`✅ Exchange '${EXCHANGE_NAME}' declared`);
            connection.on('error', (err) => {
                logger_1.default.error('RabbitMQ connection error:', err);
            });
            connection.on('close', () => {
                logger_1.default.warn('RabbitMQ connection closed');
            });
            return;
        }
        catch (error) {
            retries++;
            logger_1.default.error(`Failed to connect to RabbitMQ (attempt ${retries}/${MAX_RETRIES}):`, error);
            if (retries < MAX_RETRIES) {
                logger_1.default.info(`Retrying in ${RETRY_DELAY_MS / 1000} seconds...`);
                await sleep(RETRY_DELAY_MS);
            }
        }
    }
    throw new Error(`Failed to connect to RabbitMQ after ${MAX_RETRIES} attempts`);
};
exports.initializeRabbitMQ = initializeRabbitMQ;
const getChannel = () => {
    if (!channel) {
        throw new Error('RabbitMQ channel not initialized. Call initializeRabbitMQ() first.');
    }
    return channel;
};
exports.getChannel = getChannel;
const getConnection = () => {
    if (!connection) {
        throw new Error('RabbitMQ connection not initialized. Call initializeRabbitMQ() first.');
    }
    return connection;
};
exports.getConnection = getConnection;
const closeRabbitMQ = async () => {
    try {
        if (channel) {
            await channel.close();
            channel = null;
        }
        if (connection) {
            await connection.close();
            connection = null;
        }
        logger_1.default.info('RabbitMQ connection closed gracefully');
    }
    catch (error) {
        logger_1.default.error('Error closing RabbitMQ connection:', error);
    }
};
exports.closeRabbitMQ = closeRabbitMQ;
//# sourceMappingURL=rabbitmq.js.map