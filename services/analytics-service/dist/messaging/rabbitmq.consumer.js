"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startEventConsumer = void 0;
const rabbitmq_1 = require("../config/rabbitmq");
const analytics_service_1 = require("../services/analytics.service");
const logger_1 = __importDefault(require("../utils/logger"));
const QUEUE_NAME = 'analytics-service.events';
const ORDER_CREATED_KEY = 'order.created';
const ORDER_CANCELLED_KEY = 'order.cancelled';
const ORDER_STATUS_UPDATED_KEY = 'order.status.updated';
const PAYMENT_COMPLETED_KEY = 'payment.completed';
const startEventConsumer = async () => {
    try {
        const channel = (0, rabbitmq_1.getChannel)();
        await channel.assertQueue(QUEUE_NAME, {
            durable: true,
        });
        await channel.bindQueue(QUEUE_NAME, rabbitmq_1.EXCHANGE_NAME, ORDER_CREATED_KEY);
        await channel.bindQueue(QUEUE_NAME, rabbitmq_1.EXCHANGE_NAME, ORDER_CANCELLED_KEY);
        await channel.bindQueue(QUEUE_NAME, rabbitmq_1.EXCHANGE_NAME, ORDER_STATUS_UPDATED_KEY);
        await channel.bindQueue(QUEUE_NAME, rabbitmq_1.EXCHANGE_NAME, PAYMENT_COMPLETED_KEY);
        logger_1.default.info(`✅ Queue '${QUEUE_NAME}' bound to exchange '${rabbitmq_1.EXCHANGE_NAME}'`);
        logger_1.default.info(`   - Listening for: ${ORDER_CREATED_KEY}, ${ORDER_CANCELLED_KEY}, ${ORDER_STATUS_UPDATED_KEY}, ${PAYMENT_COMPLETED_KEY}`);
        await channel.prefetch(1);
        await channel.consume(QUEUE_NAME, async (msg) => {
            if (!msg) {
                return;
            }
            const routingKey = msg.fields.routingKey;
            try {
                const content = msg.content.toString();
                const event = JSON.parse(content);
                logger_1.default.info(`Received event: ${routingKey}`, {
                    eventId: 'eventId' in event ? event.eventId : 'unknown',
                });
                await analytics_service_1.analyticsService.storeEvent(routingKey, event.source || 'unknown', event);
                channel.ack(msg);
                logger_1.default.debug(`Message acknowledged: ${routingKey}`);
            }
            catch (error) {
                logger_1.default.error(`Error processing message: ${routingKey}`, error);
                const requeue = !msg.fields.redelivered;
                channel.nack(msg, false, requeue);
                if (!requeue) {
                    logger_1.default.warn(`Message discarded after retry: ${routingKey}`);
                }
            }
        });
        logger_1.default.info('✅ Event consumer started successfully');
    }
    catch (error) {
        logger_1.default.error('Failed to start event consumer:', error);
        throw error;
    }
};
exports.startEventConsumer = startEventConsumer;
//# sourceMappingURL=rabbitmq.consumer.js.map