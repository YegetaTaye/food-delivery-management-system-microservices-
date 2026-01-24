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
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProductsPage from "./pages/ProductsPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import OrdersPage from "./pages/OrdersPage";
import NotificationsPage from "./pages/NotificationsPage";

/**
 * ProtectedRoute - Guards routes that require authentication
 * Redirects to login if user is not authenticated
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading-screen">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes - Authentication */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Routes - Require JWT Authentication */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Product Browsing - Fetches from Product Service via API Gateway */}
        <Route index element={<Navigate to="/products" replace />} />
        <Route path="products" element={<ProductsPage />} />

        {/* Cart Management - Frontend-only state, no backend calls */}
        <Route path="cart" element={<CartPage />} />

        {/* Checkout Flow - Creates order via Order Service */}
        <Route path="checkout" element={<CheckoutPage />} />

        {/* Order Confirmation - Displays order & payment status */}
        <Route path="confirmation/:orderId" element={<ConfirmationPage />} />

        {/* Order History - Fetches from Order Service */}
        <Route path="orders" element={<OrdersPage />} />

        {/* Notifications - Fetches from Notification Service */}
        <Route path="notifications" element={<NotificationsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/products" replace />} />
    </Routes>
  );
}
