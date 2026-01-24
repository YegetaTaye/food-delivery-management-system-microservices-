/**
 * Main Entry Point
 *
 * This file bootstraps the React application and wraps it with
 * necessary context providers for global state management.
 *
 * Provider Hierarchy:
 * - AuthProvider: Manages JWT token and user authentication state
 * - CartProvider: Manages shopping cart state (frontend-only, no backend)
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
