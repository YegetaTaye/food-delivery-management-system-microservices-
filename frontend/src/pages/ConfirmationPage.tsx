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
      <div className="page-loading-customer glass">
        <div className="loading-spinner large" />
        <p>Confirming your culinary journey...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="page-error-customer glass container">
        <div className="error-icon">⚠️</div>
        <h2>Oops! Something went wrong</h2>
        <p>{error || "We couldn't find your order details."}</p>
        <Link to="/products" className="btn-customer-primary">
          Back to Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="confirmation-page-v2 container fade-in">
      <div className="confirmation-card glass">
        <div className="success-header">
          <div className="success-check-lottie">✓</div>
          <h1 className="welcome-text">Order Confirmed!</h1>
          <p className="order-subtitle">We've received your order and we're already firing up the kitchen.</p>
        </div>

        <div className="order-tracking-mini">
          <div className="track-step active">
            <div className="step-dot"></div>
            <span>Confirmed</span>
          </div>
          <div className="track-line active"></div>
          <div className="track-step pending">
            <div className="step-dot"></div>
            <span>Preparing</span>
          </div>
          <div className="track-line"></div>
          <div className="track-step pending">
            <div className="step-dot"></div>
            <span>On the way</span>
          </div>
        </div>

        <div className="order-id-badge">
          <span>Order Reference: </span>
          <span className="id-text">{order.id.split('-')[0].toUpperCase()}</span>
        </div>

        <div className="confirmation-details-grid">
          <div className="details-section">
            <h3>Delivery To</h3>
            <p className="detail-text">123 Food Street, Digital City</p>
            <p className="detail-subtext">Estimated delivery: 25-35 mins</p>
          </div>
          <div className="details-section">
            <h3>Summary</h3>
            <div className="summary-list">
              {order.orderItems.map((item, i) => (
                <div key={i} className="summary-item">
                  <span>{item.quantity}x {item.productName}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="summary-total-v2">
                <span>Total Paid</span>
                <span className="total-price">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="confirmation-footer">
          <Link to="/orders" className="btn-customer-secondary">Track Detailed Order</Link>
          <Link to="/products" className="btn-customer-primary">Order More Food</Link>
        </div>
      </div>

      <style>{`
        .confirmation-page-v2 { padding: 4rem 0; display: flex; justify-content: center; }
        .confirmation-card { max-width: 700px; width: 100%; padding: 4rem; text-align: center; border-radius: 32px !important; }
        
        .success-check-lottie {
          width: 80px; height: 80px; background: var(--accent-primary);
          color: #000; font-size: 3rem; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
          border-radius: 99px; margin: 0 auto 2rem;
          box-shadow: 0 0 40px rgba(0, 212, 170, 0.3);
        }
        
        .order-subtitle { color: #94a3b8; margin-bottom: 3rem; }
        
        .order-tracking-mini {
          display: flex; align-items: center; justify-content: center;
          gap: 0.5rem; margin-bottom: 3rem;
        }
        .track-step { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 700; }
        .step-dot { width: 12px; height: 12px; border-radius: 99px; background: #1e293b; border: 2px solid #334155; }
        .track-step.active { color: var(--accent-primary); }
        .track-step.active .step-dot { background: var(--accent-primary); border-color: var(--accent-primary); box-shadow: 0 0 10px var(--accent-primary); }
        .track-line { flex: 1; max-width: 60px; height: 2px; background: #1e293b; }
        .track-line.active { background: var(--accent-primary); }
        
        .order-id-badge {
          background: rgba(255,255,255,0.03); padding: 0.75rem 1.5rem;
          border-radius: 99px; display: inline-block; margin-bottom: 3rem;
          font-size: 0.85rem; color: #64748b; border: 1px solid rgba(255,255,255,0.05);
        }
        .id-text { color: #fff; font-weight: 800; letter-spacing: 1px; }
        
        .confirmation-details-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;
          text-align: left; border-top: 1px solid rgba(255,255,255,0.05);
          padding-top: 3rem; margin-bottom: 3rem;
        }
        .details-section h3 { font-size: 0.9rem; font-weight: 800; color: #fff; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 1px; }
        .detail-text { color: #fff; font-weight: 600; margin-bottom: 0.25rem; }
        .detail-subtext { color: #64748b; font-size: 0.8rem; }
        
        .summary-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .summary-item { display: flex; justify-content: space-between; font-size: 0.85rem; color: #94a3b8; }
        .summary-total-v2 {
          display: flex; justify-content: space-between; margin-top: 1rem;
          padding-top: 1rem; border-top: 1px dashed rgba(255,255,255,0.1);
          color: #fff; font-weight: 800;
        }
        .total-price { color: var(--accent-primary); font-size: 1.25rem; }
        
        .confirmation-footer { display: flex; gap: 1rem; }
        .btn-customer-secondary {
          flex: 1; padding: 1rem; background: rgba(255,255,255,0.05);
          color: #fff; border-radius: 14px; text-decoration: none;
          font-weight: 700; transition: all 0.2s;
        }
        .btn-customer-secondary:hover { background: rgba(255,255,255,0.1); }
        .btn-customer-primary { flex: 1; text-decoration: none; display: flex; align-items: center; justify-content: center; }
        
        .page-loading-customer { height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1.5rem; color: #94a3b8; }
      `}</style>
    </div>
  );
}
