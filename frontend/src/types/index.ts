/**
 * Type Definitions
 * 
 * These types mirror the API response schemas from the OpenAPI specifications.
 * They ensure type safety when interacting with the microservices.
 */

// ============================================
// User Service Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

// ============================================
// Product Service Types
// ============================================

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  stock: number;
  isAvailable: boolean;
  categoryId: string;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Cart Types (Frontend-only)
// ============================================

export interface CartItem {
  product: Product;
  quantity: number;
}

// ============================================
// Order Service Types
// ============================================

export interface OrderItem {
  id?: string;
  orderId?: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  items: OrderItem[];
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAID'
  | 'PREPARING'
  | 'ASSIGNED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

// ============================================
// Payment Service Types
// ============================================

export interface PaymentRequest {
  orderId: string;
  amount: number;
  method: string;
  card?: {
    number: string;
    expMonth: number;
    expYear: number;
    cvv: string;
  };
}

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export interface PaymentResponse {
  paymentId: string;
  status: PaymentStatus;
  amount: number;
}

// ============================================
// API Error Type
// ============================================

export interface ApiError {
  message: string;
  statusCode: number;
}

// ============================================
// Notification Service Types
// ============================================

export interface Notification {
  id: string;
  userId: string;
  eventName: string;
  message: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

