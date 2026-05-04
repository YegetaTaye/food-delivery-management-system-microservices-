import { useState, useEffect } from 'react';
import { adminApi } from '../services/api';
import { Product } from '../types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const analytics = await adminApi.getInventoryAnalytics();
        setProducts(analytics.products || []);
      } catch (err) {
        console.error('Failed to fetch inventory:', err);
        setError('Communications Failure: Unable to sync with Arsenal database.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInventory();
  }, []);

  if (isLoading) return (
    <div className="admin-loading-container">
      <div className="loading-pulse" />
      <span>Syncing Tactical Arsenal...</span>
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
          <h1 className="admin-page-title">Inventory Control</h1>
          <p className="admin-page-subtitle">Strategic management of product availability and stock levels</p>
        </div>
        <div className="admin-actions">
          <button className="action-btn-primary glass">New Arsenal Item</button>
        </div>
      </div>

      <div className="matrix-stats grid-3">
        <div className="stat-card glass">
          <span className="label">Total SKUs</span>
          <span className="value">{products.length}</span>
          <div className="stat-trend neutral">Catalog Synced</div>
        </div>
        <div className="stat-card glass">
          <span className="label">Critical Stock</span>
          <span className="value">{products.filter(p => p.stock < 10).length}</span>
          <div className="stat-trend warning">Action Required</div>
        </div>
        <div className="stat-card glass">
          <span className="label">Arsenal Health</span>
          <span className="value">94%</span>
          <div className="stat-trend safe">Combat Ready</div>
        </div>
      </div>

      <div className="admin-table-container glass">
        {products.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">📦</span>
            <p>Tactical Arsenal is currently empty.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product Identifier</th>
                <th>Category / Intel</th>
                <th>Tactical Value</th>
                <th>Stock / Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="admin-tr">
                  <td>
                    <div className="user-details">
                      <div className="user-avatar-sm">
                        {product.name?.charAt(0) || '?'}
                      </div>
                      <div className="user-name">{product.name}</div>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{product.category?.name || 'Uncategorized'}</span>
                  </td>
                  <td>
                    <span className="price-text">${Number(product.price).toFixed(2)}</span>
                  </td>
                  <td>
                    <div className="stock-display">
                      <span className={`stock-value ${product.stock < 10 ? 'low' : ''}`}>
                        {product.stock} Units
                      </span>
                      <span className={`availability-dot ${product.isAvailable ? 'online' : 'offline'}`} />
                    </div>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-btn" title="Edit Specs">✏️</button>
                      <button className="icon-btn delete" title="Decommission Item">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .price-text {
          font-weight: 900;
          color: #fff;
          font-family: var(--font-mono);
          font-size: 1.1rem;
          text-shadow: 0 0 10px rgba(255, 255, 255, 0.1);
        }

        .stock-display {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .stock-value {
          font-weight: 800;
          font-size: 0.95rem;
          font-family: var(--font-mono);
        }

        .stock-value.low {
          color: #ef4444;
          text-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
          animation: pulse-danger 2s infinite;
        }

        @keyframes pulse-danger {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .availability-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .availability-dot.online {
          background: var(--accent-primary);
          box-shadow: 0 0 12px var(--accent-primary);
        }

        .availability-dot.offline {
          background: #334155;
          box-shadow: inset 0 0 4px rgba(0,0,0,0.5);
        }

        .category-badge {
          font-size: 0.7rem;
          font-weight: 900;
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
          background: rgba(124, 58, 237, 0.1);
          color: #a78bfa;
          border: 1px solid rgba(124, 58, 237, 0.2);
          letter-spacing: 0.05em;
        }

        .admin-error-container {
          padding: 4rem;
          text-align: center;
          border-radius: 32px;
          margin-top: 10vh;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.1);
        }

        .error-icon { font-size: 4rem; margin-bottom: 1.5rem; filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.3)); }
        .error-text { font-size: 1.25rem; color: #fff; margin-bottom: 2.5rem; font-weight: 700; letter-spacing: -0.01em; }
        
        .retry-btn {
          padding: 1rem 3rem;
          background: var(--accent-primary);
          color: #000;
          border: none;
          border-radius: 16px;
          font-weight: 900;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.3s;
        }

        .retry-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 30px rgba(0, 212, 170, 0.4);
        }

        .action-btn-primary {
          padding: 0.8rem 2rem;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: #fff;
          border: none;
          border-radius: 14px;
          font-weight: 800;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.3s;
        }

        .action-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px -10px var(--accent-primary);
        }
      `}</style>

    </div>
  );
}
