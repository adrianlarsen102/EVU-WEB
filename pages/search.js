import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Link from 'next/link';
import { fetchWithTimeout } from '../lib/fetchWithTimeout';

export default function Search() {
  const router = useRouter();
  const { q } = router.query;

  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    if (q) {
      setSearchQuery(q);
      performSearch(q, filterType);
    }
  }, [q]);

  const performSearch = async (query, type = 'all') => {
    if (!query || query.length < 2) {
      setError('Please enter at least 2 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetchWithTimeout(`/api/search?q=${encodeURIComponent(query)}&type=${type}`, {}, 10000);
      const data = await res.json();

      if (res.ok) {
        setResults(data);
      } else {
        setError(data.error || 'Search failed');
      }
    } catch (error) {
      setError('Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleFilterChange = (type) => {
    setFilterType(type);
    if (searchQuery) {
      performSearch(searchQuery, type);
    }
  };

  return (
    <Layout title="Search - EVU Server">
      <div className="hero">
        <div className="container">
          <h1>🔍 Search</h1>
          <p>Search forums, users, and changelog</p>
        </div>
      </div>

      <div className="container main-content">
        {/* Search Form */}
        <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              style={{
                flex: 1,
                padding: '1rem',
                fontSize: '1.1rem',
                backgroundColor: 'var(--secondary-color)',
                border: '2px solid var(--primary-color)',
                borderRadius: '10px',
                color: 'var(--text-primary)'
              }}
            />
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                backgroundColor: loading ? 'var(--text-secondary)' : 'var(--primary-color)',
                color: 'var(--dark-bg)',
                border: 'none',
                borderRadius: '10px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => !loading && (e.target.style.transform = 'scale(1.05)')}
              onMouseOut={(e) => !loading && (e.target.style.transform = 'scale(1)')}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Filter Tabs */}
        {results && (
          <div style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            {['all', 'forum', 'users', 'changelog'].map(type => (
              <button
                key={type}
                onClick={() => handleFilterChange(type)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: filterType === type ? 'var(--primary-color)' : 'var(--card-bg)',
                  color: filterType === type ? 'var(--dark-bg)' : 'var(--text-primary)',
                  border: filterType === type ? 'none' : '2px solid var(--card-bg)',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '1rem',
            backgroundColor: 'rgba(255, 0, 110, 0.1)',
            border: '1px solid var(--accent-color)',
            borderRadius: '8px',
            color: 'var(--accent-color)',
            textAlign: 'center',
            marginBottom: '2rem'
          }}>
            {error}
          </div>
        )}

        {/* Results */}
        {results && (
          <>
            <div style={{
              textAlign: 'center',
              marginBottom: '2rem',
              color: 'var(--text-secondary)',
              fontSize: '1.1rem'
            }}>
              Found {results.totalResults} result{results.totalResults !== 1 ? 's' : ''} for "{results.query}"
            </div>

            {/* Forum Topics */}
            {(filterType === 'all' || filterType === 'forum') && results.results.forum.topics.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                  📝 Forum Topics ({results.results.forum.topics.length})
                </h2>
                <div className="info-grid">
                  {results.results.forum.topics.map(topic => (
                    <Link
                      key={topic.id}
                      href={`/forum/topic/${topic.id}`}
                      className="info-card"
                      style={{ textDecoration: 'none', cursor: 'pointer' }}
                    >
                      <h3>{topic.title}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        {topic.content.substring(0, 150)}...
                      </p>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        By {topic.author_username} • {new Date(topic.created_at).toLocaleDateString()} • {topic.views_count} views
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Forum Comments */}
            {(filterType === 'all' || filterType === 'forum') && results.results.forum.comments.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                  💬 Comments ({results.results.forum.comments.length})
                </h2>
                <div className="info-grid">
                  {results.results.forum.comments.map(comment => (
                    <Link
                      key={comment.id}
                      href={`/forum/topic/${comment.topic_id}#comment-${comment.id}`}
                      className="info-card"
                      style={{ textDecoration: 'none', cursor: 'pointer' }}
                    >
                      <p style={{ marginBottom: '1rem' }}>{comment.content.substring(0, 200)}...</p>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        By {comment.author_username} • {new Date(comment.created_at).toLocaleDateString()}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Users */}
            {(filterType === 'all' || filterType === 'users') && results.results.users.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                  👤 Users ({results.results.users.length})
                </h2>
                <div className="info-grid">
                  {results.results.users.map(user => (
                    <div key={user.id} className="info-card">
                      <h3>{user.display_name || user.username}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                        @{user.username}
                      </p>
                      {user.role === 'admin' && (
                        <span style={{
                          display: 'inline-block',
                          marginTop: '0.5rem',
                          padding: '0.25rem 0.75rem',
                          backgroundColor: 'var(--primary-color)',
                          color: 'var(--dark-bg)',
                          borderRadius: '5px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          ADMIN
                        </span>
                      )}
                      <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Changelog */}
            {(filterType === 'all' || filterType === 'changelog') && results.results.changelog.length > 0 && (
              <div style={{ marginBottom: '3rem' }}>
                <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                  📋 Changelog ({results.results.changelog.length})
                </h2>
                <div className="info-grid">
                  {results.results.changelog.map((entry, index) => (
                    <div key={index} className="info-card">
                      <h3>Version {entry.version}</h3>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                      {entry.changes.features && entry.changes.features.length > 0 && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong style={{ color: 'var(--success-color)' }}>✨ Features:</strong>
                          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                            {entry.changes.features.slice(0, 3).map((feature, i) => (
                              <li key={i} style={{ fontSize: '0.9rem' }}>{feature}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {results.totalResults === 0 && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: 'var(--text-secondary)'
              }}>
                <h2 style={{ marginBottom: '1rem' }}>No results found</h2>
                <p>Try different keywords or check your spelling</p>
              </div>
            )}
          </>
        )}

        {/* Initial State */}
        {!results && !loading && !error && (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-secondary)'
          }}>
            <h2 style={{ marginBottom: '1rem' }}>Start Searching</h2>
            <p>Enter your search query above to find topics, comments, users, and more!</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
