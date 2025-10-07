import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/Layout';
import Link from 'next/link';

export default function TopicView() {
  const router = useRouter();
  const { topicId } = router.query;
  const [topic, setTopic] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);

  useEffect(() => {
    // Check authentication
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => setAuth(data))
      .catch(() => setAuth({ authenticated: false }));
  }, []);

  useEffect(() => {
    if (topicId) {
      fetchTopic();
      fetchComments();
    }
  }, [topicId]);

  const fetchTopic = async () => {
    try {
      const res = await fetch(`/api/forum/topics?topicId=${topicId}`);
      if (res.ok) {
        const data = await res.json();
        setTopic(data);
      } else {
        router.push('/forum');
      }
    } catch (err) {
      console.error('Failed to load topic:', err);
    }
    setLoading(false);
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/forum/comments?topicId=${topicId}`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error('Failed to load comments:', err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();

    if (!newComment.trim()) {
      alert('Please enter a comment');
      return;
    }

    try {
      const res = await fetch('/api/forum/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          content: newComment
        })
      });

      if (res.ok) {
        setNewComment('');
        fetchComments();
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to post comment');
      }
    } catch (err) {
      console.error('Failed to post comment:', err);
      alert('Failed to post comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const res = await fetch('/api/forum/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ commentId })
      });

      if (res.ok) {
        fetchComments();
      } else {
        alert('Failed to delete comment');
      }
    } catch (err) {
      console.error('Failed to delete comment:', err);
      alert('Failed to delete comment');
    }
  };

  const handleDeleteTopic = async () => {
    if (!confirm('Are you sure you want to delete this topic?')) return;

    try {
      const res = await fetch('/api/forum/topics', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId })
      });

      if (res.ok) {
        router.push('/forum');
      } else {
        alert('Failed to delete topic');
      }
    } catch (err) {
      console.error('Failed to delete topic:', err);
      alert('Failed to delete topic');
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

  if (loading) {
    return (
      <Layout title="EVU - Loading...">
        <div className="container main-content" style={{ textAlign: 'center', padding: '4rem 0' }}>
          Loading topic...
        </div>
      </Layout>
    );
  }

  if (!topic) {
    return (
      <Layout title="EVU - Topic Not Found">
        <div className="container main-content" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>Topic Not Found</h2>
          <Link href="/forum" style={{ color: 'var(--primary-color)' }}>
            Return to Forum
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`EVU - ${topic.title}`}>
      <div className="hero">
        <div className="container">
          <h1>{topic.title}</h1>
          <p>
            By {topic.author_username} • {formatDate(topic.created_at)}
            {topic.is_pinned && <span style={{ marginLeft: '1rem', color: 'var(--accent-color)' }}>📌 Pinned</span>}
            {topic.is_locked && <span style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>🔒 Locked</span>}
          </p>
        </div>
      </div>

      <div className="container main-content">
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/forum" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
            ← Back to Forum
          </Link>
        </div>

        {/* Topic Content */}
        <div className="forum-category" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div className="category-icon">👤</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3>{topic.author_username}</h3>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    {formatDate(topic.created_at)}
                  </p>
                </div>
                {auth?.authenticated && (auth.username === topic.author_username || auth.isAdmin) && (
                  <button
                    onClick={handleDeleteTopic}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'rgba(255, 0, 0, 0.2)',
                      border: '1px solid rgba(255, 0, 0, 0.5)',
                      color: '#ff6b6b',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Delete Topic
                  </button>
                )}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                {topic.content}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Comments ({comments.length})</h2>

          {!auth?.authenticated && (
            <div className="connection-box" style={{ marginBottom: '2rem' }}>
              <p>
                <Link href="/profile" style={{ color: 'var(--primary-color)' }}>
                  Log in
                </Link> to post comments
              </p>
            </div>
          )}

          {auth?.authenticated && !topic.is_locked && (
            <div className="connection-box" style={{ marginBottom: '2rem', textAlign: 'left' }}>
              <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>Post a Comment</h3>
              <form onSubmit={handlePostComment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                  className="form-input"
                  style={{ resize: 'vertical', minHeight: '100px' }}
                  maxLength={5000}
                  required
                />
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    style={{
                      padding: '0.75rem 2rem',
                      background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                      border: 'none',
                      color: 'var(--dark-bg)',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    Post Comment
                  </button>
                </div>
              </form>
            </div>
          )}

          {topic.is_locked && (
            <div className="connection-box" style={{ marginBottom: '2rem', background: 'rgba(255, 165, 0, 0.1)', border: '1px solid rgba(255, 165, 0, 0.3)' }}>
              <p>🔒 This topic is locked. No new comments can be posted.</p>
            </div>
          )}

          {comments.length === 0 ? (
            <div className="forum-category">
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                No comments yet. Be the first to comment!
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {comments.map((comment) => (
                <div key={comment.id} className="forum-category">
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                    <div className="category-icon">👤</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h4>{comment.author_username}</h4>
                          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {formatDate(comment.created_at)}
                          </p>
                        </div>
                        {auth?.authenticated && (auth.username === comment.author_username || auth.isAdmin) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            style={{
                              padding: '0.25rem 0.75rem',
                              background: 'rgba(255, 0, 0, 0.2)',
                              border: '1px solid rgba(255, 0, 0, 0.5)',
                              color: '#ff6b6b',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '0.85rem'
                            }}
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {comment.content}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
