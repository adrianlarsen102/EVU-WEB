import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Link from 'next/link';
import { SkeletonCard, SkeletonList } from '../components/LoadingSkeleton';

export default function Forum() {
  const [content, setContent] = useState(null);
  const [filter, setFilter] = useState('all'); // all, minecraft, fivem
  const [recentTopics, setRecentTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(err => console.error('Failed to load content:', err))
      .finally(() => setLoading(false));

    // Fetch recent topics for activity feed
    fetchRecentTopics();
  }, []);

  const fetchRecentTopics = async () => {
    try {
      const res = await fetch('/api/forum/recent?limit=5');
      if (res.ok) {
        const data = await res.json();
        setRecentTopics(data);
      }
    } catch (err) {
      console.error('Failed to load recent topics:', err);
    } finally {
      setLoadingRecent(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes <= 1 ? 'Just now' : `${minutes} minutes ago`;
      }
      return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    }
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

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
            {loading ? (
              <SkeletonCard count={4} />
            ) : (
              filteredCategories?.map((category, index) => (
                <Link
                  key={index}
                  href={`/forum/${index}`}
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div className="forum-category" style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
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
                </Link>
              ))
            )}
          </div>

          <div className="forum-info">
            <h3>Recent Activity</h3>
            <div className="recent-posts">
              {loadingRecent ? (
                <SkeletonList count={5} />
              ) : recentTopics.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
                  No topics yet. Be the first to start a discussion!
                </p>
              ) : (
                recentTopics.map((topic) => (
                  <Link
                    key={topic.id}
                    href={`/forum/topic/${topic.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="recent-post" style={{ cursor: 'pointer', transition: 'background-color 0.2s' }}>
                      <div className="post-avatar">👤</div>
                      <div className="post-content">
                        <h4>{topic.title}</h4>
                        <p className="post-meta">Posted by {topic.author_username} • {formatDate(topic.created_at)}</p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
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
