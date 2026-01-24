/**
 * API Service Layer
 *
 * This module handles all HTTP communication with the backend microservices.
 * Uses axios for HTTP requests with automatic token injection.
 *
 * Architecture:
 * Frontend → API Gateway → Individual Microservices
 *
 * The API Gateway handles:
 * - Request routing to appropriate services
 * - JWT validation for protected endpoints
 * - Rate limiting and load balancing
 *
 * Service Mapping:
 * /api/v1/users/auth/* → User Service (authentication)
 * /api/v1/users/* → User Service (profile management)
 * /api/v1/products/* → Product Service (catalog)
 * /api/v1/orders/* → Order Service (order management)
 * /api/v1/payments/* → Payment Service (payment processing)
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Product,
  Category,
  Order,
  CreateOrderRequest,
  Notification,
} from '../types';

// Base URLs for different services
const USER_SERVICE_URL = 'http://localhost:3000/api/v1';
const PRODUCT_SERVICE_URL = 'http://localhost:8080/api/v1/products';
const ORDER_SERVICE_URL = 'http://localhost:8080/api/v1';

/**
 * Token management - stores JWT in memory for security
 * Can be switched to localStorage if persistence across tabs is needed
 */
let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
  // Also persist to localStorage for page refresh persistence
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('auth_token');
  }
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
  localStorage.removeItem('auth_token');
}

/**
 * UserId management - stores userId in localStorage
 */
let userId: string | null = null;

export function setUserId(id: string | null) {
  userId = id;
  if (id) {
    localStorage.setItem('user_id', id);
  } else {
    localStorage.removeItem('user_id');
  }
}

export function getUserId(): string | null {
  if (!userId) {
    userId = localStorage.getItem('user_id');
  }
  return userId;
}

export function clearUserId() {
  userId = null;
  localStorage.removeItem('user_id');
}

/**
 * Create axios instance with base configuration
 */
const createApiClient = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - Add JWT token to all requests
  instance.interceptors.request.use(
    (config) => {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Log request for debugging
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
      });
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle errors globally
  instance.interceptors.response.use(
    (response) => {
      return response;
    },
    (error: AxiosError) => {
      // Handle specific error cases
      if (error.response) {
        const errorData = error.response.data as any;
        console.error('API Error:', {
          status: error.response.status,
          data: errorData,
          url: error.config?.url,
          method: error.config?.method,
        });
        throw {
          message: errorData?.message || errorData?.error || `HTTP ${error.response.status}`,
          statusCode: error.response.status,
          details: errorData,
        };
      } else if (error.request) {
        throw {
          message: 'Network error - please check your connection',
          statusCode: 0,
        };
      } else {
        throw {
          message: error.message || 'An unexpected error occurred',
          statusCode: 0,
        };
      }
    }
  );

  return instance;
};

// Create axios instances for different services
const userApiClient = createApiClient(USER_SERVICE_URL);
const productApiClient = createApiClient(PRODUCT_SERVICE_URL);
const orderApiClient = createApiClient(ORDER_SERVICE_URL);


// ============================================
// User Service API (Authentication)
// ============================================
// Endpoints: POST /users/auth/login, POST /users/auth/signup, GET /users/auth/me
// These endpoints communicate with the User Service through the API Gateway

export const authApi = {
  /**
   * Login - Authenticates user and returns JWT token
   * Maps to: User Service POST /users/auth/login
   *
   * Flow:
   * 1. Frontend sends credentials
   * 2. API Gateway routes to User Service
   * 3. User Service validates credentials, generates JWT
   * 4. JWT returned to frontend for subsequent requests
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await userApiClient.post<AuthResponse>('/users/auth/login', credentials);
    // Store the token for future authenticated requests
    setAuthToken(response.data.data.accessToken);
    // Store userId for API requests
    setUserId(response.data.data.user.id);
    // Optionally store refresh token
    localStorage.setItem('refresh_token', response.data.data.refreshToken);
    return response.data;
  },

  /**
   * Register - Creates new user account and returns JWT
   * Maps to: User Service POST /users/auth/signup
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await userApiClient.post<AuthResponse>('/users/auth/signup', data);
    // Store the token for future authenticated requests
    setAuthToken(response.data.data.accessToken);
    // Store userId for API requests
    setUserId(response.data.data.user.id);
    // Optionally store refresh token
    localStorage.setItem('refresh_token', response.data.data.refreshToken);
    return response.data;
  },

  /**
   * Get Current User - Fetches user profile based on JWT
   * Maps to: User Service GET /users/auth/me
   * Requires: JWT Bearer token in Authorization header
   */
  async getCurrentUser(): Promise<User> {
    const token = getAuthToken();
    if (!token) {
      throw {
        message: 'No authentication token found',
        statusCode: 401,
      };
    }
    const response = await userApiClient.get<User>('/users/auth/me');
    return response.data;
  },

  /**
   * Logout - Clears JWT from frontend storage
   * Note: JWT is stateless, so no backend call needed
   * In production, you might want to invalidate the token server-side
   */
  logout() {
    clearAuthToken();
    clearUserId();
  },
};


