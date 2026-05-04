import { useState, useEffect } from 'react';
import { systemApi } from '../services/api';
import { SecurityEvent } from '../types';

export default function AdminSecurityPage() {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSecurityLogs = async () => {
      try {
        const data = await systemApi.getSecurityEvents();
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch security logs:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSecurityLogs();
    const interval = setInterval(fetchSecurityLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) return <div className="admin-loading">Decrypting Security Logs...</div>;

  return (
    <div className="admin-page fade-in">
      <div className="admin-header-flex">
        <div>
          <h1 className="admin-page-title">Security Audits</h1>
          <p className="admin-page-subtitle">Historical analysis of system access and threat mitigation</p>
        </div>
        <div className="admin-stats-mini">
          <div className="stat-mini glass">
            <span className="label">Mitigated Threats</span>
            <span className="value">124</span>
          </div>
          <div className="stat-mini glass">
            <span className="label">Trust Level</span>
            <span className="value status-passed">99.9%</span>
          </div>
        </div>
      </div>

      <div className="security-dashboard-grid">
        <div className="security-main-feed glass">
          <div className="section-header-luxury">
            <h2 className="section-title-luxury">Live Audit Stream</h2>
            <span className="pulse-tag">REAL-TIME</span>
          </div>
          <div className="audit-feed">
            {events.map((event) => (
              <div key={event.id} className={`audit-entry severity-${event.severity.toLowerCase()}`}>
                <div className="entry-icon">
                  {event.severity === 'CRITICAL' ? '🔴' : event.severity === 'HIGH' ? '🟠' : '🟢'}
                </div>
                <div className="entry-content">
                  <div className="entry-header">
                    <span className="entry-type">{event.type}</span>
                    <span className="entry-time">{new Date(event.timestamp).toLocaleString()}</span>
                  </div>
                  <p className="entry-message">{event.message}</p>
                </div>
                <div className={`entry-severity ${event.severity.toLowerCase()}`}>
                  {event.severity}
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="security-sidebar">
          <div className="config-card glass mb-6">
            <h3 className="insight-title">Access Intelligence</h3>
            <div className="config-list">
              <div className="config-item">
                <span className="label">Global Firewall</span>
                <span className="value status-passed">Active</span>
              </div>
              <div className="config-item">
                <span className="label">DDoS Shield</span>
                <span className="value status-passed">Enabled</span>
              </div>
              <div className="config-item">
                <span className="label">API Hardening</span>
                <span className="value">v4.1</span>
              </div>
            </div>
          </div>

          <div className="config-card glass">
            <h3 className="insight-title">Threat Origin (Simulated)</h3>
            <div className="threat-origins">
              {[
                { country: 'Unknown Proxy', count: 12, level: 'High' },
                { country: 'Tor Exit Node', count: 8, level: 'Medium' },
                { country: 'Crawler Bot', count: 45, level: 'Low' },
              ].map(origin => (
                <div key={origin.country} className="origin-item">
                  <div className="origin-info">
                    <span className="origin-name">{origin.country}</span>
                    <span className="origin-count">{origin.count} attempts</span>
                  </div>
                  <div className="origin-bar-bg">
                    <div className={`origin-bar ${origin.level.toLowerCase()}`} style={{ width: `${(origin.count / 50) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .security-dashboard-grid {
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 2.5rem;
        }

        .security-main-feed {
          padding: 2rem;
          border-radius: 24px;
        }

        .audit-feed {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-height: 800px;
          overflow-y: auto;
          padding-right: 1rem;
        }

        .audit-entry {
          display: flex;
          gap: 1.5rem;
          padding: 1.25rem;
          background: rgba(255, 255, 255, 0.02);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.03);
          align-items: center;
          transition: all 0.2s;
        }

        .audit-entry:hover {
          background: rgba(255, 255, 255, 0.04);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .entry-content {
          flex: 1;
        }

        .entry-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.25rem;
        }

        .entry-type {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--accent-primary);
        }

        .entry-time {
          font-size: 0.75rem;
          color: #475569;
        }

        .entry-message {
          font-size: 0.9rem;
          color: #94a3b8;
          margin: 0;
        }

        .entry-severity {
          font-size: 0.65rem;
          font-weight: 900;
          padding: 4px 8px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .entry-severity.low { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        .entry-severity.medium { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
        .entry-severity.high { background: rgba(239, 68, 68, 0.1); color: #ef4444; }

        .threat-origins {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .origin-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .origin-info {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
        }

        .origin-name { font-weight: 700; color: #fff; }
        .origin-count { color: #64748b; }

        .origin-bar-bg {
          height: 4px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 2px;
        }

        .origin-bar {
          height: 100%;
          border-radius: 2px;
        }

        .origin-bar.high { background: #ef4444; }
        .origin-bar.medium { background: #f59e0b; }
        .origin-bar.low { background: #3b82f6; }

        .status-passed { color: #10b981; }
        .mb-6 { margin-bottom: 1.5rem; }
      `}</style>
    </div>
  );
}
