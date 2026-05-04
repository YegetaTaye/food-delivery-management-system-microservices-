import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Order } from '../types';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await adminApi.getAllOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Communications Failure: Unable to retrieve order intelligence.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await adminApi.updateOrderStatus(orderId, newStatus);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  if (isLoading) return (
    <div className="admin-loading-container">
      <div className="loading-pulse" />
      <span>Decoding Global Order Intelligence...</span>
    </div>
  );

  if (error) return (
    <div className="admin-error-container glass">
      <div className="error-icon">⚠️</div>
      <div className="error-text">{error}</div>
      <button onClick={() => window.location.reload()} className="retry-btn">Re-initialize</button>
    </div>
  );

  const totalRevenue = orders.reduce((acc, curr) => acc + (typeof curr.totalAmount === 'number' ? curr.totalAmount : 0), 0);

  return (
    <div className="admin-page fade-in">
      <div className="admin-header-flex">
        <div>
          <h1 className="admin-page-title">Order Intelligence</h1>
          <p className="admin-page-subtitle">Real-time monitoring of global fulfillment pipeline</p>
        </div>
        <div className="admin-stats-mini">
          <div className="stat-mini glass">
            <span className="label">Total Volume</span>
            <span className="value">${totalRevenue.toLocaleString()}</span>
          </div>
          <div className="stat-mini glass">
            <span className="label">Active Flows</span>
            <span className="value">{orders.filter(o => o.status !== 'CANCELLED' && o.status !== 'DELIVERED').length}</span>
          </div>
        </div>
      </div>

      <div className="admin-table-container glass">
        {orders.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🛰️</span>
            <p>No active order flows detected in the system.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order Hash</th>
                <th>Identity Intel</th>
                <th>Resources</th>
                <th>Total Value</th>
                <th>Pipeline Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="admin-tr">
                  <td>
                    <span className="order-id-mono">#{order.id.substring(0, 8)}</span>
                  </td>
                  <td>
                    <div className="user-details">
                      <div className="user-name">Entity: {order.userId.substring(0, 8)}</div>
                      <div className="user-email">{new Date(order.createdAt).toLocaleString()}</div>
                    </div>
                  </td>
                  <td>
                    <div className="order-intel">
                      <span className="intel-pill">{order.orderItems?.length || 0} Units</span>
                    </div>
                  </td>
                  <td>
                    <span className="order-value">${Number(order.totalAmount).toFixed(2)}</span>
                  </td>
                  <td>
                    <select 
                      className={`status-select ${order.status?.toLowerCase() || 'pending'}`}
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PREPARING">PREPARING</option>
                      <option value="ON_THE_WAY">ON_THE_WAY</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </td>
                  <td>
                    <button className="action-btn-sm glass">Audit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .order-id-mono {
          font-family: var(--font-mono);
          color: var(--accent-primary);
          font-weight: 700;
          font-size: 0.85rem;
        }

        .order-intel {
          display: flex;
          gap: 0.5rem;
        }

        .intel-pill {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 2px 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          color: #94a3b8;
        }

        .order-value {
          font-weight: 800;
          color: #fff;
          font-family: var(--font-mono);
        }

        .status-select {
          background: #0a0a0f;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 0.5rem;
          border-radius: 8px;
          font-size: 0.75rem;
          font-weight: 800;
          cursor: pointer;
          outline: none;
          transition: all 0.2s;
        }

        .status-select:hover {
          border-color: var(--accent-primary);
        }

        .status-select.pending { color: #f59e0b; border-color: rgba(245, 158, 11, 0.3); }
        .status-select.preparing { color: #3b82f6; border-color: rgba(59, 130, 246, 0.3); }
        .status-select.on_the_way { color: #8b5cf6; border-color: rgba(139, 92, 246, 0.3); }
        .status-select.delivered { color: #10b981; border-color: rgba(16, 185, 129, 0.3); }
        .status-select.cancelled { color: #ef4444; border-color: rgba(239, 68, 68, 0.3); }

        .admin-stats-mini {
          display: flex;
          gap: 1rem;
        }

        .stat-mini {
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .stat-mini .label {
          font-size: 0.65rem;
          font-weight: 800;
          color: #64748b;
          text-transform: uppercase;
        }

        .stat-mini .value {
          font-size: 1.1rem;
          font-weight: 800;
          color: #fff;
          font-family: var(--font-mono);
        }

        .action-btn-sm {
          padding: 0.4rem 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 800;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-btn-sm:hover {
          background: var(--accent-primary);
          color: #000;
        }
      `}</style>

    </div>
  );
}
