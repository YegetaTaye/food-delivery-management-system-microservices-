import { ChannelModel, Channel } from 'amqplib';
declare const EXCHANGE_NAME = "order.events";
declare const EXCHANGE_TYPE = "direct";
export declare const initializeRabbitMQ: () => Promise<void>;
export declare const getChannel: () => Channel;
export declare const getConnection: () => ChannelModel;
export declare const closeRabbitMQ: () => Promise<void>;
export { EXCHANGE_NAME, EXCHANGE_TYPE };
//# sourceMappingURL=rabbitmq.d.ts.map