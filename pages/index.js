import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Home() {
  const [content, setContent] = useState(null);
  const [activeServer, setActiveServer] = useState('minecraft'); // Default to Minecraft
  const [liveStatus, setLiveStatus] = useState({
    minecraft: null,
    fivem: null
  });

  // Fetch static content
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        controller.abort();
      }
    }, 10000); // 10 second timeout

    fetch('/api/content', { signal: controller.signal })
      .then(res => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then(data => {
        if (isMounted) {
          setContent(data);
        }
      })
      .catch(err => {
        clearTimeout(timeoutId);
        // Only log if not an abort error
        if (err.name !== 'AbortError') {
          console.error('Failed to load content:', err);
        }
        // Set fallback content if still mounted and error wasn't just abort
        if (isMounted && err.name !== 'AbortError') {
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
        }
      });

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // Fetch live server status
  useEffect(() => {
    if (!content) return;

    const fetchServerStatus = async (serverType) => {
      try {
        const response = await fetch(`/api/servers/${serverType}-status`);
        if (!response.ok) throw new Error('Failed to fetch status');
        const data = await response.json();
        setLiveStatus(prev => ({
          ...prev,
          [serverType]: data
        }));
      } catch (error) {
        console.error(`Failed to fetch ${serverType} status:`, error);
      }
    };

    // Fetch status for enabled servers
    if (content.servers?.minecraft?.enabled) {
      fetchServerStatus('minecraft');
    }
    if (content.servers?.fivem?.enabled) {
      fetchServerStatus('fivem');
    }

    // Refresh status every 30 seconds
    const interval = setInterval(() => {
      if (content.servers?.minecraft?.enabled) {
        fetchServerStatus('minecraft');
      }
      if (content.servers?.fivem?.enabled) {
        fetchServerStatus('fivem');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [content]);

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
                liveStatus[activeServer]?.online ? 'online' : 'offline'
              }`}></div>
              <h3>Server</h3>
              <p style={{
                color: liveStatus[activeServer]?.online
                  ? 'var(--success-color)'
                  : 'var(--accent-color)'
              }}>
                {liveStatus[activeServer]
                  ? (liveStatus[activeServer].online ? 'Online' : 'Offline')
                  : 'Checking...'}
              </p>
            </div>
            <div className="status-card">
              <h3>Players</h3>
              <p className="stat-number">
                {liveStatus[activeServer]?.online
                  ? `${liveStatus[activeServer].players?.online || 0}/${liveStatus[activeServer].players?.max || 0}`
                  : liveStatus[activeServer]
                    ? 'Offline'
                    : 'Loading...'}
              </p>
            </div>
            <div className="status-card">
              <h3>{activeServer === 'minecraft' ? 'Latency' : 'Uptime'}</h3>
              <p className="stat-number">
                {liveStatus[activeServer]?.online
                  ? (activeServer === 'minecraft'
                      ? `${liveStatus[activeServer].latency || 0}ms`
                      : currentServer?.uptime || 'N/A')
                  : liveStatus[activeServer]
                    ? 'N/A'
                    : 'Loading...'}
              </p>
            </div>
            <div className="status-card">
              <h3>Version</h3>
              <p className="stat-number">
                {liveStatus[activeServer]?.online
                  ? (liveStatus[activeServer].version ||
                     liveStatus[activeServer].hostname ||
                     currentServer?.version || 'Unknown')
                  : currentServer?.version || 'N/A'}
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

// Force server-side rendering
export async function getServerSideProps() {
  return { props: {} };
}
