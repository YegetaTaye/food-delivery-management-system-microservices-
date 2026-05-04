/**
 * Cart Page
 * 
 * Displays and manages the shopping cart.
 * 
 * IMPORTANT: Cart is managed ENTIRELY on the frontend.
 * - No backend Cart Service calls
 * - State stored in React Context (memory)
 * - Cart resets on page refresh
 * 
 * Operations:
 * - View cart items
 * - Update quantities
 * - Remove items
 * - Calculate total
 * - Proceed to checkout
 * 
 * This component demonstrates frontend-only state management
 * before interacting with backend services (Order, Payment).
 */
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();

  const handleCheckout = () => {
    if (items.length > 0) {
      navigate('/checkout');
    }
  };

  return (
    <div className="cart-page quiet-luxury">
      <div className="container">
        <header className="cart-hero">
          <div className="hero-left">
            <Link to="/products" className="back-link-luxury">← Return to Gallery</Link>
            <h1 className="user-name-title">Your Selection</h1>
            <p className="user-email-subtitle">Review your curated items before proceeding</p>
          </div>
          {items.length > 0 && (
            <button onClick={clearCart} className="btn-luxury-text">
              Empty Selection
            </button>
          )}
        </header>

        {items.length === 0 ? (
          <div className="empty-state-luxury glass">
            <div className="empty-content">
              <span className="empty-icon-luxury">🧺</span>
              <h2 className="section-title-luxury">The basket is empty</h2>
              <p>Your culinary journey awaits. Begin by selecting from our menu.</p>
              <Link to="/products" className="btn-luxury-primary mt-6">
                Explore Culinary Gallery
              </Link>
            </div>
          </div>
        ) : (
          <div className="luxury-grid-cart">
            <div className="cart-items-column">
              <div className="cart-list-luxury">
                {items.map((item) => (
                  <div key={item.product.id} className="cart-item-luxury glass">
                    <div className="item-visual-luxury">
                      {item.product.imageUrl ? (
                        <img src={item.product.imageUrl} alt={item.product.name} />
                      ) : (
                        <div className="item-placeholder">🍽️</div>
                      )}
                    </div>
                    
                    <div className="item-details-luxury">
                      <div className="item-header-luxury">
                        <h4 className="item-name-luxury serif-value">{item.product.name}</h4>
                        <span className="item-price-luxury">${item.product.price.toFixed(2)}</span>
                      </div>
                      <p className="item-category-luxury">{item.product.category?.name || 'Main Course'}</p>
                      
                      <div className="item-footer-luxury">
                        <div className="quantity-control-luxury">
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="qty-btn-luxury"
                          >−</button>
                          <span className="qty-value-luxury">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="qty-btn-luxury"
                          >+</button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.product.id)}
                          className="remove-link-luxury"
                        >Remove Item</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="cart-summary-column">
              <div className="summary-card-luxury glass sticky">
                <h3 className="section-title-luxury">Order Summary</h3>
                
                <div className="summary-rows-luxury">
                  <div className="summary-row-luxury">
                    <span className="label">Subtotal</span>
                    <span className="value">${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="summary-row-luxury">
                    <span className="label">Culinary Service</span>
                    <span className="value-accent">Complimentary</span>
                  </div>
                  <div className="summary-row-luxury">
                    <span className="label">Estimated Tax</span>
                    <span className="value">$2.00</span>
                  </div>
                  
                  <div className="summary-divider-luxury" />
                  
                  <div className="summary-total-luxury">
                    <span className="label">Total Selection</span>
                    <span className="value-total">${(totalPrice + 2).toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="btn-luxury-primary mt-8"
                >
                  Confirm Selection
                </button>
                
                <div className="security-note-luxury">
                  <span className="icon">🛡️</span>
                  Encrypted Checkout Sanctuary
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      <style>{`
        .cart-page { min-height: 80vh; }
        .quiet-luxury { padding: 4rem 0; color: #fff; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

        /* Header */
        .cart-hero { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4rem; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 2rem; }
        .back-link-luxury { color: #64748b; text-decoration: none; font-size: 0.9rem; font-weight: 700; margin-bottom: 1rem; display: block; transition: color 0.3s; }
        .back-link-luxury:hover { color: #fff; }
        .user-name-title { font-family: var(--font-serif); font-size: 3rem; font-weight: 900; letter-spacing: -1px; margin-bottom: 0.5rem; }
        .user-email-subtitle { color: #64748b; font-size: 1.1rem; }
        .btn-luxury-text { background: transparent; border: none; color: #64748b; font-size: 0.9rem; font-weight: 700; cursor: pointer; transition: color 0.3s; }
        .btn-luxury-text:hover { color: #f87171; }

        /* Grid */
        .luxury-grid-cart { display: grid; grid-template-columns: 1fr 400px; gap: 4rem; align-items: flex-start; }
        @media (max-width: 1000px) { .luxury-grid-cart { grid-template-columns: 1fr; } }

        /* Items */
        .cart-list-luxury { display: flex; flex-direction: column; gap: 1.5rem; }
        .cart-item-luxury { padding: 1.5rem; border-radius: 24px; display: flex; gap: 2rem; border: 1px solid rgba(255,255,255,0.03); transition: all 0.3s; }
        .cart-item-luxury:hover { transform: translateY(-3px); background: rgba(255,255,255,0.02); }
        
        .item-visual-luxury { width: 120px; height: 120px; border-radius: 16px; overflow: hidden; background: #0f172a; flex-shrink: 0; }
        .item-visual-luxury img { width: 100%; height: 100%; object-fit: cover; }
        .item-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2rem; opacity: 0.3; }

        .item-details-luxury { flex: 1; display: flex; flex-direction: column; }
        .item-header-luxury { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .item-name-luxury { font-size: 1.4rem; color: #fff; margin: 0; }
        .item-price-luxury { font-weight: 800; color: var(--accent-primary); font-size: 1.1rem; }
        .item-category-luxury { font-size: 0.85rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: auto; }

        .item-footer-luxury { display: flex; justify-content: space-between; align-items: center; margin-top: 1.5rem; }
        
        /* Quantity Luxury */
        .quantity-control-luxury { display: flex; align-items: center; background: rgba(255,255,255,0.05); border-radius: 12px; padding: 4px; gap: 0.5rem; }
        .qty-btn-luxury { width: 32px; height: 32px; border-radius: 8px; border: none; background: transparent; color: #fff; font-size: 1.2rem; cursor: pointer; transition: all 0.2s; }
        .qty-btn-luxury:hover { background: rgba(255,255,255,0.1); color: var(--accent-primary); }
        .qty-value-luxury { font-weight: 800; font-size: 1rem; color: #fff; min-width: 24px; text-align: center; }
        
        .remove-link-luxury { background: transparent; border: none; color: #f87171; font-size: 0.8rem; font-weight: 700; cursor: pointer; opacity: 0.6; transition: opacity 0.3s; }
        .remove-link-luxury:hover { opacity: 1; text-decoration: underline; }

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

        /* Empty State */
        .empty-state-luxury { padding: 6rem 2rem; border-radius: 40px; text-align: center; }
        .empty-icon-luxury { font-size: 4rem; display: block; margin-bottom: 2rem; filter: grayscale(1); opacity: 0.5; }
        .section-title-luxury { font-family: var(--font-serif); font-size: 2.5rem; font-weight: 900; color: #fff; margin-bottom: 1rem; }
        .empty-content p { color: #64748b; font-size: 1.1rem; max-width: 400px; margin: 0 auto; }

        /* Utils */
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

