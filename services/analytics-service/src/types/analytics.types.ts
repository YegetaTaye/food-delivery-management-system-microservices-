export interface AnalyticsEvent {
  id: string;
  eventType: string;
  sourceService: string;
  payload: Record<string, unknown>;
  createdAt: Date;
}

// Event Types from other services
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

export interface OrderStatusUpdatedEvent {
  eventId: string;
  version: number;
  timestamp: string;
  source: string;
  orderId: string;
  userId: string;
  oldStatus: string;
  newStatus: string;
  traceId: string;
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

export type DomainEvent = 
  | OrderCreatedEvent 
  | OrderCancelledEvent 
  | OrderStatusUpdatedEvent 
  | PaymentCompletedEvent;

export interface EventQueryParams {
  eventType?: string;
  sourceService?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

