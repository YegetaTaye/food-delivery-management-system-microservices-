/**
 * Layout Component
 *
 * Provides the main application shell with navigation.
 * Displays current user info and cart status.
 */
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useSearch } from "../context/SearchContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="layout customer-shell">
      {/* Premium Glassmorphic Header */}
      <header className="header glass">
        <div className="header-content container">
          <Link to="/products" className="brand">
            <div className="brand-logo-mini">🍔</div>
            <span className="brand-name gradient-text">FoodFlow</span>
          </Link>

          <div className="search-bar-wrapper">
            <input
              type="text"
              className="search-input"
              placeholder="Search for your favorite food..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>

          <nav className="nav">
            <Link to="/products" className="nav-item">Explore</Link>
            <Link to="/orders" className="nav-item">My Orders</Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" className="nav-item admin-link">Control Center ⚡</Link>
            )}
          </nav>

          <div className="actions">
            <Link to="/cart" className="action-btn cart-btn">
              <span className="icon">🛒</span>
              {itemCount > 0 && <span className="badge-pill pulse">{itemCount}</span>}
            </Link>

            <div className="profile-dropdown">
              <Link to="/profile" className="profile-btn">
                <div className="avatar-sm">
                  {user?.name?.[0] || user?.email?.[0]}
                </div>
              </Link>
              <button onClick={handleLogout} className="btn-logout-mini">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content container fade-in">
        <Outlet />
      </main>

      {/* Minimal Customer Footer */}
      <footer className="footer-customer">
        <div className="container footer-inner">
          <div className="footer-brand">
            <span className="gradient-text">FoodFlow</span>
            <p>The future of food delivery, powered by microservices.</p>
          </div>
          <div className="footer-links">
            <Link to="/profile">My Profile</Link>
            <Link to="/orders">Order History</Link>
          </div>
        </div>
      </footer>

      <style>{`
        .customer-shell {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #0a0a0b;
        }
        .container {
          max-width: 1440px;
          margin: 0 auto;
          width: 95%;
        }
        .header {
          position: sticky;
          top: 0;
          z-index: 1000;
          padding: 1rem 0;
          height: auto;
        }
        .header-content {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }
        .brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-decoration: none;
        }
        .brand-logo-mini {
          font-size: 1.5rem;
        }
        .brand-name {
          font-size: 1.5rem;
          font-weight: 800;
        }
        .search-bar-wrapper {
          flex: 1;
          position: relative;
          max-width: 500px;
        }
        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 99px;
          color: #fff;
          font-size: 1rem;
        }
        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0.5;
        }
        .nav {
          display: flex;
          gap: 1.5rem;
        }
        .nav-item {
          color: #94a3b8;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .nav-item:hover { color: #fff; }
        .admin-link {
          color: var(--accent-primary);
          border: 1px solid rgba(0, 212, 170, 0.2);
          padding: 0.25rem 0.75rem;
          border-radius: 8px;
          background: rgba(0, 212, 170, 0.05);
        }
        .admin-link:hover {
          background: var(--accent-primary);
          color: #000;
        }
        .actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .action-btn {
          position: relative;
          text-decoration: none;
          font-size: 1.25rem;
        }
        .badge-pill {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--accent-primary);
          color: #000;
          font-size: 0.7rem;
          font-weight: 800;
          min-width: 18px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 99px;
          border: 2px solid #0a0a0b;
        }
        .profile-dropdown {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .avatar-sm {
          width: 36px;
          height: 36px;
          background: var(--gradient-primary);
          border-radius: 99px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          font-weight: 800;
          font-size: 0.9rem;
        }
        .btn-logout-mini {
          background: transparent;
          border: none;
          color: #64748b;
          font-size: 0.75rem;
          cursor: pointer;
        }
        .main-content {
          padding: 2rem 0;
          flex: 1;
        }
        .footer-customer {
          padding: 4rem 0 2rem;
          background: #050507;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          margin-top: 4rem;
        }
        .footer-inner {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .footer-brand p {
          color: #64748b;
          font-size: 0.85rem;
          margin-top: 0.5rem;
        }
        .footer-links {
          display: flex;
          gap: 2rem;
        }
        .footer-links a {
          color: #64748b;
          text-decoration: none;
          font-size: 0.85rem;
        }
        .fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
