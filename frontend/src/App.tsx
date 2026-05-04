/**
 * App Component - Main Router Configuration
 *
 * Defines the application routes that map to the microservices workflow:
 *
 * Route Flow:
 * /login, /signup → User Service (authentication)
 * /products → Product Service (browse catalog)
 * /cart → Frontend-only cart management
 * /checkout → Order Service (create order) + Payment Service (process payment)
 * /confirmation → Display order & payment status
 */
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import OrdersPage from "./pages/OrdersPage";
import NotificationsPage from "./pages/NotificationsPage";
import SystemStatusPage from "./pages/SystemStatusPage";
import ProfilePage from "./pages/ProfilePage";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import AdminSecurityPage from "./pages/AdminSecurityPage";

/**
 * ProtectedRoute - Guards routes that require authentication
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-screen">Loading Sanctuary...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * AdminRoute - Guards routes that require ADMIN privileges
 */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-screen">Verifying Clearances...</div>;
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes - Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Admin Dashboard Routes - Dedicated Command Center */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/status" replace />} />
        <Route path="status" element={<SystemStatusPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="security" element={<AdminSecurityPage />} />
      </Route>

      {/* Customer Interface Routes - Quiet Luxury Shell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/products" replace />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="confirmation/:orderId" element={<ConfirmationPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}
