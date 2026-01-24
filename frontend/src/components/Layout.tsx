/**
 * Layout Component
 *
 * Provides the main application shell with navigation.
 * Displays current user info and cart status.
 */
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="layout">
      {/* Navigation Header */}
      <header className="header">
        <div className="header-content">
          <Link to="/products" className="logo">
            <span className="logo-icon">◈</span>
            <span className="logo-text">FoodFlow</span>
          </Link>

          <nav className="nav">
            <Link to="/products" className="nav-link">
              Products
            </Link>
            <Link to="/orders" className="nav-link">
              Orders
            </Link>
            <Link to="/notifications" className="nav-link">
              Notifications
            </Link>
            <Link to="/cart" className="nav-link cart-link">
              Cart
              {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
            </Link>
          </nav>

          <div className="user-menu">
            <span className="user-name">{user?.name || user?.email}</span>
            <button onClick={handleLogout} className="btn btn-ghost">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer with microservices info */}
      <footer className="footer">
        <div className="footer-content">
          <span className="footer-text">
            Microservices Demo: User → Product → Cart → Order → Payment →
            Notification
          </span>
        </div>
      </footer>
    </div>
  );
}
