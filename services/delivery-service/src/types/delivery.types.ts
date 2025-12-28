import { Delivery as PrismaDelivery, DeliveryStatus as PrismaDeliveryStatus } from '@prisma/client';

// Re-export Prisma types
export type Delivery = PrismaDelivery;
export type DeliveryStatus = PrismaDeliveryStatus;
export const DeliveryStatus = {
  PENDING: 'PENDING' as PrismaDeliveryStatus,
  ASSIGNED: 'ASSIGNED' as PrismaDeliveryStatus,
  PICKED_UP: 'PICKED_UP' as PrismaDeliveryStatus,
  IN_TRANSIT: 'IN_TRANSIT' as PrismaDeliveryStatus,
  DELIVERED: 'DELIVERED' as PrismaDeliveryStatus,
  CANCELLED: 'CANCELLED' as PrismaDeliveryStatus,
};

export interface CreateDeliveryDto {
  orderId: string;
}

export interface UpdateDeliveryStatusDto {
  status: DeliveryStatus;
}

// Event Types
export interface OrderCreatedEvent {
  eventId: string;
  version: number;
  timestamp: string;
  source: string;
  orderId: string;
  userId: string;
  items: Array<{
    productId: string;
    qty: number;
    price: number;
  }>;
  total: number;
  paymentMethod: string;
  traceId: string;
}

export interface OrderCancelledEvent {
  eventId: string;
  version: number;
  timestamp: string;
  source: string;
  orderId: string;
  reason?: string;
  traceId: string;
}

export interface DeliveryStatusUpdatedEvent {
  eventId: string;
  version: number;
  timestamp: string;
  source: string;
  deliveryId: string;
  orderId: string;
  oldStatus: DeliveryStatus;
  newStatus: DeliveryStatus;
  traceId: string;
}
