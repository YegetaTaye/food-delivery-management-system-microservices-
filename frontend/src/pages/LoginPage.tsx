/**
 * Login Page
 * 
 * Authenticates users via the User Service.
 * 
 * API Integration:
 * - POST /api/v1/auth/login → User Service
 * - Returns JWT token on success
 * - Token is stored and used for all subsequent API calls
 * 
 * Flow:
 * 1. User enters email and password
 * 2. Frontend sends credentials to API Gateway
 * 3. API Gateway routes to User Service
 * 4. User Service validates, returns JWT
 * 5. Frontend stores JWT, fetches user profile
 * 6. Redirect to products page
 */
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ApiError } from '../types';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Call User Service via API Gateway
      await login({ email, password });
      // Redirect to products page on success
      navigate('/products');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <span className="auth-logo">◈</span>
          <h1>Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        {/* Service indicator */}
        <div className="service-indicator">
          <span className="service-badge">User Service</span>
          <span className="endpoint-badge">POST /api/v1/auth/login</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

