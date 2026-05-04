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
    <div className="auth-page customer-theme">
      <div className="auth-container glass">
        <div className="auth-header">
          <div className="brand-logo">
            <span className="logo-icon">🍔</span>
          </div>
          <h1 className="welcome-text">Welcome Back</h1>
          <p className="auth-subtitle">Delicious food is just a login away</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message customer-error">{error}</div>}

          <div className="form-group">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              autoComplete="email"
              className="customer-input"
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              autoComplete="current-password"
              className="customer-input"
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" /> <span>Remember me</span>
            </label>
            <a href="#" className="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" className="btn-customer-primary" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="demo-access">
            <button 
              type="button" 
              onClick={() => { setEmail('admin@foodflow.com'); setPassword('adminpassword'); }}
              className="btn-demo-admin"
            >
              Demo Admin Access ⚡
            </button>
          </div>
        </form>

        <div className="auth-footer">
          <p>New to FoodFlow? <Link to="/signup" className="signup-link">Create an account</Link></p>
        </div>
      </div>

      <style>{`
        .customer-theme {
          background: #0a0a0b !important;
          background-image: 
            radial-gradient(at 0% 0%, rgba(0, 212, 170, 0.05) 0px, transparent 50%),
            radial-gradient(at 100% 100%, rgba(124, 58, 237, 0.05) 0px, transparent 50%) !important;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        .auth-container {
          max-width: 400px !important;
          width: 90%;
          padding: 3.5rem 2.5rem;
          border-radius: 24px !important;
          text-align: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
        }
        .brand-logo {
          width: 70px;
          height: 70px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          font-size: 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .welcome-text {
          font-size: 2rem;
          font-weight: 800;
          letter-spacing: -0.025em;
          margin-bottom: 0.5rem;
          color: #fff;
        }
        .auth-subtitle {
          color: #94a3b8;
          font-size: 0.95rem;
          margin-bottom: 2.5rem;
        }
        .customer-input {
          width: 100%;
          padding: 1rem 1.25rem;
          background: rgba(255, 255, 255, 0.03) !important;
          border: 1px solid rgba(255, 255, 255, 0.08) !important;
          border-radius: 14px !important;
          color: #fff !important;
          font-size: 1rem;
          margin-bottom: 1rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .customer-input:focus {
          border-color: var(--accent-primary) !important;
          background: rgba(255, 255, 255, 0.05) !important;
          outline: none;
          box-shadow: 0 0 0 4px rgba(0, 212, 170, 0.1);
        }
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          font-size: 0.85rem;
          color: #94a3b8;
        }
        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }
        .forgot-link {
          color: var(--accent-primary);
          text-decoration: none;
        }
        .btn-customer-primary {
          width: 100%;
          padding: 1rem;
          background: var(--accent-primary) !important;
          color: #000 !important;
          border: none;
          border-radius: 14px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .btn-customer-primary:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .btn-customer-primary:active {
          transform: translateY(0);
        }
        .customer-error {
          background: rgba(239, 68, 68, 0.1) !important;
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5 !important;
          padding: 0.75rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.875rem;
        }
        .auth-footer {
          margin-top: 2.5rem;
          font-size: 0.9rem;
          color: #64748b;
        }
        .signup-link {
          color: #fff;
          font-weight: 600;
          text-decoration: none;
          margin-left: 0.25rem;
        }
        .signup-link:hover {
          text-decoration: underline;
        }
        .demo-access {
          margin-top: 1.5rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
        }
        .btn-demo-admin {
          background: transparent;
          border: 1px solid rgba(0, 212, 170, 0.2);
          color: var(--accent-primary);
          padding: 0.6rem 1rem;
          border-radius: 10px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-demo-admin:hover {
          background: rgba(0, 212, 170, 0.1);
          border-color: var(--accent-primary);
        }
      `}</style>
    </div>
  );
}

