import { useState, useEffect } from 'react';
import { systemApi } from '../services/api';
import { ServiceHealth, SecurityEvent, SystemMetrics } from '../types';

export default function SystemStatusPage() {
  const [health, setHealth] = useState<ServiceHealth[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [healthData, eventsData, metricsData] = await Promise.all([
          systemApi.getServiceHealth(),
          systemApi.getSecurityEvents(),
          systemApi.getSystemMetrics(),
        ]);
        setHealth(healthData);
        setEvents(eventsData);
        setMetrics(metricsData);
      } catch (error) {
        console.error('Failed to fetch system status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 8000); // Faster refresh for real-time feel
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="status-loading-sanctuary">
        <div className="loader-luxury" />
        <p className="loading-text">Synchronizing Infrastructure Intelligence...</p>
      </div>
    );
  }

  return (
    <div className="status-page-luxury quiet-luxury">
      <div className="status-container">
        {/* Top Intelligence Grid */}

        {/* Top Intelligence Grid */}
        <div className="intelligence-grid mb-12">
          <div className="intel-card glass scanline">
            <span className="intel-label">Active Nodes</span>
            <div className="intel-value-container">
              <span className="intel-value">{metrics?.activeUsers || 0}</span>
              <span className="intel-trend up">K8s Ready</span>
            </div>
          </div>
          <div className="intel-card glass scanline">
            <span className="intel-label">Throughput</span>
            <div className="intel-value-container">
              <span className="intel-value">{metrics?.ordersPerMinute || 0}</span>
              <span className="intel-trend">RPS</span>
            </div>
          </div>
          <div className="intel-card glass scanline">
            <span className="intel-label">Global Latency</span>
            <div className="intel-value-container">
              <span className="intel-value">{metrics?.averageResponseTime || 0}ms</span>
              <span className="intel-trend steady">Stable</span>
            </div>
          </div>
          <div className="intel-card security-intel glass">
            <span className="intel-label">Security Scan</span>
            <div className="intel-value-container">
              <span className="intel-value status-passed">PASSED</span>
              <span className="intel-trend glow">v2.4.1</span>
            </div>
          </div>
        </div>

        <div className="status-main-layout">
          {/* Service Ecosystem Section */}
          <section className="service-ecosystem">
            <div className="section-header-luxury">
              <h2 className="section-title-luxury">Microservice Topology</h2>
              <div className="topology-info">
                <span className="info-item">Cluster: docker-desktop</span>
                <span className="info-item">Namespace: default</span>
              </div>
            </div>
            
            <div className="service-grid-luxury">
              {health.map((service) => (
                <div key={service.name} className={`service-card-luxury glass ${service.status.toLowerCase()}`}>
                  <div className="card-top">
                    <h3 className="service-name-luxury">{service.name}</h3>
                    <span className="service-version-luxury">{service.version}</span>
                  </div>
                  
                  <div className="card-mid">
                    <div className="health-bar">
                      <div className="health-fill" style={{ width: service.status === 'UP' ? '100%' : service.status === 'DEGRADED' ? '60%' : '0%' }} />
                    </div>
                    <div className="status-badge-luxury">
                      <span className="status-dot-luxury" />
                      {service.status}
                    </div>
                  </div>
                  
                  <div className="card-bottom-luxury">
                    <div className="uptime-item">
                      <span className="label">Uptime</span>
                      <span className="value">{service.uptime}</span>
                    </div>
                    <div className="uptime-item">
                      <span className="label">Connectivity</span>
                      <span className="value">TLS 1.3</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Extra DevSecOps Information */}
            <div className="devsecops-insights-grid mt-12">
              <div className="insight-card glass">
                <h4 className="insight-title">Secret Management</h4>
                <div className="insight-stat">
                  <span className="stat-label">Vault Engine</span>
                  <span className="stat-value-success">Ready</span>
                </div>
                <div className="insight-stat">
                  <span className="stat-label">Lease Status</span>
                  <span className="stat-value">Healthy</span>
                </div>
              </div>
              <div className="insight-card glass">
                <h4 className="insight-title">Vulnerability Oversight</h4>
                <div className="insight-stat">
                  <span className="stat-label">Trivy Scan</span>
                  <span className="stat-value-success">Clean</span>
                </div>
                <div className="insight-stat">
                  <span className="stat-label">CVEs Detected</span>
                  <span className="stat-value">0</span>
                </div>
              </div>
              <div className="insight-card glass">
                <h4 className="insight-title">Deployment Pipeline</h4>
                <div className="insight-stat">
                  <span className="stat-label">Latest Build</span>
                  <span className="stat-value">#412</span>
                </div>
                <div className="insight-stat">
                  <span className="stat-label">Result</span>
                  <span className="stat-value-success">Success</span>
                </div>
              </div>
            </div>
          </section>

          {/* Security Intelligence Feed */}
          <aside className="security-intelligence">
            <div className="section-header-luxury">
              <h2 className="section-title-luxury">Intelligence Feed</h2>
              <span className="pulse-tag">ENCRYPTED STREAM</span>
            </div>
            
            <div className="intelligence-terminal glass">
              <div className="terminal-header">
                <div className="terminal-dots">
                  <span className="dot red" />
                  <span className="dot amber" />
                  <span className="dot green" />
                </div>
                <span className="terminal-title">audit_log.sys</span>
              </div>
              
              <div className="terminal-content">
                {events.map((event) => (
                  <div key={event.id} className={`terminal-line severity-${event.severity.toLowerCase()}`}>
                    <span className="line-time">{new Date(event.timestamp).toLocaleTimeString()}</span>
                    <span className="line-type">{event.type}</span>
                    <span className="line-message">{event.message}</span>
                  </div>
                ))}
                <div className="terminal-cursor">_</div>
              </div>
            </div>

            <div className="system-config-summary glass mt-8">
              <h4 className="insight-title">Runtime Configuration</h4>
              <div className="config-list">
                <div className="config-item">
                  <span className="label">Environment</span>
                  <span className="value">Production-Sim</span>
                </div>
                <div className="config-item">
                  <span className="label">Tracing</span>
                  <span className="value">Jaeger Enabled</span>
                </div>
                <div className="config-item">
                  <span className="label">Logging</span>
                  <span className="value">ELK Stack v8.1</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <style>{`
        .status-page-luxury { font-family: var(--font-sans); }
        .status-container { max-width: 1400px; margin: 0 auto; }
        .user-name-title { font-family: var(--font-serif); font-size: 3.5rem; font-weight: 800; letter-spacing: -2px; margin: 0; color: #fff; }
        .user-email-subtitle { color: #64748b; font-size: 1.1rem; font-weight: 500; margin-top: 0.5rem; }
        
        .system-status-indicator { display: flex; align-items: center; gap: 1rem; }
        .live-dot { width: 10px; height: 10px; background: #10b981; border-radius: 50%; animation: pulse-glow 2s infinite; }
        @keyframes pulse-glow { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
        .status-text-glow { font-weight: 800; color: #10b981; font-size: 0.8rem; letter-spacing: 2px; }
        .timestamp-luxury { font-family: var(--font-mono); font-size: 0.9rem; color: #475569; margin-left: 1rem; }

        /* Intelligence Grid */
        .intelligence-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
        .intel-card { padding: 2rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.03); position: relative; overflow: hidden; }
        .intel-label { font-size: 0.75rem; font-weight: 800; color: #475569; text-transform: uppercase; letter-spacing: 1.5px; display: block; margin-bottom: 1rem; }
        .intel-value-container { display: flex; align-items: baseline; gap: 1rem; }
        .intel-value { font-family: var(--font-serif); font-size: 2.8rem; font-weight: 700; color: #fff; letter-spacing: -1px; }
        .intel-trend { font-size: 0.8rem; font-weight: 700; color: #475569; }
        .intel-trend.up { color: var(--accent-primary); }
        .status-passed { color: #10b981; }

        /* Layout */
        .status-main-layout { display: grid; grid-template-columns: 1fr 450px; gap: 4rem; }
        @media (max-width: 1200px) { .status-main-layout { grid-template-columns: 1fr; } }

        /* Sections */
        .section-header-luxury { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
        .section-title-luxury { font-family: var(--font-serif); font-size: 1.8rem; font-weight: 800; color: #fff; margin: 0; }
        .topology-info { display: flex; gap: 1.5rem; }
        .info-item { font-size: 0.75rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 1px; }

        /* Service Cards */
        .service-grid-luxury { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .service-card-luxury { padding: 2rem; border-radius: 24px; border: 1px solid rgba(255,255,255,0.03); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .service-card-luxury:hover { transform: translateY(-8px); border-color: rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); }
        .service-name-luxury { font-size: 1.4rem; font-weight: 700; color: #fff; margin: 0; }
        .service-version-luxury { font-size: 0.7rem; color: #475569; font-weight: 800; }
        
        .card-mid { margin: 1.5rem 0; }
        .health-bar { height: 3px; background: rgba(255,255,255,0.05); border-radius: 2px; margin-bottom: 1.25rem; overflow: hidden; }
        .health-fill { height: 100%; background: var(--accent-primary); transition: width 1s ease-in-out; }
        .status-badge-luxury { display: flex; align-items: center; gap: 0.6rem; font-size: 0.8rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #fff; }
        .status-dot-luxury { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
        .degraded .status-dot-luxury { background: #f59e0b; }
        .down .status-dot-luxury { background: #ef4444; }
        .down .health-fill { background: #ef4444; }

        .card-bottom-luxury { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 1.5rem; }
        .uptime-item .label { font-size: 0.65rem; color: #475569; font-weight: 800; text-transform: uppercase; display: block; margin-bottom: 0.25rem; }
        .uptime-item .value { font-size: 0.85rem; color: #94a3b8; font-weight: 700; }

        /* Terminal */
        .intelligence-terminal { background: #020205; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); height: 480px; display: flex; flex-direction: column; overflow: hidden; }
        .terminal-header { padding: 1.25rem; background: #0a0a0f; display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .terminal-dots { display: flex; gap: 8px; }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot.red { background: #ff5f56; }
        .dot.amber { background: #ffbd2e; }
        .dot.green { background: #27c93f; }
        .terminal-title { font-family: var(--font-mono); font-size: 0.75rem; color: #475569; }
        
        .terminal-content { padding: 1.5rem; font-family: var(--font-mono); font-size: 0.8rem; overflow-y: auto; flex: 1; }
        .terminal-line { margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.02); padding-bottom: 0.75rem; }
        .line-time { color: #475569; margin-right: 1rem; }
        .line-type { color: #38bdf8; font-weight: 700; margin-right: 1rem; }
        .line-message { color: #94a3b8; }
        .terminal-cursor { display: inline-block; width: 8px; height: 15px; background: var(--accent-primary); animation: blink 1s infinite; }
        @keyframes blink { 50% { opacity: 0; } }

        /* Config List */
        .config-list { display: flex; flex-direction: column; gap: 1rem; }
        .config-item { display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .config-item .label { font-size: 0.8rem; color: #475569; font-weight: 700; }
        .config-item .value { font-size: 0.85rem; color: #fff; font-weight: 700; }

        /* Scanline Effect */
        .scanline::before {
          content: " ";
          display: block;
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%);
          z-index: 2;
          background-size: 100% 4px;
          pointer-events: none;
          opacity: 0.05;
        }

        /* Loading */
        .status-loading-sanctuary { height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        .loader-luxury { width: 50px; height: 50px; border: 2px solid rgba(255,255,255,0.1); border-top-color: var(--accent-primary); border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 2rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .loading-text { font-family: var(--font-serif); font-size: 1.4rem; color: #64748b; letter-spacing: 1px; font-weight: 600; }

        /* Insight Cards */
        .insight-card { padding: 2rem; border-radius: 24px; }
        .insight-title { font-family: var(--font-serif); font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 1.5rem; }
        .insight-stat { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
        .stat-label { font-size: 0.75rem; color: #475569; font-weight: 800; text-transform: uppercase; }
        .stat-value { font-size: 0.85rem; color: #fff; font-weight: 700; }
        .stat-value-success { font-size: 0.85rem; color: #10b981; font-weight: 800; }

        .mb-12 { margin-bottom: 3rem; }
        .mt-12 { margin-top: 3rem; }
        .mt-8 { margin-top: 2rem; }
        .pulse-tag { font-size: 0.7rem; font-weight: 900; color: var(--accent-primary); letter-spacing: 1px; border: 1px solid rgba(0, 212, 170, 0.3); padding: 4px 12px; border-radius: 99px; }
      `}</style>
    </div>
  );
}
