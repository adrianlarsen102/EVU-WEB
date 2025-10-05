import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDefaultPassword, setIsDefaultPassword] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('server');
  const [content, setContent] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Password change form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setIsDefaultPassword(data.isDefaultPassword);
        if (data.isDefaultPassword) {
          setShowPasswordChange(true);
        }
        loadContent();
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok) {
        setIsAuthenticated(true);
        setIsDefaultPassword(data.isDefaultPassword);
        setLoginError('');

        if (data.isDefaultPassword) {
          setShowPasswordChange(true);
        }

        loadContent();
      } else {
        setLoginError(data.error || 'Invalid password');
      }
    } catch (error) {
      setLoginError('Login failed');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }

    if (newPassword === 'admin123') {
      setPasswordError('Please choose a different password than the default');
      return;
    }

    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword, confirmPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setShowPasswordChange(false);
        setIsDefaultPassword(false);
        setNewPassword('');
        setConfirmPassword('');
        showMessage('success', 'Password changed successfully! Your account is now secure.');
      } else {
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch (error) {
      setPasswordError('Failed to change password');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setContent(null);
    setIsDefaultPassword(false);
    setShowPasswordChange(false);
  };

  const loadContent = async () => {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      setContent(data);
    } catch (error) {
      console.error('Load error:', error);
    }
  };

  const saveContent = async () => {
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });

      if (res.ok) {
        showMessage('success', 'Changes saved successfully!');
      } else {
        showMessage('error', 'Error saving changes!');
      }
    } catch (error) {
      showMessage('error', 'Error saving changes!');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const updateServerInfo = (field, value) => {
    setContent(prev => ({
      ...prev,
      serverInfo: { ...prev.serverInfo, [field]: value }
    }));
  };

  const updateServerStatus = (field, value) => {
    setContent(prev => ({
      ...prev,
      serverStatus: { ...prev.serverStatus, [field]: value }
    }));
  };

  const updateJoinInfo = (field, value) => {
    setContent(prev => ({
      ...prev,
      joinInfo: { ...prev.joinInfo, [field]: value }
    }));
  };

  const addFeature = () => {
    setContent(prev => ({
      ...prev,
      features: [...(prev.features || []), { icon: '🎮', title: 'New Feature', description: 'Description' }]
    }));
  };

  const updateFeature = (index, field, value) => {
    setContent(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? { ...f, [field]: value } : f)
    }));
  };

  const removeFeature = (index) => {
    setContent(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addChangelog = () => {
    const today = new Date().toISOString().split('T')[0];
    setContent(prev => ({
      ...prev,
      changelog: [
        { version: '1.0.0', date: today, changes: { features: [], improvements: [], fixes: [] } },
        ...(prev.changelog || [])
      ]
    }));
  };

  const updateChangelog = (index, field, value) => {
    setContent(prev => ({
      ...prev,
      changelog: prev.changelog.map((c, i) => i === index ? { ...c, [field]: value } : c)
    }));
  };

  const updateChangelogChanges = (index, type, value) => {
    const items = value.split('\n').filter(i => i.trim());
    setContent(prev => ({
      ...prev,
      changelog: prev.changelog.map((c, i) =>
        i === index ? { ...c, changes: { ...c.changes, [type]: items } } : c
      )
    }));
  };

  const removeChangelog = (index) => {
    setContent(prev => ({
      ...prev,
      changelog: prev.changelog.filter((_, i) => i !== index)
    }));
  };

  const addForumCategory = () => {
    setContent(prev => ({
      ...prev,
      forumCategories: [...(prev.forumCategories || []), { name: 'New Category', description: 'Description', topics: 0, posts: 0 }]
    }));
  };

  const updateForumCategory = (index, field, value) => {
    setContent(prev => ({
      ...prev,
      forumCategories: prev.forumCategories.map((c, i) =>
        i === index ? { ...c, [field]: field === 'topics' || field === 'posts' ? parseInt(value) || 0 : value } : c
      )
    }));
  };

  const removeForumCategory = (index) => {
    setContent(prev => ({
      ...prev,
      forumCategories: prev.forumCategories.filter((_, i) => i !== index)
    }));
  };

  // Password Change Modal
  if (isAuthenticated && showPasswordChange) {
    return (
      <>
        <Head>
          <title>Change Password - EVU Server Admin</title>
          <link rel="stylesheet" href="/styles/style.css" />
          <link rel="stylesheet" href="/styles/admin.css" />
        </Head>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px'
        }}>
          <div className="admin-card" style={{ maxWidth: '500px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>⚠️ Change Default Password</h2>
              <p style={{ color: 'var(--accent-color)' }}>
                For security reasons, you must change the default password before continuing.
              </p>
            </div>
            {passwordError && (
              <div className="alert alert-error">
                {passwordError}
              </div>
            )}
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  className="form-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  className="form-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-admin btn-admin-primary" style={{ flex: 1 }}>
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-admin btn-admin-danger"
                  style={{ flex: 1 }}
                >
                  Logout
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>Admin Login - EVU Server</title>
          <link rel="stylesheet" href="/styles/style.css" />
          <link rel="stylesheet" href="/styles/admin.css" />
        </Head>
        <div className="admin-login-wrapper">
          <div className="admin-card" style={{ maxWidth: '450px', width: '100%' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '0.5rem' }}>🔐 Admin Login</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Enter your credentials to continue</p>
            </div>
            {loginError && (
              <div className="alert alert-error">
                {loginError}
              </div>
            )}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                />
              </div>
              <button type="submit" className="btn-admin btn-admin-primary" style={{ width: '100%' }}>
                Login
              </button>
            </form>
            <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
              Default: admin / admin123
            </p>
          </div>
        </div>
      </>
    );
  }

  if (!content) {
    return (
      <>
        <Head>
          <title>Loading... - EVU Server Admin</title>
          <link rel="stylesheet" href="/styles/style.css" />
          <link rel="stylesheet" href="/styles/admin.css" />
        </Head>
        <div className="admin-login-wrapper">
          <div style={{ textAlign: 'center', color: 'var(--primary-color)' }}>
            <h2>Loading...</h2>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Panel - EVU Server</title>
        <link rel="stylesheet" href="/styles/style.css" />
        <link rel="stylesheet" href="/styles/admin.css" />
      </Head>

      <div className="admin-wrapper">
        {/* Admin Navbar */}
        <nav className="admin-navbar">
          <div className="admin-navbar-content">
            <div className="admin-navbar-left">
              <h1 className="admin-logo">⚙️ EVU ADMIN</h1>
              <Link href="/" className="admin-nav-link">
                ← Back to Site
              </Link>
            </div>
            <div className="admin-navbar-right">
              {isDefaultPassword && (
                <span className="admin-warning-badge">
                  ⚠️ Default Password
                </span>
              )}
              <button onClick={() => setShowPasswordChange(true)} className="btn-admin btn-admin-secondary">
                Change Password
              </button>
              <button onClick={handleLogout} className="btn-admin btn-admin-danger">
                Logout
              </button>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="admin-content">
          <div className="admin-container">
            {message.text && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                {message.text}
              </div>
            )}

            {/* Tabs */}
            <div className="admin-tabs">
              <button
                className={`admin-tab ${activeTab === 'server' ? 'active' : ''}`}
                onClick={() => setActiveTab('server')}
              >
                🖥️ Server Info
              </button>
              <button
                className={`admin-tab ${activeTab === 'features' ? 'active' : ''}`}
                onClick={() => setActiveTab('features')}
              >
                ⭐ Features
              </button>
              <button
                className={`admin-tab ${activeTab === 'join' ? 'active' : ''}`}
                onClick={() => setActiveTab('join')}
              >
                🔗 Join Info
              </button>
              <button
                className={`admin-tab ${activeTab === 'changelog' ? 'active' : ''}`}
                onClick={() => setActiveTab('changelog')}
              >
                📝 Changelog
              </button>
              <button
                className={`admin-tab ${activeTab === 'forum' ? 'active' : ''}`}
                onClick={() => setActiveTab('forum')}
              >
                💬 Forum
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'server' && (
              <div className="admin-tab-content">
                <div className="admin-card">
                  <h3 className="admin-card-title">Server Information</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Server Name</label>
                      <input
                        type="text"
                        className="form-input"
                        value={content.serverInfo?.name || ''}
                        onChange={(e) => updateServerInfo('name', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        className="form-input"
                        value={content.serverInfo?.title || ''}
                        onChange={(e) => updateServerInfo('title', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Subtitle</label>
                      <input
                        type="text"
                        className="form-input"
                        value={content.serverInfo?.subtitle || ''}
                        onChange={(e) => updateServerInfo('subtitle', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label>Version</label>
                      <input
                        type="text"
                        className="form-input"
                        value={content.serverInfo?.version || ''}
                        onChange={(e) => updateServerInfo('version', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="admin-card">
                  <h3 className="admin-card-title">Server Status</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        className="form-input"
                        value={content.serverStatus?.isOnline}
                        onChange={(e) => updateServerStatus('isOnline', e.target.value === 'true')}
                      >
                        <option value="true">Online</option>
                        <option value="false">Offline</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Max Players</label>
                      <input
                        type="number"
                        className="form-input"
                        value={content.serverStatus?.maxPlayers || 64}
                        onChange={(e) => updateServerStatus('maxPlayers', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Uptime</label>
                      <input
                        type="text"
                        className="form-input"
                        value={content.serverStatus?.uptime || ''}
                        onChange={(e) => updateServerStatus('uptime', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button onClick={saveContent} className="btn-admin btn-admin-primary">
                  💾 Save Server Info
                </button>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="admin-tab-content">
                <div className="admin-card">
                  <h3 className="admin-card-title">Server Features</h3>
                  {content.features?.map((feature, index) => (
                    <div key={index} className="admin-item-card">
                      <div className="admin-item-header">
                        <h4>Feature #{index + 1}</h4>
                        <button
                          onClick={() => removeFeature(index)}
                          className="btn-admin btn-admin-danger btn-admin-sm"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Icon (emoji)</label>
                          <input
                            type="text"
                            className="form-input"
                            value={feature.icon}
                            onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={feature.title}
                            onChange={(e) => updateFeature(index, 'title', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          className="form-input"
                          value={feature.description}
                          onChange={(e) => updateFeature(index, 'description', e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}
                  <button onClick={addFeature} className="btn-admin btn-admin-secondary">
                    ➕ Add Feature
                  </button>
                </div>
                <button onClick={saveContent} className="btn-admin btn-admin-primary">
                  💾 Save Features
                </button>
              </div>
            )}

            {activeTab === 'join' && (
              <div className="admin-tab-content">
                <div className="admin-card">
                  <h3 className="admin-card-title">Join Information</h3>
                  <div className="form-group">
                    <label>Server IP / Connect Command</label>
                    <input
                      type="text"
                      className="form-input"
                      value={content.joinInfo?.serverIP || ''}
                      onChange={(e) => updateJoinInfo('serverIP', e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Discord Link</label>
                    <input
                      type="text"
                      className="form-input"
                      value={content.joinInfo?.discordLink || ''}
                      onChange={(e) => updateJoinInfo('discordLink', e.target.value)}
                    />
                  </div>
                </div>
                <button onClick={saveContent} className="btn-admin btn-admin-primary">
                  💾 Save Join Info
                </button>
              </div>
            )}

            {activeTab === 'changelog' && (
              <div className="admin-tab-content">
                <div className="admin-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 className="admin-card-title" style={{ marginBottom: 0 }}>Changelog Entries</h3>
                    <button onClick={addChangelog} className="btn-admin btn-admin-secondary">
                      ➕ Add Version
                    </button>
                  </div>
                  {content.changelog?.map((entry, index) => (
                    <div key={index} className="admin-item-card">
                      <div className="admin-item-header">
                        <h4>Version {entry.version}</h4>
                        <button
                          onClick={() => removeChangelog(index)}
                          className="btn-admin btn-admin-danger btn-admin-sm"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Version</label>
                          <input
                            type="text"
                            className="form-input"
                            value={entry.version}
                            onChange={(e) => updateChangelog(index, 'version', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Date</label>
                          <input
                            type="date"
                            className="form-input"
                            value={entry.date}
                            onChange={(e) => updateChangelog(index, 'date', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Features (one per line)</label>
                        <textarea
                          className="form-input"
                          value={entry.changes.features?.join('\n') || ''}
                          onChange={(e) => updateChangelogChanges(index, 'features', e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="form-group">
                        <label>Improvements (one per line)</label>
                        <textarea
                          className="form-input"
                          value={entry.changes.improvements?.join('\n') || ''}
                          onChange={(e) => updateChangelogChanges(index, 'improvements', e.target.value)}
                          rows={4}
                        />
                      </div>
                      <div className="form-group">
                        <label>Fixes (one per line)</label>
                        <textarea
                          className="form-input"
                          value={entry.changes.fixes?.join('\n') || ''}
                          onChange={(e) => updateChangelogChanges(index, 'fixes', e.target.value)}
                          rows={4}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={saveContent} className="btn-admin btn-admin-primary">
                  💾 Save Changelog
                </button>
              </div>
            )}

            {activeTab === 'forum' && (
              <div className="admin-tab-content">
                <div className="admin-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h3 className="admin-card-title" style={{ marginBottom: 0 }}>Forum Categories</h3>
                    <button onClick={addForumCategory} className="btn-admin btn-admin-secondary">
                      ➕ Add Category
                    </button>
                  </div>
                  {content.forumCategories?.map((category, index) => (
                    <div key={index} className="admin-item-card">
                      <div className="admin-item-header">
                        <h4>{category.name}</h4>
                        <button
                          onClick={() => removeForumCategory(index)}
                          className="btn-admin btn-admin-danger btn-admin-sm"
                        >
                          🗑️ Remove
                        </button>
                      </div>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={category.name}
                            onChange={(e) => updateForumCategory(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Topics</label>
                          <input
                            type="number"
                            className="form-input"
                            value={category.topics}
                            onChange={(e) => updateForumCategory(index, 'topics', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Posts</label>
                          <input
                            type="number"
                            className="form-input"
                            value={category.posts}
                            onChange={(e) => updateForumCategory(index, 'posts', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Description</label>
                        <textarea
                          className="form-input"
                          value={category.description}
                          onChange={(e) => updateForumCategory(index, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={saveContent} className="btn-admin btn-admin-primary">
                  💾 Save Forum
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
