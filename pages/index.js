import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Home() {
  const [content, setContent] = useState(null);
  const [activeServer, setActiveServer] = useState('minecraft'); // Default to Minecraft

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    fetch('/api/content', { signal: controller.signal })
      .then(res => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => setContent(data))
      .catch(err => {
        clearTimeout(timeoutId);
        console.error('Failed to load content:', err);
        // Set fallback content so page doesn't hang forever
        setContent({
          general: {
            websiteTitle: 'EVU Gaming Network',
            welcomeMessage: 'Your Home for Gaming'
          },
          servers: {
            minecraft: {
              enabled: false
            },
            fivem: {
              enabled: false
            }
          }
        });
      });

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  if (!content) {
    return (
      <Layout title="EVU - Gaming Network">
        <div className="hero">
          <div className="container">
            <h1>Loading...</h1>
          </div>
        </div>
      </Layout>
    );
  }

  // Support both old and new content structure
  const hasServers = content.servers && (content.servers.minecraft || content.servers.fivem);
  const currentServer = hasServers ? content.servers[activeServer] : null;

  // Fallback to old structure if new structure doesn't exist
  const displayTitle = hasServers
    ? (content.general?.websiteTitle || 'EVU Gaming Network')
    : (content.serverInfo?.title || 'Welcome to EVU Server');

  const displaySubtitle = hasServers
    ? (content.general?.welcomeMessage || 'Your Home for Gaming')
    : (content.serverInfo?.subtitle || 'Gaming Experience');

  return (
    <Layout title="EVU - Gaming Network">
      <div className="hero">
        <div className="container">
          <h1>{displayTitle}</h1>
          <p>{displaySubtitle}</p>
        </div>
      </div>

      <div className="container main-content">
        {/* Server Selector Tabs (only show if dual-server mode) */}
        {hasServers && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '3rem',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {content.servers.minecraft?.enabled && (
              <button
                onClick={() => setActiveServer('minecraft')}
                style={{
                  padding: '1rem 2rem',
                  background: activeServer === 'minecraft'
                    ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))'
                    : 'var(--card-bg)',
                  border: activeServer === 'minecraft' ? 'none' : '2px solid var(--primary-color)',
                  color: activeServer === 'minecraft' ? 'var(--dark-bg)' : 'var(--primary-color)',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '200px'
                }}
              >
                ⛏️ Minecraft Server
              </button>
            )}
            {content.servers.fivem?.enabled && (
              <button
                onClick={() => setActiveServer('fivem')}
                style={{
                  padding: '1rem 2rem',
                  background: activeServer === 'fivem'
                    ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))'
                    : 'var(--card-bg)',
                  border: activeServer === 'fivem' ? 'none' : '2px solid var(--primary-color)',
                  color: activeServer === 'fivem' ? 'var(--dark-bg)' : 'var(--primary-color)',
                  borderRadius: '10px',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  minWidth: '200px'
                }}
              >
                🚗 FiveM Server
              </button>
            )}
          </div>
        )}

        {/* Server Status Section */}
        <section className="status-section">
          <h2>
            {hasServers
              ? `${currentServer?.name || activeServer.toUpperCase()} Status`
              : 'Server Status'}
          </h2>
          <div className="status-cards">
            <div className="status-card">
              <div className={`status-indicator ${
                hasServers
                  ? (currentServer?.isOnline ? 'online' : 'offline')
                  : (content.serverStatus?.isOnline ? 'online' : 'offline')
              }`}></div>
              <h3>Server</h3>
              <p style={{
                color: (hasServers ? currentServer?.isOnline : content.serverStatus?.isOnline)
                  ? 'var(--success-color)'
                  : 'var(--accent-color)'
              }}>
                {(hasServers ? currentServer?.isOnline : content.serverStatus?.isOnline)
                  ? 'Online'
                  : 'Offline'}
              </p>
            </div>
            <div className="status-card">
              <h3>Players</h3>
              <p className="stat-number">
                {hasServers
                  ? `${currentServer?.currentPlayers || 0}/${currentServer?.maxPlayers || 100}`
                  : `0/${content.serverStatus?.maxPlayers || 64}`}
              </p>
            </div>
            <div className="status-card">
              <h3>Uptime</h3>
              <p className="stat-number">
                {hasServers
                  ? (currentServer?.uptime || '99.9%')
                  : (content.serverStatus?.uptime || '99.9%')}
              </p>
            </div>
            <div className="status-card">
              <h3>Version</h3>
              <p className="stat-number">
                {hasServers
                  ? (currentServer?.version || '1.0')
                  : (content.serverInfo?.version || 'v1.0')}
              </p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="info-section">
          <h2>
            {hasServers
              ? `${currentServer?.name || activeServer.toUpperCase()} Features`
              : 'About Our Server'}
          </h2>
          <div className="info-grid">
            {(hasServers ? currentServer?.features : content.features)?.map((feature, index) => (
              <div key={index} className="info-card">
                <h3>{feature.icon} {feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Connection Info */}
        {hasServers && currentServer && (
          <div className="connection-box" style={{ marginTop: '3rem' }}>
            <h3>Connect to {currentServer.name}</h3>
            <div className="connect-info">
              <div className="connect-ip">
                {activeServer === 'minecraft'
                  ? `${currentServer.serverIP}${currentServer.port ? ':' + currentServer.port : ''}`
                  : currentServer.serverIP}
              </div>
            </div>
            <div className="connect-note">
              {activeServer === 'minecraft'
                ? <p>Copy the server address and add it to your Minecraft server list</p>
                : <p>Press F8 in FiveM and paste the connect command</p>}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
