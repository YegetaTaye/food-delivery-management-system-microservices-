export interface OrderCreatedEvent {
  eventId: string;
  eventType: string;
  timestamp: string;
  orderId: string;
  userId: string;
  totalAmount: string;
  items: OrderItem[];
  traceId?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: string;
}

export interface PaymentCompletedEvent {
  eventId: string;
  version: number;
  timestamp: string;
  source: string;
  paymentId: string;
  orderId: string;
  userId: string;
  status: 'SUCCESS' | 'FAILED';
  amount: number;
  method: string;
  traceId?: string;
  failureReason?: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export enum PaymentMethod {
  CARD = 'CARD',
  CASH = 'CASH',
  WALLET = 'WALLET',
}
