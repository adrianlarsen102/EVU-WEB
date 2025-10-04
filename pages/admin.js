import { useState, useEffect } from 'react';
import Head from 'next/head';

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
          <title>Change Password - EVU Server</title>
        </Head>
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="login-form" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h2>⚠️ Change Default Password</h2>
            <p style={{ marginBottom: '1.5rem', color: 'var(--accent-color)' }}>
              For security reasons, you must change the default password before continuing.
            </p>
            {passwordError && (
              <div className="error-message" style={{ display: 'block', marginBottom: '1rem' }}>
                {passwordError}
              </div>
            )}
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label htmlFor="newPassword">New Password:</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 8 characters"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password:</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn" style={{ flex: 1 }}>
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn btn-secondary"
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
        </Head>
        <div className="login-form">
          <h2>Admin Login</h2>
          {loginError && <div className="error-message" style={{ display: 'block' }}>{loginError}</div>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                required
              />
            </div>
            <button type="submit" className="btn" style={{ width: '100%' }}>Login</button>
          </form>
          <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'rgba(255, 255, 255, 0.6)', textAlign: 'center' }}>
            Default credentials: admin / admin123
          </p>
        </div>
      </>
    );
  }

  if (!content) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Admin Panel - EVU Server</title>
      </Head>

      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Panel</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {isDefaultPassword && (
              <span style={{ color: 'var(--accent-color)', fontSize: '0.875rem' }}>
                ⚠️ Using default password
              </span>
            )}
            <button onClick={() => setShowPasswordChange(true)} className="btn btn-secondary">
              Change Password
            </button>
            <button onClick={handleLogout} className="btn btn-danger">Logout</button>
          </div>
        </div>

        {message.text && (
          <div className={`${message.type === 'success' ? 'success-message' : 'error-message'}`} style={{ display: 'block' }}>
            {message.text}
          </div>
        )}

        <div className="tabs">
          <button className={`tab ${activeTab === 'server' ? 'active' : ''}`} onClick={() => setActiveTab('server')}>Server Info</button>
          <button className={`tab ${activeTab === 'features' ? 'active' : ''}`} onClick={() => setActiveTab('features')}>Features</button>
          <button className={`tab ${activeTab === 'join' ? 'active' : ''}`} onClick={() => setActiveTab('join')}>Join Info</button>
          <button className={`tab ${activeTab === 'changelog' ? 'active' : ''}`} onClick={() => setActiveTab('changelog')}>Changelog</button>
          <button className={`tab ${activeTab === 'forum' ? 'active' : ''}`} onClick={() => setActiveTab('forum')}>Forum</button>
        </div>

        {activeTab === 'server' && (
          <div className="tab-content active">
            <div className="section-card">
              <h3>Server Information</h3>
              <div className="form-group">
                <label>Server Name:</label>
                <input type="text" value={content.serverInfo?.name || ''} onChange={(e) => updateServerInfo('name', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Title:</label>
                <input type="text" value={content.serverInfo?.title || ''} onChange={(e) => updateServerInfo('title', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Subtitle:</label>
                <input type="text" value={content.serverInfo?.subtitle || ''} onChange={(e) => updateServerInfo('subtitle', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Version:</label>
                <input type="text" value={content.serverInfo?.version || ''} onChange={(e) => updateServerInfo('version', e.target.value)} />
              </div>
            </div>

            <div className="section-card">
              <h3>Server Status</h3>
              <div className="form-group">
                <label>Status:</label>
                <select value={content.serverStatus?.isOnline} onChange={(e) => updateServerStatus('isOnline', e.target.value === 'true')}>
                  <option value="true">Online</option>
                  <option value="false">Offline</option>
                </select>
              </div>
              <div className="form-group">
                <label>Max Players:</label>
                <input type="number" value={content.serverStatus?.maxPlayers || 64} onChange={(e) => updateServerStatus('maxPlayers', parseInt(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Uptime:</label>
                <input type="text" value={content.serverStatus?.uptime || ''} onChange={(e) => updateServerStatus('uptime', e.target.value)} />
              </div>
            </div>

            <button onClick={saveContent} className="btn">Save Server Info</button>
          </div>
        )}

        {activeTab === 'features' && (
          <div className="tab-content active">
            <div className="section-card">
              <h3>Server Features</h3>
              {content.features?.map((feature, index) => (
                <div key={index} className="array-item">
                  <button onClick={() => removeFeature(index)} className="btn btn-danger remove-btn">Remove</button>
                  <div className="form-group">
                    <label>Icon (emoji):</label>
                    <input type="text" value={feature.icon} onChange={(e) => updateFeature(index, 'icon', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Title:</label>
                    <input type="text" value={feature.title} onChange={(e) => updateFeature(index, 'title', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea value={feature.description} onChange={(e) => updateFeature(index, 'description', e.target.value)} />
                  </div>
                </div>
              ))}
              <button onClick={addFeature} className="btn add-btn">Add Feature</button>
            </div>
            <button onClick={saveContent} className="btn">Save Features</button>
          </div>
        )}

        {activeTab === 'join' && (
          <div className="tab-content active">
            <div className="section-card">
              <h3>Join Information</h3>
              <div className="form-group">
                <label>Server IP/Connect Command:</label>
                <input type="text" value={content.joinInfo?.serverIP || ''} onChange={(e) => updateJoinInfo('serverIP', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Discord Link:</label>
                <input type="text" value={content.joinInfo?.discordLink || ''} onChange={(e) => updateJoinInfo('discordLink', e.target.value)} />
              </div>
            </div>
            <button onClick={saveContent} className="btn">Save Join Info</button>
          </div>
        )}

        {activeTab === 'changelog' && (
          <div className="tab-content active">
            <div className="section-card">
              <h3>Changelog Entries</h3>
              {content.changelog?.map((entry, index) => (
                <div key={index} className="array-item">
                  <button onClick={() => removeChangelog(index)} className="btn btn-danger remove-btn">Remove</button>
                  <div className="form-group">
                    <label>Version:</label>
                    <input type="text" value={entry.version} onChange={(e) => updateChangelog(index, 'version', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Date:</label>
                    <input type="date" value={entry.date} onChange={(e) => updateChangelog(index, 'date', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Features (one per line):</label>
                    <textarea value={entry.changes.features?.join('\n') || ''} onChange={(e) => updateChangelogChanges(index, 'features', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Improvements (one per line):</label>
                    <textarea value={entry.changes.improvements?.join('\n') || ''} onChange={(e) => updateChangelogChanges(index, 'improvements', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Fixes (one per line):</label>
                    <textarea value={entry.changes.fixes?.join('\n') || ''} onChange={(e) => updateChangelogChanges(index, 'fixes', e.target.value)} />
                  </div>
                </div>
              ))}
              <button onClick={addChangelog} className="btn add-btn">Add Version</button>
            </div>
            <button onClick={saveContent} className="btn">Save Changelog</button>
          </div>
        )}

        {activeTab === 'forum' && (
          <div className="tab-content active">
            <div className="section-card">
              <h3>Forum Categories</h3>
              {content.forumCategories?.map((category, index) => (
                <div key={index} className="array-item">
                  <button onClick={() => removeForumCategory(index)} className="btn btn-danger remove-btn">Remove</button>
                  <div className="form-group">
                    <label>Name:</label>
                    <input type="text" value={category.name} onChange={(e) => updateForumCategory(index, 'name', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Description:</label>
                    <textarea value={category.description} onChange={(e) => updateForumCategory(index, 'description', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Topics:</label>
                    <input type="number" value={category.topics} onChange={(e) => updateForumCategory(index, 'topics', e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Posts:</label>
                    <input type="number" value={category.posts} onChange={(e) => updateForumCategory(index, 'posts', e.target.value)} />
                  </div>
                </div>
              ))}
              <button onClick={addForumCategory} className="btn add-btn">Add Category</button>
            </div>
            <button onClick={saveContent} className="btn">Save Forum</button>
          </div>
        )}
      </div>
    </>
  );
}
