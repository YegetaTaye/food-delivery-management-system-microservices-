/**
 * Authentication Context
 * 
 * Manages the authentication state across the entire application.
 * This context handles:
 * - JWT token storage and retrieval
 * - User login/logout flow
 * - Current user state
 * 
 * Integration with User Service:
 * - Login: POST /api/v1/auth/login → receives JWT
 * - Register: POST /api/v1/auth/register → receives JWT
 * - Get Profile: GET /api/v1/users/me → requires JWT in header
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, LoginRequest, RegisterRequest } from '../types';
import { authApi, getAuthToken, clearAuthToken } from '../services/api';

interface AuthContextType {
  // Current authenticated user (from User Service)
  user: User | null;
  // Whether user is logged in (has valid JWT)
  isAuthenticated: boolean;
  // Loading state during initial auth check
  isLoading: boolean;
  // Login function - calls User Service
  login: (credentials: LoginRequest) => Promise<void>;
  // Register function - calls User Service
  register: (data: RegisterRequest) => Promise<void>;
  // Logout function - clears JWT locally
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Check for existing auth session on mount
   * If JWT exists in storage, validate it by fetching user profile
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          // Validate token by fetching user profile from User Service
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        } catch {
          // Token invalid or expired - clear it
          clearAuthToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login Handler
   * 
   * Flow:
   * 1. Send credentials to User Service via API Gateway
   * 2. User Service validates credentials
   * 3. User Service returns JWT token
   * 4. Store JWT for future requests
   * 5. Fetch user profile to populate context
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    await authApi.login(credentials);
    // After successful login, fetch user profile
    const userData = await authApi.getCurrentUser();
    setUser(userData);
  }, []);

  /**
   * Register Handler
   * 
   * Flow:
   * 1. Send registration data to User Service via API Gateway
   * 2. User Service creates new user account
   * 3. User Service returns JWT token
   * 4. Store JWT for future requests
   * 5. Fetch user profile to populate context
   */
  const register = useCallback(async (data: RegisterRequest) => {
    await authApi.register(data);
    const userData = await authApi.getCurrentUser();
    setUser(userData);
  }, []);

  /**
   * Logout Handler
   * 
   * Note: JWT is stateless, so we only need to clear local storage.
   * In a production system, you might also want to:
   * - Call a logout endpoint to invalidate the token server-side
   * - Clear any server-side sessions
   */
  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 * Throws error if used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

