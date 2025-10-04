import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Home() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(err => console.error('Failed to load content:', err));
  }, []);

  if (!content) {
    return (
      <Layout title="EVU - Server Status">
        <div className="hero">
          <div className="container">
            <h1>Loading...</h1>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="EVU - Server Status">
      <div className="hero">
        <div className="container">
          <h1>{content.serverInfo?.title || 'Welcome to EVU Server'}</h1>
          <p>{content.serverInfo?.subtitle || 'QBCore FiveM Roleplay Experience'}</p>
        </div>
      </div>

      <div className="container main-content">
        <section className="status-section">
          <h2>Server Status</h2>
          <div className="status-cards">
            <div className="status-card">
              <div className={`status-indicator ${content.serverStatus?.isOnline ? 'online' : 'offline'}`}></div>
              <h3>Server</h3>
              <p style={{ color: content.serverStatus?.isOnline ? 'var(--success-color)' : 'var(--accent-color)' }}>
                {content.serverStatus?.isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
            <div className="status-card">
              <h3>Players</h3>
              <p className="stat-number">0/{content.serverStatus?.maxPlayers || 64}</p>
            </div>
            <div className="status-card">
              <h3>Uptime</h3>
              <p className="stat-number">{content.serverStatus?.uptime || '99.9%'}</p>
            </div>
            <div className="status-card">
              <h3>Version</h3>
              <p className="stat-number">{content.serverInfo?.version || 'QBCore v1.0'}</p>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h2>About Our Server</h2>
          <div className="info-grid">
            {content.features?.map((feature, index) => (
              <div key={index} className="info-card">
                <h3>{feature.icon} {feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
