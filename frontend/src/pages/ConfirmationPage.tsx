/**
 * Confirmation Page
 *
 * Displays order confirmation after successful checkout.
 *
 * API Integration:
 * - GET /api/v1/orders/:orderId → Order Service
 *
 * This page shows:
 * - Order ID
 * - Order status (updated by backend events)
 * - Payment status
 * - Order items
 *
 * Backend Event Flow (happens async, frontend shows results):
 * 1. orders.created → Product Service reserves stock
 * 2. payments.completed → Order Service updates status to PAID
 * 3. payments.completed → Notification Service sends confirmation email
 * 4. notification.sent → (Optional) Analytics Service logs event
 *
 * Note: Frontend only consumes HTTP responses, not events directly.
 * The order status reflects the cumulative effect of these events.
 */
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ordersApi } from "../services/api";
import type { Order, ApiError } from "../types";

export default function ConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      try {
        const data = await ordersApi.getOrder(orderId);
        setOrder(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || "Failed to load order");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-error">
        <h2>Error</h2>
        <p>{error || "Order not found"}</p>
        <Link to="/products" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
      case "CONFIRMED":
      case "DELIVERED":
        return "success";
      case "PENDING":
      case "PREPARING":
      case "ASSIGNED":
      case "OUT_FOR_DELIVERY":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <div className="confirmation-page">
      <div className="confirmation-header">
        <div className="success-icon">✓</div>
        <h1>Order Confirmed!</h1>
        <p className="confirmation-subtitle">
          Thank you for your order. We're preparing it now.
        </p>
      </div>

      {/* Service indicator */}
      <div className="service-indicator">
        <span className="service-badge">Order Service</span>
        <span className="endpoint-badge">GET /api/v1/orders/{orderId}</span>
      </div>

      {/* Event flow visualization */}
      <div className="event-flow-container">
        <h3>Backend Event Flow</h3>
        <div className="event-flow">
          <div className="event-item completed">
            <span className="event-icon">📝</span>
            <span className="event-name">orders.created</span>
            <span className="event-status">✓</span>
          </div>
          <span className="event-arrow">→</span>
          <div
            className={`event-item ${order.status !== "PENDING" ? "completed" : "pending"}`}
          >
            <span className="event-icon">💳</span>
            <span className="event-name">payments.completed</span>
            <span className="event-status">
              {order.status !== "PENDING" ? "✓" : "..."}
            </span>
          </div>
          <span className="event-arrow">→</span>
          <div
            className={`event-item ${order.status !== "PENDING" ? "completed" : "pending"}`}
          >
            <span className="event-icon">✉️</span>
            <span className="event-name">notification.sent</span>
            <span className="event-status">
              {order.status !== "PENDING" ? "✓" : "..."}
            </span>
          </div>
        </div>
        <p className="event-note">
          These events are processed asynchronously by the backend
          microservices.
        </p>
      </div>

      <div className="confirmation-content">
        <div className="order-card">
          <div className="order-card-header">
            <div>
              <span className="order-label">Order ID</span>
              <span className="order-id">{order.id}</span>
            </div>
            <span className={`status-badge ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="order-details">
            <div className="detail-row">
              <span className="detail-label">Order Date</span>
              <span className="detail-value">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Items</span>
              <span className="detail-value">
                {order.orderItems.length} items
              </span>
            </div>
            <div className="detail-row total">
              <span className="detail-label">Total</span>
              <span className="detail-value">
                ${order.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="order-items-list">
            <h3>Order Items</h3>
            {order.orderItems.map((item, index) => (
              <div key={index} className="order-item-row">
                <span className="item-qty">{item.quantity}×</span>
                <span className="item-name">{item.productName}</span>
                <span className="item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="confirmation-actions">
          <Link to="/orders" className="btn btn-secondary">
            View All Orders
          </Link>
          <Link to="/products" className="btn btn-primary">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
