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
    <div className="orders-page customer-view">
      {/* Page Header */}
      <section className="catalog-header container">
        <div className="title-group">
          <h1 className="main-title">Order History</h1>
          <p className="subtitle">Track your culinary journeys and past favorites</p>
        </div>
      </section>

      <div className="container">
        {orders.length === 0 ? (
          <div className="empty-state glass">
            <div className="empty-icon">📦</div>
            <h3>No orders yet</h3>
            <p>Your culinary history is waiting to be written.</p>
            <Link to="/products" className="btn btn-primary">
              Discover Something Delicious
            </Link>
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/confirmation/${order.id}`}
                className="order-card-link"
              >
                <div className="order-item-card glass">
                  <div className="order-card-header">
                    <div className="order-info">
                      <span className="order-id">
                        Order #{order.id.slice(0, 8)}
                      </span>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                    <span
                      className={`status-badge-premium ${getStatusColor(order.status).toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  
                  <div className="order-card-body">
                    <div className="items-preview">
                      <span className="order-items-count">
                        {order.orderItems.length} {order.orderItems.length === 1 ? 'Delicacy' : 'Delicacies'}
                      </span>
                      <div className="items-dots">
                        {order.orderItems.slice(0, 3).map((_, i) => (
                          <div key={i} className="item-dot" />
                        ))}
                      </div>
                    </div>
                    <div className="price-group">
                      <span className="total-label">Total</span>
                      <span className="order-total">
                        ${order.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <div className="order-card-footer">
                    <span className="view-details">View Details →</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .customer-view { padding-bottom: 5rem; }
        .container { max-width: 1440px; margin: 0 auto; padding: 0 1.5rem; }
        
        .catalog-header { padding: 3rem 0 2rem; }
        .main-title { font-family: var(--font-serif); font-size: 3.5rem; font-weight: 900; letter-spacing: -1px; background: linear-gradient(to right, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; }
        .subtitle { color: #64748b; font-size: 1.1rem; font-style: italic; }

        .orders-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 2.5rem; }
        
        .order-card-link { text-decoration: none; color: inherit; }
        
        .order-item-card {
          border-radius: 32px;
          padding: 2rem;
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 1px solid rgba(255, 255, 255, 0.03);
          position: relative;
          background: rgba(255, 255, 255, 0.02);
        }
        
        .order-item-card:hover { 
          transform: translateY(-10px) rotate(-1deg); 
          border-color: rgba(255, 77, 0, 0.2); 
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
          background: rgba(255, 255, 255, 0.04);
        }

        .order-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 2rem; }
        .order-info { display: flex; flex-direction: column; gap: 0.25rem; }
        .order-id { font-family: var(--font-serif); font-size: 1.25rem; font-weight: 800; color: #fff; }
        .order-date { font-size: 0.9rem; color: #64748b; font-weight: 500; }

        .status-badge-premium {
          padding: 0.5rem 1rem;
          border-radius: 14px;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .status-badge-premium.success { background: rgba(34, 197, 94, 0.1); color: #4ade80; border-color: rgba(34, 197, 94, 0.2); }
        .status-badge-premium.warning { background: rgba(234, 179, 8, 0.1); color: #fde047; border-color: rgba(234, 179, 8, 0.2); }
        .status-badge-premium.error { background: rgba(239, 68, 68, 0.1); color: #f87171; border-color: rgba(239, 68, 68, 0.2); }

        .order-card-body { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          padding: 1.5rem 0;
          border-top: 1px solid rgba(255,255,255,0.05);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          margin-bottom: 1.5rem;
        }

        .items-preview { display: flex; flex-direction: column; gap: 0.5rem; }
        .order-items-count { font-size: 1.1rem; font-weight: 700; color: #fff; }
        .items-dots { display: flex; gap: 4px; }
        .item-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-primary); opacity: 0.6; }

        .price-group { text-align: right; }
        .total-label { display: block; font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem; }
        .order-total { font-family: var(--font-serif); font-size: 1.75rem; font-weight: 900; color: var(--accent-primary); }

        .order-card-footer { display: flex; justify-content: flex-end; }
        .view-details { font-size: 0.9rem; font-weight: 800; color: #fff; opacity: 0.6; transition: opacity 0.3s; }
        .order-item-card:hover .view-details { opacity: 1; color: var(--accent-primary); }

        .empty-state { padding: 5rem; text-align: center; border-radius: 40px; margin-top: 2rem; }
        .empty-icon { font-size: 5rem; margin-bottom: 1.5rem; }
        .empty-state h3 { font-family: var(--font-serif); font-size: 2rem; font-weight: 800; margin-bottom: 1rem; }
        .empty-state p { color: #64748b; margin-bottom: 2.5rem; font-size: 1.1rem; }
      `}</style>
    </div>
  );
}
