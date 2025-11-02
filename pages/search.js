import { useState, useEffect, useRef } from 'react';
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

  // Autocomplete state
  const [suggestions, setSuggestions] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const debounceTimeout = useRef(null);
  const suggestionsRef = useRef(null);

  useEffect(() => {
    if (q) {
      setSearchQuery(q);
      performSearch(q, filterType);
    }
  }, [q]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Fetch autocomplete suggestions with debouncing
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions(null);
      setShowSuggestions(false);
      return;
    }

    try {
      const res = await fetchWithTimeout(`/api/search/autocomplete?q=${encodeURIComponent(query)}`, {}, 5000);
      const data = await res.json();

      if (res.ok) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
        setSelectedSuggestionIndex(-1);
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing timeout
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set new timeout for autocomplete
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300); // 300ms debounce
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!showSuggestions || !suggestions) return;

    const allSuggestions = [
      ...(suggestions.forum || []),
      ...(suggestions.users || []),
      ...(suggestions.changelog || [])
    ];

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev =>
        prev < allSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      const selected = allSuggestions[selectedSuggestionIndex];
      if (selected.title) {
        // Forum topic
        router.push(`/forum/topic/${selected.id}`);
      } else if (selected.username) {
        // User - just search for them
        setSearchQuery(selected.username);
        router.push(`/search?q=${encodeURIComponent(selected.username)}`);
      } else if (selected.version) {
        // Changelog
        router.push(`/changelog#${selected.version}`);
      }
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Select suggestion
  const selectSuggestion = (suggestion, type) => {
    setShowSuggestions(false);
    if (type === 'forum') {
      router.push(`/forum/topic/${suggestion.id}`);
    } else if (type === 'user') {
      setSearchQuery(suggestion.username);
      router.push(`/search?q=${encodeURIComponent(suggestion.username)}`);
    } else if (type === 'changelog') {
      router.push(`/changelog#${suggestion.version}`);
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
        {/* Search Form with Autocomplete */}
        <form onSubmit={handleSearch} style={{ marginBottom: '2rem' }}>
          <div style={{
            display: 'flex',
            gap: '1rem',
            maxWidth: '800px',
            margin: '0 auto',
            position: 'relative'
          }} ref={suggestionsRef}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions && setShowSuggestions(true)}
                placeholder="Search..."
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  backgroundColor: 'var(--secondary-color)',
                  border: '2px solid var(--primary-color)',
                  borderRadius: '10px',
                  color: 'var(--text-primary)'
                }}
              />

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && suggestions && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '0.5rem',
                  backgroundColor: 'var(--card-bg)',
                  border: '2px solid var(--primary-color)',
                  borderRadius: '10px',
                  maxHeight: '400px',
                  overflowY: 'auto',
                  zIndex: 1000,
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)'
                }}>
                  {/* Forum Suggestions */}
                  {suggestions.forum && suggestions.forum.length > 0 && (
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--secondary-color)' }}>
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase'
                      }}>
                        📝 Forum Topics
                      </div>
                      {suggestions.forum.map((topic, index) => (
                        <div
                          key={topic.id}
                          onClick={() => selectSuggestion(topic, 'forum')}
                          style={{
                            padding: '0.75rem',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            backgroundColor: selectedSuggestionIndex === index ? 'var(--primary-color)' : 'transparent',
                            color: selectedSuggestionIndex === index ? 'var(--dark-bg)' : 'var(--text-primary)',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedSuggestionIndex !== index) {
                              e.target.style.backgroundColor = 'var(--secondary-color)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedSuggestionIndex !== index) {
                              e.target.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {topic.title}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* User Suggestions */}
                  {suggestions.users && suggestions.users.length > 0 && (
                    <div style={{ padding: '1rem', borderBottom: '1px solid var(--secondary-color)' }}>
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase'
                      }}>
                        👤 Users
                      </div>
                      {suggestions.users.map((user, index) => {
                        const globalIndex = (suggestions.forum?.length || 0) + index;
                        return (
                          <div
                            key={user.id}
                            onClick={() => selectSuggestion(user, 'user')}
                            style={{
                              padding: '0.75rem',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              backgroundColor: selectedSuggestionIndex === globalIndex ? 'var(--primary-color)' : 'transparent',
                              color: selectedSuggestionIndex === globalIndex ? 'var(--dark-bg)' : 'var(--text-primary)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedSuggestionIndex !== globalIndex) {
                                e.target.style.backgroundColor = 'var(--secondary-color)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedSuggestionIndex !== globalIndex) {
                                e.target.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            {user.display_name || user.username} {user.role === 'admin' && '👑'}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Changelog Suggestions */}
                  {suggestions.changelog && suggestions.changelog.length > 0 && (
                    <div style={{ padding: '1rem' }}>
                      <div style={{
                        fontSize: '0.85rem',
                        fontWeight: 'bold',
                        color: 'var(--text-secondary)',
                        marginBottom: '0.5rem',
                        textTransform: 'uppercase'
                      }}>
                        📋 Changelog
                      </div>
                      {suggestions.changelog.map((entry, index) => {
                        const globalIndex = (suggestions.forum?.length || 0) + (suggestions.users?.length || 0) + index;
                        return (
                          <div
                            key={entry.version}
                            onClick={() => selectSuggestion(entry, 'changelog')}
                            style={{
                              padding: '0.75rem',
                              borderRadius: '5px',
                              cursor: 'pointer',
                              backgroundColor: selectedSuggestionIndex === globalIndex ? 'var(--primary-color)' : 'transparent',
                              color: selectedSuggestionIndex === globalIndex ? 'var(--dark-bg)' : 'var(--text-primary)',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (selectedSuggestionIndex !== globalIndex) {
                                e.target.style.backgroundColor = 'var(--secondary-color)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (selectedSuggestionIndex !== globalIndex) {
                                e.target.style.backgroundColor = 'transparent';
                              }
                            }}
                          >
                            Version {entry.version} - {new Date(entry.date).toLocaleDateString()}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* No Suggestions */}
                  {(!suggestions.forum || suggestions.forum.length === 0) &&
                   (!suggestions.users || suggestions.users.length === 0) &&
                   (!suggestions.changelog || suggestions.changelog.length === 0) && (
                    <div style={{
                      padding: '1rem',
                      textAlign: 'center',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem'
                    }}>
                      No suggestions found
                    </div>
                  )}
                </div>
              )}
            </div>

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

// Force server-side rendering
export async function getServerSideProps() {
  return { props: {} };
}
