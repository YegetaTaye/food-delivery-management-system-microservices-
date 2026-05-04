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
import { useNavigate, Navigate, Link } from "react-router-dom";
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



  return (
    <div className="checkout-page quiet-luxury">
      <div className="container">
        <header className="cart-hero">
          <div className="hero-left">
            <Link to="/cart" className="back-link-luxury">← Return to Selection</Link>
            <h1 className="user-name-title">Final Review</h1>
            <p className="user-email-subtitle">Confirm your details and culinary sanctuary details</p>
          </div>
        </header>

        {step === "processing" ? (
          <div className="processing-state-luxury glass">
            <div className="loader-luxury" />
            <h2 className="section-title-luxury">Securing Your Selection</h2>
            <p className="luxury-subtitle">{currentAction}</p>
          </div>
        ) : step === "error" ? (
          <div className="empty-state-luxury glass">
            <span className="empty-icon-luxury">⚠️</span>
            <h2 className="section-title-luxury">Verification Issue</h2>
            <p>{error}</p>
            <button onClick={() => setStep("review")} className="btn-luxury-primary mt-8">Try Again</button>
          </div>
        ) : (
          <div className="luxury-grid-cart">
            <div className="checkout-column-main">
              {/* Delivery Section */}
              <section className="luxury-section glass mb-8">
                <h3 className="section-title-luxury">Delivery Sanctuary</h3>
                <div className="selection-card-luxury active">
                  <div className="selection-info-luxury">
                    <span className="selection-label-luxury">Primary Destination</span>
                    <p className="selection-value-luxury">123 Food Street, Digital City, FC 4567</p>
                  </div>
                  <div className="selection-indicator-luxury" />
                </div>
                <button className="btn-luxury-text-add">+ Add Alternative Destination</button>
              </section>

              {/* Payment Section */}
              <section className="luxury-section glass">
                <h3 className="section-title-luxury">Payment Method</h3>
                <div className="selection-card-luxury active">
                  <div className="selection-info-luxury">
                    <span className="selection-label-luxury">Visa Sanctuary Card</span>
                    <p className="selection-value-luxury">•••• 4242 • Exp 12/26</p>
                  </div>
                  <div className="selection-indicator-luxury" />
                </div>
              </section>
            </div>

            <aside className="checkout-sidebar-column">
              <div className="summary-card-luxury glass sticky">
                <h3 className="section-title-luxury">Final Summary</h3>
                <div className="mini-selection-list">
                  {items.map(item => (
                    <div key={item.product.id} className="mini-selection-item">
                      <span className="item-qty-name">{item.quantity}× {item.product.name}</span>
                      <span className="item-total-price">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="summary-rows-luxury mt-6">
                  <div className="summary-row-luxury">
                    <span className="label">Subtotal</span>
                    <span className="value">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="summary-row-luxury">
                    <span className="label">Culinary Service</span>
                    <span className="value-accent">Complimentary</span>
                  </div>
                  
                  <div className="summary-divider-luxury" />
                  
                  <div className="summary-total-luxury">
                    <span className="label">Total Selection</span>
                    <span className="value-total">${(totalPrice).toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={handlePlaceOrder}
                  className="btn-luxury-primary mt-8"
                >
                  Confirm & Finalize
                </button>
                
                <div className="security-note-luxury">
                  <span className="icon">🛡️</span>
                  Encrypted Sanctuary Payment
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      <style>{`
        .checkout-page { min-height: 80vh; }
        .quiet-luxury { padding: 4rem 0; color: #fff; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

        /* Header */
        .cart-hero { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 2rem; }
        .back-link-luxury { color: #64748b; text-decoration: none; font-size: 0.9rem; font-weight: 700; margin-bottom: 1rem; display: block; transition: color 0.3s; }
        .back-link-luxury:hover { color: #fff; }
        .user-name-title { font-family: var(--font-serif); font-size: 3rem; font-weight: 900; letter-spacing: -1px; margin-bottom: 0.5rem; }
        .user-email-subtitle { color: #64748b; font-size: 1.1rem; }

        /* Grid */
        .luxury-grid-cart { display: grid; grid-template-columns: 1fr 400px; gap: 4rem; align-items: flex-start; }
        @media (max-width: 1000px) { .luxury-grid-cart { grid-template-columns: 1fr; } }

        /* Sections */
        .luxury-section { padding: 2.5rem; border-radius: 32px; border: 1px solid rgba(255,255,255,0.03); }
        .section-title-luxury { font-family: var(--font-serif); font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 1rem; }
        .mb-8 { margin-bottom: 2rem; }

        /* Cards */
        .selection-card-luxury { 
          display: flex; justify-content: space-between; align-items: center; 
          padding: 1.5rem; background: rgba(255,255,255,0.02); 
          border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); 
          transition: all 0.3s;
        }
        .selection-card-luxury.active { border-color: var(--accent-primary); background: rgba(255, 77, 0, 0.05); }
        .selection-label-luxury { font-size: 0.75rem; font-weight: 800; color: var(--accent-primary); text-transform: uppercase; letter-spacing: 1px; }
        .selection-value-luxury { color: #fff; font-weight: 600; margin-top: 0.25rem; font-size: 1.1rem; }
        .selection-indicator-luxury { width: 12px; height: 12px; background: var(--accent-primary); border-radius: 50%; box-shadow: 0 0 10px var(--accent-glow); }

        .btn-luxury-text-add { background: transparent; border: none; color: #64748b; font-size: 0.85rem; font-weight: 700; cursor: pointer; margin-top: 1.5rem; transition: color 0.3s; }
        .btn-luxury-text-add:hover { color: #fff; }

        /* Mini Selection */
        .mini-selection-list { display: flex; flex-direction: column; gap: 1rem; padding-bottom: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .mini-selection-item { display: flex; justify-content: space-between; font-size: 0.95rem; }
        .item-qty-name { color: #94a3b8; font-weight: 500; }
        .item-total-price { color: #fff; font-weight: 700; }

        /* Summary */
        .summary-card-luxury { padding: 2.5rem; border-radius: 32px; }
        .summary-rows-luxury { display: flex; flex-direction: column; gap: 1.25rem; }
        .summary-row-luxury { display: flex; justify-content: space-between; align-items: center; }
        .summary-row-luxury .label { font-size: 0.9rem; color: #64748b; font-weight: 600; }
        .summary-row-luxury .value { font-weight: 700; color: #fff; }
        .summary-row-luxury .value-accent { font-weight: 800; color: #22c55e; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; }
        
        .summary-divider-luxury { height: 1px; background: rgba(255,255,255,0.05); margin: 0.5rem 0; }
        .summary-total-luxury { display: flex; justify-content: space-between; align-items: center; }
        .summary-total-luxury .label { font-family: var(--font-serif); font-size: 1.2rem; font-weight: 800; color: #fff; }
        .summary-total-luxury .value-total { font-family: var(--font-serif); font-size: 2rem; font-weight: 900; color: var(--accent-primary); }

        .security-note-luxury { display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-size: 0.75rem; color: #475569; font-weight: 700; margin-top: 1.5rem; text-transform: uppercase; letter-spacing: 1px; }
        .security-note-luxury .icon { font-size: 1rem; }

        /* Processing State */
        .processing-state-luxury { padding: 6rem 2rem; text-align: center; border-radius: 40px; }
        .loader-luxury { width: 50px; height: 50px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--accent-primary); border-radius: 50%; margin: 0 auto 2rem; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .luxury-subtitle { color: #64748b; font-size: 1.1rem; }

        .sticky { position: sticky; top: 100px; }
        .mt-6 { margin-top: 1.5rem; }
        .mt-8 { margin-top: 2rem; }
        .btn-luxury-primary {
          width: 100%; padding: 1.1rem; background: var(--accent-primary); 
          color: #fff; border: none; border-radius: 16px; 
          font-weight: 800; font-size: 1.1rem; cursor: pointer; transition: all 0.3s;
          display: inline-block; text-decoration: none; text-align: center;
        }
        .btn-luxury-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 20px var(--accent-glow); filter: brightness(1.1); }
      `}</style>
    </div>
  );
}
