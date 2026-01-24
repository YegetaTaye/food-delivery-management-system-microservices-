/**
 * Checkout Page
 *
 * Handles the order creation and payment flow.
 *
 * API Integration:
 * 1. POST /api/v1/orders → Order Service (creates order)
 * 2. POST /api/v1/payments → Payment Service (processes payment)
 *
 * Flow:
 * 1. User reviews cart items
 * 2. User clicks "Place Order"
 * 3. Frontend sends order to Order Service via API Gateway
 * 4. Order Service creates order with PENDING status
 * 5. Order Service publishes `orders.created` event
 * 6. Frontend receives order ID
 * 7. Frontend sends payment request to Payment Service
 * 8. Payment Service simulates payment (no real transaction)
 * 9. Payment Service publishes `payments.completed` event
 * 10. Frontend shows confirmation or error
 *
 * Backend Events (async, frontend doesn't wait):
 * - orders.created → Product Service reserves stock
 * - payments.completed → Order Service updates status to PAID
 * - payments.completed → Notification Service sends email
 */
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { ordersApi } from "../services/api";
import type { ApiError } from "../types";

type CheckoutStep = "review" | "processing" | "complete" | "error";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, totalPrice, clearCart } = useCart();

  const [step, setStep] = useState<CheckoutStep>("review");
  const [error, setError] = useState<string | null>(null);
  const [currentAction, setCurrentAction] = useState<string>("");

  // Redirect if cart is empty
  if (items.length === 0 && step === "review") {
    return <Navigate to="/cart" replace />;
  }

  /**
   * Handle the complete order flow:
   * 1. Create order via Order Service
   * 2. Process payment via Payment Service
   * 3. Clear cart and show confirmation
   */
  const handlePlaceOrder = async () => {
    if (!user) return;

    setStep("processing");
    setError(null);

    try {
      // ========================================
      // Create Order via Order Service
      // Payment is handled by the backend automatically
      // ========================================
      setCurrentAction("Creating order...");

      const order = await ordersApi.createOrder({
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: Number(item.product.price.toFixed(2)),
        })),
      });

      // ========================================
      // Success - Clear cart and redirect
      // ========================================
      clearCart();
      setStep("complete");

      // Redirect to confirmation page
      navigate(`/confirmation/${order.id}`);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || "Something went wrong. Please try again.");
      setStep("error");
    }
  };

  if (step === "processing") {
    return (
      <div className="checkout-page">
        <div className="processing-container">
          <div className="loading-spinner large" />
          <h2>Processing Your Order</h2>
          <p className="processing-action">{currentAction}</p>

          {/* Service flow indicator */}
          <div className="service-flow">
            <div
              className={`flow-step ${currentAction.includes("order") ? "active" : "done"}`}
            >
              <span className="flow-icon">📝</span>
              <span>Order Service</span>
            </div>
            <span className="flow-arrow">→</span>
            <div
              className={`flow-step ${currentAction.includes("payment") ? "active" : ""}`}
            >
              <span className="flow-icon">💳</span>
              <span>Payment Service</span>
            </div>
            <span className="flow-arrow">→</span>
            <div className="flow-step">
              <span className="flow-icon">✉️</span>
              <span>Notification</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="checkout-page">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Order Failed</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button
              onClick={() => setStep("review")}
              className="btn btn-primary"
            >
              Try Again
            </button>
            <button onClick={() => navigate("/cart")} className="btn btn-ghost">
              Back to Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="page-header">
        <h1>Checkout</h1>
        <p className="page-description">Review and confirm your order</p>
      </div>

      {/* Service flow indicator */}
      <div className="service-indicator">
        <span className="service-badge">Order Service</span>
        <span className="endpoint-badge">POST /api/v1/orders</span>
        <span className="arrow">→</span>
        <span className="service-badge">Payment Service</span>
        <span className="endpoint-badge">POST /api/v1/payments</span>
      </div>

      <div className="checkout-content">
        <div className="checkout-items">
          <h2>Order Items</h2>
          {items.map((item) => (
            <div key={item.product.id} className="checkout-item">
              <span className="item-qty">{item.quantity}×</span>
              <span className="item-name">{item.product.name}</span>
              <span className="item-price">
                ${(item.product.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>

        <div className="checkout-summary">
          <h2>Payment Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Fee</span>
            <span>$0.00</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>

          <div className="payment-method">
            <h3>Payment Method</h3>
            <div className="payment-card">
              <span className="card-icon">💳</span>
              <span>Simulated Card Payment</span>
            </div>
            <p className="payment-note">
              Note: This is a simulated payment. No real transaction will occur.
            </p>
          </div>

          <button
            onClick={handlePlaceOrder}
            className="btn btn-primary btn-full btn-lg"
          >
            Place Order - ${totalPrice.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}
