import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/Layout';
import Link from 'next/link';

export default function CategoryTopics() {
  const router = useRouter();
  const { categoryId } = router.query;
  const [content, setContent] = useState(null);
  const [topics, setTopics] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(null);
  const [showCreateTopic, setShowCreateTopic] = useState(false);
  const [newTopic, setNewTopic] = useState({ title: '', content: '' });

  useEffect(() => {
    // Fetch content to get category info
    fetch('/api/content')
      .then(res => res.json())
      .then(data => {
        setContent(data);
        const cat = data.forumCategories?.find((c, idx) => idx === parseInt(categoryId));
        setCategory(cat);
      })
      .catch(err => console.error('Failed to load content:', err));

    // Check authentication
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => setAuth(data))
      .catch(() => setAuth({ authenticated: false }));
  }, [categoryId]);

  useEffect(() => {
    if (categoryId !== undefined) {
      fetchTopics();
    }
  }, [categoryId]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/forum/topics?categoryId=${categoryId}`);
      const data = await res.json();
      setTopics(data);
    } catch (err) {
      console.error('Failed to load topics:', err);
    }
    setLoading(false);
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();

    if (!newTopic.title || !newTopic.content) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const res = await fetch('/api/forum/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId: parseInt(categoryId),
          title: newTopic.title,
          content: newTopic.content
        })
      });

      if (res.ok) {
        setNewTopic({ title: '', content: '' });
        setShowCreateTopic(false);
        fetchTopics();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create topic');
      }
    } catch (err) {
      console.error('Failed to create topic:', err);
      alert('Failed to create topic');
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

  return (
    <Layout title={`EVU - ${category?.name || 'Forum'}`}>
      <div className="hero">
        <div className="container">
          <h1>{category?.name || 'Forum Category'}</h1>
          <p>{category?.description || 'Browse and discuss topics'}</p>
        </div>
      </div>

      <div className="container main-content">
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <Link href="/forum" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
            ← Back to Categories
          </Link>

          {auth?.authenticated && (
            <button
              onClick={() => setShowCreateTopic(!showCreateTopic)}
              style={{
                padding: '0.75rem 1.5rem',
                background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                border: 'none',
                color: 'var(--dark-bg)',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              {showCreateTopic ? 'Cancel' : '+ New Topic'}
            </button>
          )}
        </div>

        {!auth?.authenticated && (
          <div className="connection-box" style={{ marginBottom: '2rem' }}>
            <p>
              <Link href="/profile" style={{ color: 'var(--primary-color)' }}>
                Log in
              </Link> to create topics and post comments
            </p>
          </div>
        )}

        {showCreateTopic && (
          <div className="forum-category" style={{ marginBottom: '2rem' }}>
            <h3>Create New Topic</h3>
            <form onSubmit={handleCreateTopic} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="text"
                placeholder="Topic Title"
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                style={{
                  padding: '0.75rem',
                  background: 'var(--card-bg)',
                  border: '2px solid var(--primary-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '1rem'
                }}
                maxLength={200}
              />
              <textarea
                placeholder="Topic Content"
                value={newTopic.content}
                onChange={(e) => setNewTopic({ ...newTopic, content: e.target.value })}
                rows={8}
                style={{
                  padding: '0.75rem',
                  background: 'var(--card-bg)',
                  border: '2px solid var(--primary-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
                maxLength={10000}
              />
              <button
                type="submit"
                style={{
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                  border: 'none',
                  color: 'var(--dark-bg)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Create Topic
              </button>
            </form>
          </div>
        )}

        <div className="forum-categories">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Loading topics...</div>
          ) : topics.length === 0 ? (
            <div className="forum-category">
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                No topics yet. Be the first to create one!
              </p>
            </div>
          ) : (
            topics.map((topic) => (
              <Link
                key={topic.id}
                href={`/forum/topic/${topic.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="forum-category" style={{ cursor: 'pointer' }}>
                  <div className="category-icon">💬</div>
                  <div className="category-info" style={{ flex: 1 }}>
                    <h3>
                      {topic.is_pinned && <span style={{ color: 'var(--accent-color)', marginRight: '0.5rem' }}>📌</span>}
                      {topic.is_locked && <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>🔒</span>}
                      {topic.title}
                    </h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      By {topic.author_username} • {formatDate(topic.created_at)}
                    </p>
                    <div className="category-stats">
                      <span>{topic.comment_count} Comments</span>
                      <span>{topic.view_count} Views</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
}
