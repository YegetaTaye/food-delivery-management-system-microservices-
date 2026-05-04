import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileApi } from '../services/api';
import { SessionInfo } from '../types';

export default function ProfilePage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const data = await profileApi.getActiveSessions();
        setSessions(data);
      } catch (error) {
        console.error('Failed to fetch sessions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    // Logic to update profile would go here
    setIsEditing(false);
    alert('Profile update simulated!');
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (window.confirm('Are you sure you want to revoke this session?')) {
      await profileApi.revokeSession(sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
    }
  };

  if (isLoading) return <div className="loading-screen">Loading Profile...</div>;

  return (
    <div className="profile-page quiet-luxury">
      <div className="container">
        {/* Profile Hero */}
        <header className="profile-hero">
          <div className="hero-content">
            <div className="avatar-wrapper">
              <div className="avatar-main">
                {user?.name?.[0] || user?.email?.[0]}
              </div>
              <div className="online-indicator" />
            </div>
            <div className="hero-text">
              <h1 className="user-name-title">{user?.name || 'Gourmet Explorer'}</h1>
              <p className="user-email-subtitle">{user?.email}</p>
              <div className="user-badges">
                <span className="badge-luxury">Premium Member</span>
                <span className="badge-luxury">Verified Identity</span>
              </div>
            </div>
          </div>
          <div className="hero-actions">
            <button 
              className={`btn-luxury ${isEditing ? 'active' : ''}`}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </header>

        <div className="luxury-grid">
          {/* Main Info Column */}
          <div className="luxury-column">
            <section className="luxury-section glass">
              <h2 className="section-title-luxury">Account Overview</h2>
              
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="luxury-form">
                  <div className="input-group-luxury">
                    <label>Display Name</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="Your name"
                    />
                  </div>
                  <div className="input-group-luxury disabled">
                    <label>Email Address</label>
                    <input 
                      type="email" 
                      value={formData.email}
                      disabled
                    />
                  </div>
                  <button type="submit" className="btn-luxury-primary">Update Account</button>
                </form>
              ) : (
                <div className="info-list-luxury">
                  <div className="info-item-luxury">
                    <span className="label">Full Identity</span>
                    <span className="value">{user?.name}</span>
                  </div>
                  <div className="info-item-luxury">
                    <span className="label">Contact Email</span>
                    <span className="value">{user?.email}</span>
                  </div>
                  <div className="info-item-luxury">
                    <span className="label">Client Since</span>
                    <span className="value">{new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
              )}
            </section>

            <div className="stats-grid-luxury">
              <div className="stat-card-luxury glass">
                <span className="stat-label">Total Orders</span>
                <span className="stat-value">24</span>
              </div>
              <div className="stat-card-luxury glass">
                <span className="stat-label">Member Points</span>
                <span className="stat-value">1,250</span>
              </div>
            </div>
          </div>

          {/* Security & Presence Column */}
          <div className="luxury-column">
            <section className="luxury-section glass">
              <h2 className="section-title-luxury">Security & Access</h2>
              
              <div className="security-status-luxury">
                <div className="status-indicator-luxury" />
                <div className="status-text-luxury">
                  <h3>Enhanced Security Enabled</h3>
                  <p>Your data is protected by bank-grade encryption.</p>
                </div>
              </div>

              <div className="presence-header-luxury">
                <h3>Active Sessions</h3>
                <span>{sessions.length} Devices</span>
              </div>

              <div className="presence-list-luxury">
                {sessions.map(session => (
                  <div key={session.id} className={`presence-item-luxury ${session.isCurrent ? 'current' : ''}`}>
                    <div className="device-icon-luxury">
                      {session.device.includes('iPhone') ? '📱' : '💻'}
                    </div>
                    <div className="device-info-luxury">
                      <div className="device-name-luxury">
                        {session.device} {session.isCurrent && <span className="current-pill">Active Now</span>}
                      </div>
                      <div className="device-meta-luxury">
                        {session.location} • {session.ipAddress}
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <button 
                        className="btn-revoke-luxury"
                        onClick={() => handleRevokeSession(session.id)}
                      >
                        Sign Out
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <style>{`
        .quiet-luxury { padding: 4rem 0; color: #fff; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 2rem; }

        /* Hero Section */
        .profile-hero { 
          display: flex; 
          justify-content: space-between; 
          align-items: center; 
          margin-bottom: 4rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .hero-content { display: flex; align-items: center; gap: 2.5rem; }
        
        .avatar-wrapper { position: relative; }
        .avatar-main { 
          width: 100px; height: 100px; 
          background: linear-gradient(135deg, #1e293b, #0f172a); 
          border-radius: 50%; display: flex; align-items: center; justify-content: center; 
          font-size: 2.5rem; font-weight: 800; border: 1px solid rgba(255,255,255,0.1);
        }
        .online-indicator { 
          position: absolute; bottom: 5px; right: 5px; 
          width: 18px; height: 18px; background: #22c55e; 
          border: 3px solid #000; border-radius: 50%; 
        }

        .user-name-title { font-family: var(--font-serif); font-size: 3rem; font-weight: 900; letter-spacing: -1px; margin-bottom: 0.5rem; }
        .user-email-subtitle { color: #64748b; font-size: 1.1rem; margin-bottom: 1.5rem; }
        
        .user-badges { display: flex; gap: 1rem; }
        .badge-luxury { 
          font-size: 0.7rem; font-weight: 800; text-transform: uppercase; 
          letter-spacing: 1px; color: #fff; background: rgba(255,255,255,0.05); 
          padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);
        }

        /* Buttons */
        .btn-luxury { 
          background: transparent; border: 1px solid rgba(255,255,255,0.1); 
          color: #fff; padding: 0.75rem 1.5rem; border-radius: 12px; 
          font-weight: 700; cursor: pointer; transition: all 0.3s; 
        }
        .btn-luxury:hover { background: #fff; color: #000; }
        .btn-luxury.active { border-color: var(--accent-primary); color: var(--accent-primary); }

        .btn-luxury-primary {
          width: 100%; padding: 1rem; background: var(--accent-primary); 
          color: #fff; border: none; border-radius: 12px; 
          font-weight: 800; font-size: 1rem; cursor: pointer; transition: transform 0.2s;
        }
        .btn-luxury-primary:hover { transform: translateY(-2px); filter: brightness(1.1); }

        /* Layout Grid */
        .luxury-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
        @media (max-width: 900px) { .luxury-grid { grid-template-columns: 1fr; } }

        .luxury-section { padding: 2.5rem; border-radius: 32px; height: 100%; }
        .section-title-luxury { 
          font-family: var(--font-serif); font-size: 1.75rem; 
          font-weight: 800; margin-bottom: 2rem; border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 1rem;
        }

        .info-list-luxury { display: flex; flex-direction: column; gap: 1.5rem; }
        .info-item-luxury { display: flex; flex-direction: column; gap: 0.5rem; }
        .info-item-luxury .label { font-size: 0.75rem; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1px; }
        .info-item-luxury .value { font-size: 1.2rem; font-weight: 600; }

        .stats-grid-luxury { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 2rem; }
        .stat-card-luxury { padding: 1.5rem; border-radius: 24px; text-align: center; }
        .stat-label { display: block; font-size: 0.75rem; color: #64748b; font-weight: 800; margin-bottom: 0.5rem; text-transform: uppercase; }
        .stat-value { font-family: var(--font-serif); font-size: 2rem; font-weight: 900; color: var(--accent-primary); }

        /* Security Status */
        .security-status-luxury { 
          display: flex; align-items: center; gap: 1.5rem; 
          padding: 1.5rem; background: rgba(34, 197, 94, 0.05); 
          border-radius: 20px; border: 1px solid rgba(34, 197, 94, 0.1);
          margin-bottom: 2.5rem;
        }
        .status-indicator-luxury { width: 12px; height: 12px; background: #22c55e; border-radius: 50%; box-shadow: 0 0 10px #22c55e; }
        .status-text-luxury h3 { font-size: 1rem; font-weight: 800; margin-bottom: 0.25rem; color: #4ade80; }
        .status-text-luxury p { font-size: 0.85rem; color: #64748b; }

        .presence-header-luxury { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .presence-header-luxury h3 { font-size: 1.1rem; font-weight: 800; }
        .presence-header-luxury span { font-size: 0.8rem; color: #64748b; font-weight: 700; }

        .presence-list-luxury { display: flex; flex-direction: column; gap: 1rem; }
        .presence-item-luxury { 
          display: flex; align-items: center; gap: 1.25rem; 
          padding: 1.25rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.03);
          transition: all 0.3s;
        }
        .presence-item-luxury.current { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.05); }
        .device-icon-luxury { font-size: 1.5rem; opacity: 0.5; }
        .device-info-luxury { flex: 1; }
        .device-name-luxury { font-weight: 700; font-size: 1rem; display: flex; align-items: center; gap: 0.5rem; }
        .current-pill { font-size: 0.6rem; background: var(--accent-primary); color: #fff; padding: 2px 6px; border-radius: 4px; }
        .device-meta-luxury { font-size: 0.8rem; color: #64748b; }
        
        .btn-revoke-luxury { 
          background: transparent; border: 1px solid rgba(239, 68, 68, 0.2); 
          color: #f87171; padding: 0.5rem 1rem; border-radius: 10px; 
          font-size: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.3s;
        }
        .btn-revoke-luxury:hover { background: #ef4444; color: #fff; border-color: #ef4444; }

        /* Form */
        .luxury-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .input-group-luxury { display: flex; flex-direction: column; gap: 0.5rem; }
        .input-group-luxury label { font-size: 0.75rem; font-weight: 800; color: #475569; text-transform: uppercase; }
        .input-group-luxury input { 
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 12px; padding: 0.75rem 1rem; color: #fff; outline: none; transition: border-color 0.3s;
        }
        .input-group-luxury input:focus { border-color: var(--accent-primary); }
        .input-group-luxury.disabled input { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
