import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Forum() {
  const [content, setContent] = useState(null);
  const [filter, setFilter] = useState('all'); // all, minecraft, fivem

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(err => console.error('Failed to load content:', err));
  }, []);

  const hasServers = content?.servers && (content.servers.minecraft || content.servers.fivem);
  const filteredCategories = content?.forumCategories?.filter(category => {
    if (filter === 'all') return true;
    return category.serverType === filter || category.serverType === 'all';
  });

  return (
    <Layout title="EVU - Forum">
      <div className="hero">
        <div className="container">
          <h1>Community Forum</h1>
          <p>{hasServers ? 'Discuss Minecraft, FiveM, and connect with the EVU community' : 'Discuss, share, and connect with the EVU community'}</p>
        </div>
      </div>

      <div className="container main-content">
        {/* Server Filter (only show if dual-server mode) */}
        {hasServers && (
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => setFilter('all')} style={{ padding: '0.75rem 1.5rem', background: filter === 'all' ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))' : 'var(--card-bg)', border: filter === 'all' ? 'none' : '2px solid var(--primary-color)', color: filter === 'all' ? 'var(--dark-bg)' : 'var(--primary-color)', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>📋 All Forums</button>
            {content.servers.minecraft?.enabled && (
              <button onClick={() => setFilter('minecraft')} style={{ padding: '0.75rem 1.5rem', background: filter === 'minecraft' ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))' : 'var(--card-bg)', border: filter === 'minecraft' ? 'none' : '2px solid var(--primary-color)', color: filter === 'minecraft' ? 'var(--dark-bg)' : 'var(--primary-color)', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>⛏️ Minecraft</button>
            )}
            {content.servers.fivem?.enabled && (
              <button onClick={() => setFilter('fivem')} style={{ padding: '0.75rem 1.5rem', background: filter === 'fivem' ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))' : 'var(--card-bg)', border: filter === 'fivem' ? 'none' : '2px solid var(--primary-color)', color: filter === 'fivem' ? 'var(--dark-bg)' : 'var(--primary-color)', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>🚗 FiveM</button>
            )}
          </div>
        )}

        <section className="forum-section">
          <div className="forum-categories">
            {filteredCategories?.map((category, index) => (
              <div key={index} className="forum-category">
                <div className="category-icon">
                  {category.serverType === 'minecraft' ? '⛏️' : category.serverType === 'fivem' ? '🚗' : '💬'}
                </div>
                <div className="category-info">
                  <h3>
                    {category.name}
                    {hasServers && category.serverType && category.serverType !== 'all' && (
                      <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'normal' }}>
                        ({category.serverType === 'minecraft' ? 'Minecraft' : 'FiveM'})
                      </span>
                    )}
                  </h3>
                  <p>{category.description}</p>
                  <div className="category-stats">
                    <span>{category.topics} Topics</span>
                    <span>{category.posts} Posts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="forum-info">
            <h3>Recent Activity</h3>
            <div className="recent-posts">
              <div className="recent-post">
                <div className="post-avatar">👤</div>
                <div className="post-content">
                  <h4>New Update Coming Soon!</h4>
                  <p className="post-meta">Posted by Admin • 2 hours ago</p>
                </div>
              </div>
              <div className="recent-post">
                <div className="post-avatar">👤</div>
                <div className="post-content">
                  <h4>{hasServers ? 'Looking for players!' : 'Looking for mechanics'}</h4>
                  <p className="post-meta">Posted by Player123 • 5 hours ago</p>
                </div>
              </div>
              <div className="recent-post">
                <div className="post-avatar">👤</div>
                <div className="post-content">
                  <h4>Great session last night!</h4>
                  <p className="post-meta">Posted by {hasServers ? 'Gamer' : 'RPFan'} • 1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="forum-rules">
          <h2>Forum Rules</h2>
          <div className="rules-grid">
            <div className="rule-card">
              <h3>1. Be Respectful</h3>
              <p>Treat all members with respect and courtesy</p>
            </div>
            <div className="rule-card">
              <h3>2. No Spam</h3>
              <p>Keep posts relevant and avoid spamming</p>
            </div>
            <div className="rule-card">
              <h3>3. Stay On Topic</h3>
              <p>Post in the appropriate category</p>
            </div>
            <div className="rule-card">
              <h3>4. Follow Guidelines</h3>
              <p>Adhere to server rules and community guidelines</p>
            </div>
          </div>
        </section>

        {hasServers && content.general?.discordLink && (
          <div className="connection-box" style={{ marginTop: '3rem' }}>
            <h3>Join Our Discord</h3>
            <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              Connect with the community, get support, and stay updated!
            </p>
            <a href={content.general.discordLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', padding: '1rem 2rem', backgroundColor: 'var(--primary-color)', color: 'var(--dark-bg)', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
              💬 Join Discord
            </a>
          </div>
        )}
      </div>
    </Layout>
  );
}
