export enum DeliveryStatus {
  ASSIGNED = 'ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export interface Delivery {
  id: string;
  orderId: string;
  status: DeliveryStatus;
  assignedAt: Date;
  updatedAt: Date;
}

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
