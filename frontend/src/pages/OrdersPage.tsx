/**
 * Orders Page
 *
 * Displays order history for the current user.
 *
 * API Integration:
 * - GET /api/v1/orders?userId=:userId → Order Service
 *
 * This page shows all orders for the authenticated user,
 * demonstrating the Order Service's query capabilities.
 */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ordersApi } from "../services/api";
import type { Order, ApiError } from "../types";

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      try {
        const data = await ordersApi.getUserOrders();
        // Sort by date, newest first
        setOrders(
          data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || "Failed to load orders");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

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

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="page-header">
        <h1>Order History</h1>
        <p className="page-description">View your past orders</p>
      </div>

      {/* Service indicator */}
      <div className="service-indicator">
        <span className="service-badge">Order Service</span>
        <span className="endpoint-badge">
          GET /api/v1/orders?userId={user?.id?.slice(0, 8)}...
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>No orders yet</h2>
          <p>Your order history will appear here.</p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/confirmation/${order.id}`}
              className="order-card-link"
            >
              <div className="order-card">
                <div className="order-card-header">
                  <div className="order-info">
                    <span className="order-id">
                      Order #{order.id.slice(0, 8)}...
                    </span>
                    <span className="order-date">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <span
                    className={`status-badge ${getStatusColor(order.status)}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="order-card-body">
                  <span className="order-items-count">
                    {order.orderItems.length} item
                    {order.orderItems.length !== 1 ? "s" : ""}
                  </span>
                  <span className="order-total">
                    ${order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