// ============================================
// Product Service API
// ============================================
// Endpoints: GET /menu-items, GET /menu-items/:id, GET /categories
// These endpoints communicate with the Product Service through the API Gateway

export const productsApi = {
  /**
   * Get All Menu Items - Fetches product catalog
   * Maps to: Product Service GET /menu-items
   *
   * This endpoint includes JWT token for authenticated requests
   */
  async getProducts(): Promise<Product[]> {
    const response = await productApiClient.get<{ success: boolean; data: Product[] }>('/menu-items');
    // Ensure price is a number
    return response.data.data.map(product => ({
      ...product,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    }));
  },

  /**
   * Get Single Menu Item - Fetches product by ID
   * Maps to: Product Service GET /menu-items/:id
   */
  async getProduct(productId: string): Promise<Product> {
    const response = await productApiClient.get<{ success: boolean; data: Product }>(`/menu-items/${productId}`);
    const product = response.data.data;
    // Ensure price is a number
    return {
      ...product,
      price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
    };
  },
};

// ============================================
// Categories API
// ============================================
// Endpoints: GET /categories, GET /categories/:id

export const categoriesApi = {
  /**
   * Get All Categories - Fetches all categories
   * Maps to: Product Service GET /categories
   */
  async getCategories(): Promise<Category[]> {
    const response = await productApiClient.get<{ success: boolean; data: Category[] }>('/categories');
    return response.data.data;
  },

  /**
   * Get Single Category - Fetches category by ID
   * Maps to: Product Service GET /categories/:id
   */
  async getCategory(categoryId: string): Promise<Category> {
    const response = await productApiClient.get<{ success: boolean; data: Category }>(`/categories/${categoryId}`);
    return response.data.data;
  },
};


// ============================================
// Helper function to normalize order data
// ============================================
const normalizeOrder = (order: Order): Order => ({
  ...order,
  totalAmount: typeof order.totalAmount === 'string' ? parseFloat(order.totalAmount) : order.totalAmount,
  orderItems: order.orderItems.map(item => ({
    ...item,
    price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
  })),
});


// ============================================
// Order Service API
// ============================================
// Endpoints: POST /orders, GET /orders, GET /orders/:id
// These endpoints communicate with the Order Service through the API Gateway

// ============================================
// Notification Service API
// ============================================
// Endpoints: GET /notifications
// These endpoints communicate with the Notification Service through the API Gateway

export const notificationsApi = {
  /**
   * Get User Notifications - Fetches notifications for current user
   * Maps to: Notification Service GET /notifications
   * Requires: JWT Bearer token and userId in header
   * @param limit - Maximum number of notifications to return (optional)
   */
  async getUserNotifications(limit?: number): Promise<Notification[]> {
    const userId = getUserId();
    if (!userId) {
      throw {
        message: 'User ID not found in localStorage',
        statusCode: 401,
      };
    }
    
    const params = new URLSearchParams({ userId });
    if (limit) {
      params.append('limit', limit.toString());
    }
    
    const response = await orderApiClient.get<{ success: boolean; data: Notification[] }>(
      `/notifications?${params.toString()}`,
      {
        headers: {
          'X-User-Id': userId,
        },
      }
    );
    return response.data.data;
  },

  /**
   * Mark Notification as Read
   * Maps to: Notification Service PATCH /notifications/:id
   */
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await orderApiClient.patch<{ success: boolean; data: Notification }>(
      `/notifications/${notificationId}`,
      { isRead: true }
    );
    return response.data.data;
  },
};

export const ordersApi = {
  /**
   * Create Order - Submits new order to Order Service
   * Maps to: Order Service POST /orders
   * Requires: JWT Bearer token
   *
   * Backend Events Published:
   * - orders.created → Triggers downstream services
   *
   * Flow:
   * 1. Frontend submits cart items as order
   * 2. API Gateway routes to Order Service
   * 3. Order Service creates order, publishes event
   * 4. Returns order with PENDING status
   */
  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    const response = await orderApiClient.post<{ success: boolean; message: string; data: Order }>('/orders', orderData);
    return normalizeOrder(response.data.data);
  },

  /**
   * Get Order by ID - Fetches single order details
   * Maps to: Order Service GET /orders/:id
   */
  async getOrder(orderId: string): Promise<Order> {
    const response = await orderApiClient.get<{ success: boolean; data: Order }>(`/orders/${orderId}`);
    return normalizeOrder(response.data.data);
  },

  /**
   * Cancel Order - Cancels an order
   * Maps to: Order Service PATCH /orders/:id/cancel
   */
  async cancelOrder(orderId: string): Promise<Order> {
    const response = await orderApiClient.patch<{ success: boolean; data: Order }>(`/orders/${orderId}/cancel`);
    return normalizeOrder(response.data.data);
  },

  /**
   * Get User Orders - Fetches all orders for current user
   * Maps to: Order Service GET /orders (uses JWT to identify user)
   */
  async getUserOrders(): Promise<Order[]> {
    const response = await orderApiClient.get<{ success: boolean; data: Order[] }>('/orders');
    return response.data.data.map(normalizeOrder);
  },
};
