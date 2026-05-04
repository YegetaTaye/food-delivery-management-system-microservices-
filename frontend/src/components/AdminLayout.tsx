import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: string;
  badgeColor?: string;
}

const SidebarItem = ({ to, icon, label, active, badge, badgeColor }: SidebarItemProps) => (
  <Link to={to} className={`admin-nav-item ${active ? 'active' : ''}`}>
    <div className="nav-item-glow" />
    <span className="item-icon">{icon}</span>
    <span className="item-label">{label}</span>
    {badge && (
      <span className="nav-badge" style={{ backgroundColor: badgeColor || 'var(--accent-primary)' }}>
        {badge}
      </span>
    )}
    {active && <div className="active-beam" />}
  </Link>
);

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const pulseTimer = setInterval(() => setPulse(p => (p + 1) % 100), 3000);
    return () => {
      clearInterval(timer);
      clearInterval(pulseTimer);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { 
      label: 'Strategic Overview', 
      to: '/admin', 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
        </svg>
      )
    },
    { 
      label: 'Order Intelligence', 
      to: '/admin/orders', 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      ),
      badge: 'LIVE',
      badgeColor: '#ef4444'
    },
    { 
      label: 'Inventory Control', 
      to: '/admin/products', 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="M3.27 6.96L12 12.01l8.73-5.05" /><path d="M12 22.08V12" />
        </svg>
      )
    },
    { 
      label: 'Personnel Matrix', 
      to: '/admin/users', 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    },
    { 
      label: 'System Telemetry', 
      to: '/system-status', 
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      )
    },
  ];

  return (
    <div className="admin-shell">
      {/* Sidebar Command Center */}
      <aside className={`admin-sidebar glass ${isSidebarOpen ? 'expanded' : ''}`}>
        <div className="sidebar-header">
          <div className="admin-brand">
            <div className="brand-orb">
              <div className="orb-pulse" />
            </div>
            <div className="brand-text-container">
              <span className="brand-name">FOODFLOW</span>
              <span className="brand-tag">COMMAND CENTER</span>
            </div>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? '«' : '»'}
          </button>
        </div>

        <nav className="admin-nav">
          <div className="nav-group">
            <span className="group-label">Operations</span>
            {navItems.slice(0, 3).map((item) => (
              <SidebarItem
                key={item.to}
                {...item}
                active={location.pathname === item.to}
              />
            ))}
          </div>

          <div className="nav-group">
            <span className="group-label">Infrastructure</span>
            {navItems.slice(3).map((item) => (
              <SidebarItem
                key={item.to}
                {...item}
                active={location.pathname === item.to}
              />
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="telemetry-box">
            <div className="tel-row">
              <span className="tel-label">UPLINK</span>
              <span className="tel-value online">STABLE</span>
            </div>
            <div className="tel-row">
              <span className="tel-label">LATENCY</span>
              <span className="tel-value">24ms</span>
            </div>
            <div className="tel-progress">
              <div className="progress-fill" style={{ width: `${pulse}%` }} />
            </div>
          </div>

          <div className="footer-actions">
            <Link to="/products" className="footer-btn glass">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              {isSidebarOpen && <span>Exit Hub</span>}
            </Link>
            <button onClick={handleLogout} className="footer-btn logout glass">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16">
                <path d="M18.36 6.64a9 9 0 1 1-12.73 0" /><line x1="12" y1="2" x2="12" y2="12" />
              </svg>
              {isSidebarOpen && <span>Lock Down</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Command Area */}
      <main className="admin-main">
        <header className="admin-top-bar glass">
          <div className="top-bar-left">
            <div className="breadcrumb-nav">
              <span className="bread-root">MAINFRAME</span>
              <div className="bread-sep" />
              <span className="bread-current">
                {navItems.find(i => i.to === location.pathname)?.label?.toUpperCase() || 'DASHBOARD'}
              </span>
            </div>
          </div>
          <div className="top-bar-right">
            <div className="system-clock">
              <span className="clock-label">SYS_TIME</span>
              <span className="clock-value">{currentTime.toLocaleTimeString([], { hour12: false })}</span>
            </div>
            <div className="admin-profile-pill glass">
              <div className="profile-status online" />
              <span className="admin-username">{user?.name || 'Administrator'}</span>
              <div className="admin-avatar">
                {user?.name?.[0] || 'A'}
              </div>
            </div>
          </div>
        </header>

        <div className="admin-content-scroll">
          <div className="admin-inner-content">
            <Outlet />
          </div>
        </div>
      </main>

      <style>{`
        :root {
          --sidebar-width: 280px;
          --sidebar-collapsed-width: 88px;
          --accent-primary: #00d4aa;
          --accent-secondary: #7c3aed;
          --bg-dark: #020204;
          --glass-bg: rgba(255, 255, 255, 0.03);
          --glass-border: rgba(255, 255, 255, 0.08);
          --text-muted: #64748b;
          --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
        }

        .admin-shell {
          height: 100vh;
          display: grid;
          grid-template-columns: var(--sidebar-collapsed-width) 1fr;
          background: var(--bg-dark);
          color: #fff;
          overflow: hidden;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          transition: grid-template-columns 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .admin-shell:has(.admin-sidebar.expanded) {
          grid-template-columns: var(--sidebar-width) 1fr;
        }

        /* Sidebar */
        .admin-sidebar {
          background: rgba(10, 10, 15, 0.8);
          border-right: 1px solid var(--glass-border);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 0.75rem;
          z-index: 1000;
          overflow: hidden;
          position: relative;
        }

        .sidebar-header {
          margin-bottom: 2.5rem;
          padding: 0 0.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .admin-brand {
          display: flex;
          align-items: center;
          gap: 1rem;
          overflow: hidden;
        }

        .brand-orb {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 12px;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          box-shadow: 0 0 20px rgba(0, 212, 170, 0.2);
        }

        .orb-pulse {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid var(--accent-primary);
          border-radius: 12px;
          animation: orb-pulse-anim 2s infinite;
        }

        @keyframes orb-pulse-anim {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.4); opacity: 0; }
        }

        .brand-text-container {
          display: flex;
          flex-direction: column;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s;
        }

        .admin-sidebar.expanded .brand-text-container {
          opacity: 1;
          transform: translateX(0);
        }

        .brand-name {
          font-weight: 900;
          font-size: 1.1rem;
          letter-spacing: 0.1em;
          background: linear-gradient(to right, #fff, var(--accent-primary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-tag {
          font-size: 0.6rem;
          color: var(--text-muted);
          font-weight: 700;
          letter-spacing: 0.1em;
        }

        .sidebar-toggle {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1.2rem;
          padding: 0.5rem;
          transition: color 0.2s;
        }

        .sidebar-toggle:hover { color: #fff; }

        .admin-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .nav-group {
          display: flex;
          flex-direction: column;
        }

        .group-label {
          padding: 0 1rem;
          margin-bottom: 0.75rem;
          font-size: 0.65rem;
          font-weight: 800;
          text-transform: uppercase;
          color: var(--text-muted);
          letter-spacing: 0.1em;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .admin-sidebar.expanded .group-label {
          opacity: 1;
        }

        .admin-nav-item {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          height: 48px;
          padding: 0 1.1rem;
          text-decoration: none;
          color: #64748b;
          border-radius: 12px;
          transition: all 0.3s;
          position: relative;
          overflow: hidden;
          margin-bottom: 0.25rem;
        }

        .nav-item-glow {
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(0, 212, 170, 0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .admin-nav-item:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.03);
        }

        .admin-nav-item.active {
          background: rgba(0, 212, 170, 0.08);
          color: var(--accent-primary);
          border: 1px solid rgba(0, 212, 170, 0.1);
        }

        .admin-nav-item.active .nav-item-glow { opacity: 1; }

        .item-icon {
          width: 20px;
          height: 20px;
          min-width: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: filter 0.3s;
        }

        .admin-nav-item.active .item-icon {
          filter: drop-shadow(0 0 8px var(--accent-primary));
        }

        .item-label {
          font-weight: 700;
          font-size: 0.85rem;
          white-space: nowrap;
          opacity: 0;
          transform: translateX(-10px);
          transition: all 0.3s;
        }

        .admin-sidebar.expanded .item-label {
          opacity: 1;
          transform: translateX(0);
        }

        .nav-badge {
          margin-left: auto;
          font-size: 0.6rem;
          font-weight: 900;
          padding: 2px 6px;
          border-radius: 4px;
          color: #fff;
        }

        .active-beam {
          position: absolute;
          left: 0;
          width: 3px;
          height: 20px;
          background: var(--accent-primary);
          border-radius: 0 4px 4px 0;
          box-shadow: 0 0 10px var(--accent-primary);
        }

        .sidebar-footer {
          border-top: 1px solid var(--glass-border);
          padding-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .telemetry-box {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
          padding: 0.75rem;
          font-family: var(--font-mono);
          font-size: 0.65rem;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .admin-sidebar.expanded .telemetry-box { opacity: 1; }

        .tel-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.4rem;
        }

        .tel-label { color: #475569; }
        .tel-value { font-weight: 700; }
        .tel-value.online { color: var(--accent-primary); }

        .tel-progress {
          height: 2px;
          background: rgba(255, 255, 255, 0.05);
          width: 100%;
          margin-top: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent-primary);
          box-shadow: 0 0 5px var(--accent-primary);
          transition: width 0.3s;
        }

        .footer-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .footer-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1.1rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          font-size: 0.85rem;
          color: #64748b;
          transition: all 0.2s;
          border: none;
          background: transparent;
          cursor: pointer;
          width: 100%;
        }

        .footer-btn:hover { color: #fff; background: rgba(255, 255, 255, 0.03); }
        .footer-btn.logout { color: #ef4444; }
        .footer-btn.logout:hover { background: rgba(239, 68, 68, 0.1); }

        /* Main Area */
        .admin-main {
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
        }

        .admin-top-bar {
          height: 70px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 2rem;
          border-bottom: 1px solid var(--glass-border);
          background: rgba(2, 2, 4, 0.5);
          backdrop-filter: blur(10px);
        }

        .breadcrumb-nav {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 1px;
        }

        .bread-root { color: #475569; }
        .bread-sep { width: 4px; height: 4px; background: #1e293b; border-radius: 50%; }
        .bread-current { color: var(--accent-primary); font-weight: 800; }

        .system-clock {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          margin-right: 2rem;
          font-family: var(--font-mono);
        }

        .clock-label { font-size: 0.6rem; color: var(--text-muted); font-weight: 700; }
        .clock-value { font-size: 0.85rem; color: #fff; font-weight: 700; }

        .admin-profile-pill {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.4rem 0.4rem 0.4rem 1rem;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--glass-border);
          border-radius: 100px;
        }

        .profile-status { width: 8px; height: 8px; border-radius: 50%; }
        .profile-status.online { background: #10b981; box-shadow: 0 0 8px #10b981; }

        .admin-username { font-size: 0.8rem; font-weight: 700; color: #fff; }

        .admin-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          color: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 0.7rem;
        }

        .admin-content-scroll {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
        }

        .admin-inner-content {
          max-width: 1400px;
          margin: 0 auto;
        }

        .glass { backdrop-filter: blur(20px); }
      `}</style>
    </div>
  );
}
