/**
 * Notifications Page
 *
 * Displays notifications for the current user.
 *
 * API Integration:
 * - GET /api/v1/notifications?userId=:userId&limit=:limit → Notification Service
 *
 * This page shows all notifications for the authenticated user,
 * demonstrating the Notification Service's query capabilities.
 */
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { notificationsApi } from "../services/api";
import type { Notification, ApiError } from "../types";

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState<number>(20);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const data = await notificationsApi.getUserNotifications(limit);
        // Sort by date, newest first
        setNotifications(
          data.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          ),
        );
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || "Failed to load notifications");
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [user, limit]);

  const getNotificationIcon = (eventName: string) => {
    const event = eventName.toLowerCase();
    if (event.includes("order")) {
      return "📦";
    }
    if (event.includes("payment")) {
      return "💳";
    }
    if (event.includes("delivery")) {
      return "🚚";
    }
    if (event.includes("promotion") || event.includes("promo")) {
      return "🎁";
    }
    if (event.includes("system")) {
      return "⚙️";
    }
    return "🔔";
  };

  const getNotificationTitle = (eventName: string) => {
    // Convert event name to readable title
    return eventName
      .split(".")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner" />
        <p>Loading notifications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="btn btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="page-header">
        <h1>Notifications</h1>
        <p className="page-description">
          {notifications.length} notification
          {notifications.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Service indicator */}
      <div className="service-indicator">
        <span className="service-badge">Notification Service</span>
        <span className="endpoint-badge">
          GET /api/v1/notifications?userId={user?.id?.slice(0, 8)}...&limit=
          {limit} | Header: X-User-Id (from localStorage)
        </span>
      </div>

      {/* Limit selector */}
      <div className="notification-controls">
        <label htmlFor="limit-select" className="limit-label">
          Show:
        </label>
        <select
          id="limit-select"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="limit-select"
        >
          <option value={10}>10 notifications</option>
          <option value={20}>20 notifications</option>
          <option value={50}>50 notifications</option>
          <option value={100}>100 notifications</option>
        </select>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔔</div>
          <h2>No notifications yet</h2>
          <p>You'll be notified about orders, payments, and more.</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div key={notification.id} className="notification-card">
              <div className="notification-icon">
                {getNotificationIcon(notification.eventName)}
              </div>
              <div className="notification-content">
                <div className="notification-header">
                  <h3 className="notification-title">
                    {getNotificationTitle(notification.eventName)}
                  </h3>
                  <span className="notification-time">
                    {formatTimestamp(notification.createdAt)}
                  </span>
                </div>
                <p className="notification-message">{notification.message}</p>
                {notification.metadata &&
                  Object.keys(notification.metadata).length > 0 && (
                    <div className="notification-metadata">
                      {Object.entries(notification.metadata).map(
                        ([key, value]) => (
                          <span key={key} className="metadata-item">
                            <strong>{key}:</strong> {String(value)}
                          </span>
                        ),
                      )}
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
