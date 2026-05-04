import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { User } from '../types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await adminApi.getAllUsers();
        // Defensive check: handle both array and object responses
        const usersList = Array.isArray(data) ? data : (data as any)?.users || [];
        setUsers(usersList);
      } catch (err) {
        console.error('Failed to fetch personnel:', err);
        setError('Communications Failure: Unable to recover personnel matrix.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (isLoading) return (
    <div className="admin-loading-container">
      <div className="loading-pulse" />
      <span>Decoding Personnel Matrix...</span>
    </div>
  );

  if (error) return (
    <div className="admin-error-container glass">
      <div className="error-icon">⚠️</div>
      <div className="error-text">{error}</div>
      <button onClick={() => window.location.reload()} className="retry-btn">Re-initialize</button>
    </div>
  );

  return (
    <div className="admin-page fade-in">
      <div className="admin-header-flex">
        <div>
          <h1 className="admin-page-title">Personnel Matrix</h1>
          <p className="admin-page-subtitle">Identity management and access authorization database</p>
        </div>
        <div className="admin-actions">
          <button className="action-btn-primary glass">Add Identity</button>
        </div>
      </div>

      <div className="matrix-stats grid-3">
        <div className="stat-card glass">
          <span className="label">Active Identities</span>
          <span className="value">{users.length}</span>
          <div className="stat-trend neutral">Operational</div>
        </div>
        <div className="stat-card glass">
          <span className="label">Admin Access</span>
          <span className="value">{users.filter(u => u.role === 'ADMIN').length}</span>
          <div className="stat-trend safe">Secure</div>
        </div>
        <div className="stat-card glass">
          <span className="label">System Load</span>
          <span className="value">Low</span>
          <div className="stat-trend safe">Optimal</div>
        </div>
      </div>

      <div className="admin-table-container glass">
        {users.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📂</span>
            <p>No identities recovered from the database.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Identity Name</th>
                <th>Authentication / Email</th>
                <th>Authorization</th>
                <th>Registration</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="admin-tr">
                  <td>
                    <div className="user-details">
                      <div className="user-avatar-sm">
                        {user.name?.charAt(0) || '?'}
                      </div>
                      <div className="user-name">{user.name || 'Anonymous Entity'}</div>
                    </div>
                  </td>
                  <td>
                    <span className="email-mono">{user.email}</span>
                  </td>
                  <td>
                    <span className={`role-badge ${user.role?.toLowerCase() || 'user'}`}>
                      {user.role || 'USER'}
                    </span>
                  </td>
                  <td>
                    <span className="date-text">{new Date(user.createdAt).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-btn" title="Edit Authorization">✏️</button>
                      <button className="icon-btn delete" title="Terminate Identity">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .role-badge {
          font-size: 0.65rem;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
        }

        .role-badge.admin {
          background: rgba(0, 212, 170, 0.1);
          color: var(--accent-primary);
          border: 1px solid rgba(0, 212, 170, 0.2);
        }

        .role-badge.user {
          background: rgba(59, 130, 246, 0.1);
          color: #3b82f6;
          border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .date-text {
          color: #64748b;
          font-size: 0.85rem;
          font-family: var(--font-mono);
        }
      `}</style>

    </div>
  );
}
