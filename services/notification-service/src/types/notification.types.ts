export interface Notification {
  id: string;
  userId: string;
  eventName: string;
  message: string;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

// Event Types from other services
export interface OrderCreatedEvent {
  eventId?: string;
  eventType?: string;
  timestamp?: string;
  orderId: string;
  userId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: string | number;
  }>;
  totalAmount: string | number;
}

export interface OrderStatusUpdatedEvent {
  eventId?: string;
  eventType?: string;
  timestamp?: string;
  orderId: string;
  userId: string;
  status: string;
}

export interface PaymentCompletedEvent {
  eventId: string;
  version: number;
  timestamp: string;
  source: string;
  paymentId: string;
  orderId: string;
  userId: string;
  amount: number;
  method: string;
  traceId: string;
}

export interface DeliveryStatusUpdatedEvent {
  eventId: string;
  version: number;
  timestamp: string;
  source: string;
  deliveryId: string;
  orderId: string;
  userId: string;
  oldStatus: string;
  newStatus: string;
  driverId?: string;
  estimatedDeliveryTime?: string;
  traceId: string;
}

export type DomainEvent = OrderCreatedEvent | OrderStatusUpdatedEvent | PaymentCompletedEvent | DeliveryStatusUpdatedEvent;

