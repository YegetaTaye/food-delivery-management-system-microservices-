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
    <div className="cart-page">
      <div className="page-header">
        <h1>Your Cart</h1>
        <p className="page-description">Review your items before checkout</p>
      </div>

      {/* Service indicator */}
      <div className="service-indicator">
        <span className="service-badge frontend">Frontend Only</span>
        <span className="endpoint-badge">No Backend Calls</span>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some delicious items to get started!</p>
          <Link to="/products" className="btn btn-primary">
            Browse Menu
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.product.id} className="cart-item">
                <div className="cart-item-image">
                  {item.product.imageUrl ? (
                    <img src={item.product.imageUrl} alt={item.product.name} />
                  ) : (
                    <div className="cart-item-image-placeholder">🍽️</div>
                  )}
                </div>
                <div className="cart-item-details">
                  <h3>{item.product.name}</h3>
                  <span className="cart-item-price">
                    ${item.product.price.toFixed(2)} each
                  </span>
                </div>
                <div className="cart-item-quantity">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="qty-btn"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="qty-btn"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <div className="cart-item-total">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="cart-item-remove"
                  aria-label="Remove item"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="cart-summary-content">
              <h2>Order Summary</h2>
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
              <button
                onClick={handleCheckout}
                className="btn btn-primary btn-full"
                disabled={items.length === 0}
              >
                Proceed to Checkout
              </button>
              <button
                onClick={clearCart}
                className="btn btn-ghost btn-full"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

