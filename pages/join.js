import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Join() {
  const [content, setContent] = useState(null);
  const [activeServer, setActiveServer] = useState('minecraft');

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(err => console.error('Failed to load content:', err));
  }, []);

  const hasServers = content?.servers && (content.servers.minecraft || content.servers.fivem);
  const currentServer = hasServers ? content.servers[activeServer] : null;

  const copyToClipboard = () => {
    const serverIP = hasServers
      ? (activeServer === 'minecraft'
          ? `${currentServer?.serverIP}${currentServer?.port ? ':' + currentServer.port : ''}`
          : currentServer?.serverIP)
      : content?.joinInfo?.serverIP;

    if (serverIP) {
      navigator.clipboard.writeText(serverIP).then(() => {
        alert('Server IP copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy. Please copy manually.');
      });
    }
  };

  return (
    <Layout title="EVU - Join Server">
      <div className="hero">
        <div className="container">
          <h1>Join EVU Servers</h1>
          <p>{hasServers ? 'Choose your adventure - Minecraft or FiveM' : 'Connect to our server'}</p>
        </div>
      </div>

      <div className="container main-content">
        {/* Server Selector */}
        {hasServers && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {content.servers.minecraft?.enabled && (
              <button onClick={() => setActiveServer('minecraft')} style={{ padding: '1rem 2rem', background: activeServer === 'minecraft' ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))' : 'var(--card-bg)', border: activeServer === 'minecraft' ? 'none' : '2px solid var(--primary-color)', color: activeServer === 'minecraft' ? 'var(--dark-bg)' : 'var(--primary-color)', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', minWidth: '200px' }}>⛏️ Minecraft</button>
            )}
            {content.servers.fivem?.enabled && (
              <button onClick={() => setActiveServer('fivem')} style={{ padding: '1rem 2rem', background: activeServer === 'fivem' ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))' : 'var(--card-bg)', border: activeServer === 'fivem' ? 'none' : '2px solid var(--primary-color)', color: activeServer === 'fivem' ? 'var(--dark-bg)' : 'var(--primary-color)', borderRadius: '10px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', minWidth: '200px' }}>🚗 FiveM</button>
            )}
          </div>
        )}

        <section className="join-section">
          <h2>How to Connect{hasServers ? ` to ${currentServer?.name || activeServer.toUpperCase()}` : ''}</h2>

          <div className="connection-box">
            <h3>Direct Connect</h3>
            <div className="connect-info">
              <p className="connect-ip">
                {hasServers
                  ? (activeServer === 'minecraft'
                      ? `${currentServer?.serverIP || 'Loading...'}${currentServer?.port ? ':' + currentServer.port : ''}`
                      : currentServer?.serverIP || 'Loading...')
                  : content?.joinInfo?.serverIP || 'Loading...'}
              </p>
              <button className="btn-primary" onClick={copyToClipboard}>Copy IP</button>
            </div>
            <p className="connect-note">
              {hasServers && activeServer === 'minecraft'
                ? <><strong>Java Edition:</strong> Add server in Multiplayer menu</>
                : <>Press F8 in FiveM and type: <code>{hasServers ? currentServer?.serverIP : content?.joinInfo?.serverIP || 'Loading...'}</code></>}
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Install FiveM</h3>
              <p>Download and install FiveM from <a href="https://fivem.net" target="_blank" rel="noopener noreferrer">fivem.net</a></p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Launch FiveM</h3>
              <p>Open FiveM and wait for it to finish loading</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Connect</h3>
              <p>Use the direct connect option with our server IP or find us in the server list</p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Enjoy</h3>
              <p>Start your roleplay journey on EVU Server!</p>
            </div>
          </div>
        </section>

        <section className="requirements-section">
          <h2>Requirements</h2>
          <div className="info-grid">
            <div className="info-card">
              <h3>📋 Prerequisites</h3>
              <ul>
                <li>GTA V (Legal Copy)</li>
                <li>FiveM Client</li>
                <li>Microphone (Recommended)</li>
                <li>Discord Account</li>
              </ul>
            </div>
            <div className="info-card">
              <h3>💻 System Requirements</h3>
              <ul>
                <li>OS: Windows 10 64-bit</li>
                <li>RAM: 8GB minimum</li>
                <li>CPU: Intel Core i5 / AMD FX</li>
                <li>GPU: NVIDIA GTX 660 2GB / AMD HD 7870</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="discord-section">
          <h2>Join Our Community</h2>
          <p>Connect with other players and stay updated on our Discord server</p>
          <a href={content?.joinInfo?.discordLink || '#'} target="_blank" rel="noopener noreferrer">
            <button className="btn-primary btn-large">Join Discord</button>
          </a>
        </section>
      </div>
    </Layout>
  );
}
