import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDefaultPassword, setIsDefaultPassword] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('server');
  const [activeServer, setActiveServer] = useState('minecraft');
  const [content, setContent] = useState(null);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Password change form
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // User management
  const [users, setUsers] = useState([]);
  const [newUsername, setNewUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [userError, setUserError] = useState('');

  // Forum moderation
  const [moderationTopics, setModerationTopics] = useState([]);
  const [moderationComments, setModerationComments] = useState([]);
  const [moderationView, setModerationView] = useState('topics'); // 'topics' or 'comments'

  // Support tickets
  const [supportTickets, setSupportTickets] = useState([]);
  const [openTicketCount, setOpenTicketCount] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (activeTab === 'users' && isAuthenticated) {
      loadUsers();
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (activeTab === 'moderation' && isAuthenticated) {
      loadModerationData();
    }
  }, [activeTab, isAuthenticated, moderationView]);

  useEffect(() => {
    if (activeTab === 'support' && isAuthenticated) {
      loadSupportTickets();
    }
  }, [activeTab, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTicketNotifications();
    }
  }, [isAuthenticated]);

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
        body: JSON.stringify({ username, password })
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
        setLoginError(data.error || 'Invalid credentials');
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

  // Helper to check if content uses new dual-server structure
  const isDualServerStructure = () => {
    return content?.servers && (content.servers.minecraft || content.servers.fivem);
  };

  const updateServerInfo = (field, value) => {
    if (isDualServerStructure()) {
      setContent(prev => ({
        ...prev,
        servers: {
          ...prev.servers,
          [activeServer]: {
            ...prev.servers[activeServer],
            [field]: value
          }
        }
      }));
    } else {
      // Backward compatibility for old structure
      setContent(prev => ({
        ...prev,
        serverInfo: { ...prev.serverInfo, [field]: value }
      }));
    }
  };

  const updateServerStatus = (field, value) => {
    if (isDualServerStructure()) {
      setContent(prev => ({
        ...prev,
        servers: {
          ...prev.servers,
          [activeServer]: {
            ...prev.servers[activeServer],
            [field]: value
          }
        }
      }));
    } else {
      setContent(prev => ({
        ...prev,
        serverStatus: { ...prev.serverStatus, [field]: value }
      }));
    }
  };

  const updateJoinInfo = (field, value) => {
    if (isDualServerStructure()) {
      setContent(prev => ({
        ...prev,
        servers: {
          ...prev.servers,
          [activeServer]: {
            ...prev.servers[activeServer],
            [field]: value
          }
        }
      }));
    } else {
      setContent(prev => ({
        ...prev,
        joinInfo: { ...prev.joinInfo, [field]: value }
      }));
    }
  };

  const updateGeneralInfo = (field, value) => {
    setContent(prev => ({
      ...prev,
      general: { ...prev.general, [field]: value }
    }));
  };

  const addFeature = () => {
    if (isDualServerStructure()) {
      setContent(prev => ({
        ...prev,
        servers: {
          ...prev.servers,
          [activeServer]: {
            ...prev.servers[activeServer],
            features: [...(prev.servers[activeServer]?.features || []), 'New Feature']
          }
        }
      }));
    } else {
      setContent(prev => ({
        ...prev,
        features: [...(prev.features || []), { icon: '🎮', title: 'New Feature', description: 'Description' }]
      }));
    }
  };

  const updateFeature = (index, field, value) => {
    if (isDualServerStructure()) {
      // New structure uses string array
      setContent(prev => ({
        ...prev,
        servers: {
          ...prev.servers,
          [activeServer]: {
            ...prev.servers[activeServer],
            features: prev.servers[activeServer].features.map((f, i) => i === index ? value : f)
          }
        }
      }));
    } else {
      setContent(prev => ({
        ...prev,
        features: prev.features.map((f, i) => i === index ? { ...f, [field]: value } : f)
      }));
    }
  };

  const removeFeature = (index) => {
    if (isDualServerStructure()) {
      setContent(prev => ({
        ...prev,
        servers: {
          ...prev.servers,
          [activeServer]: {
            ...prev.servers[activeServer],
            features: prev.servers[activeServer].features.filter((_, i) => i !== index)
          }
        }
      }));
    } else {
      setContent(prev => ({
        ...prev,
        features: prev.features.filter((_, i) => i !== index)
      }));
    }
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

  // Forum Moderation Functions
  const loadModerationData = async () => {
    try {
      const res = await fetch(`/api/forum/moderation?type=${moderationView}`);
      const data = await res.json();

      if (moderationView === 'topics') {
        setModerationTopics(data);
      } else {
        setModerationComments(data);
      }
    } catch (error) {
      console.error('Load moderation data error:', error);
    }
  };

  const handleModerateTopic = async (action, topicId, value = null) => {
    try {
      const res = await fetch('/api/forum/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          targetType: 'topic',
          targetId: topicId,
          value
        })
      });

      if (res.ok) {
        showMessage('success', `Topic ${action}ed successfully!`);
        loadModerationData();
      } else {
        showMessage('error', `Failed to ${action} topic`);
      }
    } catch (error) {
      showMessage('error', `Failed to ${action} topic`);
    }
  };

  const handleModerateComment = async (action, commentId) => {
    try {
      const res = await fetch('/api/forum/moderation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          targetType: 'comment',
          targetId: commentId
        })
      });

      if (res.ok) {
        showMessage('success', `Comment ${action}ed successfully!`);
        loadModerationData();
      } else {
        showMessage('error', `Failed to ${action} comment`);
      }
    } catch (error) {
      showMessage('error', `Failed to ${action} comment`);
    }
  };

  // Support Ticket Functions
  const loadSupportTickets = async () => {
    try {
      const res = await fetch('/api/support/tickets');
      const data = await res.json();
      setSupportTickets(data);
    } catch (error) {
      console.error('Load support tickets error:', error);
    }
  };

  const loadTicketNotifications = async () => {
    try {
      const res = await fetch('/api/support/notifications');
      const data = await res.json();
      setOpenTicketCount(data.openTickets || 0);
    } catch (error) {
      console.error('Load ticket notifications error:', error);
    }
  };

  const handleUpdateTicketStatus = async (ticketId, status) => {
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, status })
      });

      if (res.ok) {
        showMessage('success', `Ticket status updated to ${status}!`);
        loadSupportTickets();
        loadTicketNotifications();
      } else {
        showMessage('error', 'Failed to update ticket status');
      }
    } catch (error) {
      showMessage('error', 'Failed to update ticket status');
    }
  };

  // User Management Functions
  const loadUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Load users error:', error);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserError('');

    if (newUserPassword.length < 8) {
      setUserError('Password must be at least 8 characters');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newUserPassword })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('success', `User "${newUsername}" created successfully!`);
        setNewUsername('');
        setNewUserPassword('');
        loadUsers();
      } else {
        setUserError(data.error || 'Failed to create user');
      }
    } catch (error) {
      setUserError('Failed to create user');
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('success', `User "${username}" deleted successfully!`);
        loadUsers();
      } else {
        showMessage('error', data.error || 'Failed to delete user');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete user');
    }
  };

  const handleResetUserPassword = async (userId, username) => {
    const newPass = prompt(`Enter new password for "${username}" (min 8 characters):`);
    if (!newPass) return;

    if (newPass.length < 8) {
      showMessage('error', 'Password must be at least 8 characters');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword: newPass })
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('success', `Password reset for "${username}" successfully!`);
      } else {
        showMessage('error', data.error || 'Failed to reset password');
      }
    } catch (error) {
      showMessage('error', 'Failed to reset password');
    }
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
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  className="form-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  className="form-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
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
              <button
                className={`admin-tab ${activeTab === 'moderation' ? 'active' : ''}`}
                onClick={() => setActiveTab('moderation')}
              >
                🛡️ Moderation
              </button>
              <button
                className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
                onClick={() => setActiveTab('users')}
              >
                👥 Users
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'server' && (
              <div className="admin-tab-content">
                {isDualServerStructure() && (
                  <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <h3 className="admin-card-title" style={{ marginBottom: 0 }}>Select Server:</h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setActiveServer('minecraft')}
                          className={`btn-admin ${activeServer === 'minecraft' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
                        >
                          ⛏️ Minecraft
                        </button>
                        <button
                          onClick={() => setActiveServer('fivem')}
                          className={`btn-admin ${activeServer === 'fivem' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
                        >
                          🚗 FiveM
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {isDualServerStructure() ? (
                  <>
                    <div className="admin-card">
                      <h3 className="admin-card-title">{activeServer === 'minecraft' ? '⛏️ Minecraft' : '🚗 FiveM'} Server Info</h3>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Enabled</label>
                          <select
                            className="form-input"
                            value={content.servers[activeServer]?.enabled}
                            onChange={(e) => updateServerInfo('enabled', e.target.value === 'true')}
                          >
                            <option value="true">Yes</option>
                            <option value="false">No</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Server Name</label>
                          <input
                            type="text"
                            className="form-input"
                            value={content.servers[activeServer]?.name || ''}
                            onChange={(e) => updateServerInfo('name', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Server IP / Connect Command</label>
                          <input
                            type="text"
                            className="form-input"
                            value={content.servers[activeServer]?.serverIP || ''}
                            onChange={(e) => updateServerInfo('serverIP', e.target.value)}
                          />
                        </div>
                        {activeServer === 'minecraft' && (
                          <div className="form-group">
                            <label>Port</label>
                            <input
                              type="text"
                              className="form-input"
                              value={content.servers[activeServer]?.port || ''}
                              onChange={(e) => updateServerInfo('port', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="admin-card">
                      <h3 className="admin-card-title">General Settings</h3>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Website Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={content.general?.websiteTitle || ''}
                            onChange={(e) => updateGeneralInfo('websiteTitle', e.target.value)}
                          />
                        </div>
                        <div className="form-group">
                          <label>Discord Link</label>
                          <input
                            type="text"
                            className="form-input"
                            value={content.general?.discordLink || ''}
                            onChange={(e) => updateGeneralInfo('discordLink', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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
                  </>
                )}

                <button onClick={saveContent} className="btn-admin btn-admin-primary">
                  💾 Save Server Info
                </button>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="admin-tab-content">
                {isDualServerStructure() && (
                  <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <h3 className="admin-card-title" style={{ marginBottom: 0 }}>Select Server:</h3>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => setActiveServer('minecraft')}
                          className={`btn-admin ${activeServer === 'minecraft' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
                        >
                          ⛏️ Minecraft
                        </button>
                        <button
                          onClick={() => setActiveServer('fivem')}
                          className={`btn-admin ${activeServer === 'fivem' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
                        >
                          🚗 FiveM
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="admin-card">
                  <h3 className="admin-card-title">
                    {isDualServerStructure()
                      ? `${activeServer === 'minecraft' ? '⛏️ Minecraft' : '🚗 FiveM'} Features`
                      : 'Server Features'}
                  </h3>

                  {isDualServerStructure() ? (
                    <>
                      {content.servers[activeServer]?.features?.map((feature, index) => (
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
                          <div className="form-group">
                            <label>Feature Description</label>
                            <input
                              type="text"
                              className="form-input"
                              value={feature}
                              onChange={(e) => updateFeature(index, null, e.target.value)}
                            />
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <>
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
                    </>
                  )}

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
                {isDualServerStructure() ? (
                  <>
                    <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <h3 className="admin-card-title" style={{ marginBottom: 0 }}>Select Server:</h3>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => setActiveServer('minecraft')}
                            className={`btn-admin ${activeServer === 'minecraft' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
                          >
                            ⛏️ Minecraft
                          </button>
                          <button
                            onClick={() => setActiveServer('fivem')}
                            className={`btn-admin ${activeServer === 'fivem' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
                          >
                            🚗 FiveM
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="admin-card">
                      <h3 className="admin-card-title">
                        {activeServer === 'minecraft' ? '⛏️ Minecraft' : '🚗 FiveM'} Join Information
                      </h3>
                      <div className="form-group">
                        <label>Server IP / Connect Command</label>
                        <input
                          type="text"
                          className="form-input"
                          value={content.servers[activeServer]?.serverIP || ''}
                          onChange={(e) => updateJoinInfo('serverIP', e.target.value)}
                          placeholder={activeServer === 'minecraft' ? 'play.example.com' : 'connect cfx.re/join/xxxxx'}
                        />
                      </div>
                      {activeServer === 'minecraft' && (
                        <div className="form-group">
                          <label>Port (optional)</label>
                          <input
                            type="text"
                            className="form-input"
                            value={content.servers[activeServer]?.port || ''}
                            onChange={(e) => updateJoinInfo('port', e.target.value)}
                            placeholder="25565"
                          />
                        </div>
                      )}
                    </div>

                    <div className="admin-card">
                      <h3 className="admin-card-title">General Join Info</h3>
                      <div className="form-group">
                        <label>Discord Link</label>
                        <input
                          type="text"
                          className="form-input"
                          value={content.general?.discordLink || ''}
                          onChange={(e) => updateGeneralInfo('discordLink', e.target.value)}
                        />
                      </div>
                    </div>
                  </>
                ) : (
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
                )}
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

            {activeTab === 'moderation' && (
              <div className="admin-tab-content">
                <div className="admin-card">
                  <h3 className="admin-card-title">Forum Moderation</h3>

                  {/* View Toggle */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                    <button
                      onClick={() => setModerationView('topics')}
                      className={`btn-admin ${moderationView === 'topics' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
                    >
                      📝 Topics
                    </button>
                    <button
                      onClick={() => setModerationView('comments')}
                      className={`btn-admin ${moderationView === 'comments' ? 'btn-admin-primary' : 'btn-admin-secondary'}`}
                    >
                      💬 Comments
                    </button>
                  </div>

                  {/* Topics View */}
                  {moderationView === 'topics' && (
                    <div>
                      <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                        Manage all forum topics
                      </h4>
                      {moderationTopics.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                          No topics found
                        </p>
                      ) : (
                        moderationTopics.map((topic) => (
                          <div key={topic.id} className="admin-item-card" style={{ marginBottom: '1rem' }}>
                            <div className="admin-item-header">
                              <div>
                                <h4>
                                  {topic.is_pinned && <span style={{ color: 'var(--accent-color)', marginRight: '0.5rem' }}>📌</span>}
                                  {topic.is_locked && <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>🔒</span>}
                                  {topic.is_deleted && <span style={{ color: '#ff6b6b', marginRight: '0.5rem' }}>🗑️</span>}
                                  {topic.title}
                                </h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                  By {topic.author_username} • {new Date(topic.created_at).toLocaleDateString()} • {topic.comment_count} comments
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                {!topic.is_deleted && (
                                  <>
                                    <button
                                      onClick={() => handleModerateTopic('pin', topic.id, !topic.is_pinned)}
                                      className="btn-admin btn-admin-sm btn-admin-secondary"
                                      title={topic.is_pinned ? 'Unpin' : 'Pin'}
                                    >
                                      {topic.is_pinned ? '📌 Unpin' : '📌 Pin'}
                                    </button>
                                    <button
                                      onClick={() => handleModerateTopic('lock', topic.id, !topic.is_locked)}
                                      className="btn-admin btn-admin-sm btn-admin-secondary"
                                      title={topic.is_locked ? 'Unlock' : 'Lock'}
                                    >
                                      {topic.is_locked ? '🔓 Unlock' : '🔒 Lock'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (confirm(`Delete topic "${topic.title}"?`)) {
                                          handleModerateTopic('delete', topic.id);
                                        }
                                      }}
                                      className="btn-admin btn-admin-sm btn-admin-danger"
                                    >
                                      🗑️ Delete
                                    </button>
                                  </>
                                )}
                                {topic.is_deleted && (
                                  <button
                                    onClick={() => handleModerateTopic('restore', topic.id)}
                                    className="btn-admin btn-admin-sm btn-admin-secondary"
                                  >
                                    ♻️ Restore
                                  </button>
                                )}
                              </div>
                            </div>
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--dark-bg)', borderRadius: '6px', fontSize: '0.9rem', maxHeight: '100px', overflow: 'auto' }}>
                              {topic.content}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* Comments View */}
                  {moderationView === 'comments' && (
                    <div>
                      <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                        Manage all forum comments
                      </h4>
                      {moderationComments.length === 0 ? (
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>
                          No comments found
                        </p>
                      ) : (
                        moderationComments.map((comment) => (
                          <div key={comment.id} className="admin-item-card" style={{ marginBottom: '1rem' }}>
                            <div className="admin-item-header">
                              <div>
                                <h4>
                                  {comment.is_deleted && <span style={{ color: '#ff6b6b', marginRight: '0.5rem' }}>🗑️</span>}
                                  Comment on: {comment.topic?.title || 'Unknown Topic'}
                                </h4>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                                  By {comment.author_username} • {new Date(comment.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {!comment.is_deleted && (
                                  <button
                                    onClick={() => {
                                      if (confirm('Delete this comment?')) {
                                        handleModerateComment('delete', comment.id);
                                      }
                                    }}
                                    className="btn-admin btn-admin-sm btn-admin-danger"
                                  >
                                    🗑️ Delete
                                  </button>
                                )}
                                {comment.is_deleted && (
                                  <button
                                    onClick={() => handleModerateComment('restore', comment.id)}
                                    className="btn-admin btn-admin-sm btn-admin-secondary"
                                  >
                                    ♻️ Restore
                                  </button>
                                )}
                              </div>
                            </div>
                            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--dark-bg)', borderRadius: '6px', fontSize: '0.9rem', maxHeight: '100px', overflow: 'auto' }}>
                              {comment.content}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="admin-tab-content">
                <div className="admin-card">
                  <h3 className="admin-card-title">User Management</h3>

                  {/* Create New User Form */}
                  <div className="admin-item-card" style={{ marginBottom: '2rem' }}>
                    <h4 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Create New User</h4>
                    {userError && (
                      <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                        {userError}
                      </div>
                    )}
                    <form onSubmit={handleCreateUser}>
                      <div className="form-grid">
                        <div className="form-group">
                          <label>Username</label>
                          <input
                            type="text"
                            className="form-input"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Password</label>
                          <input
                            type="password"
                            className="form-input"
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                            placeholder="Minimum 8 characters"
                            required
                          />
                        </div>
                      </div>
                      <button type="submit" className="btn-admin btn-admin-primary">
                        ➕ Create User
                      </button>
                    </form>
                  </div>

                  {/* Users List */}
                  <h4 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>All Users ({users.length})</h4>
                  {users.map((user) => (
                    <div key={user.id} className="admin-item-card">
                      <div className="admin-item-header">
                        <div>
                          <h4>{user.username}</h4>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: '0.5rem 0 0 0' }}>
                            Created: {new Date(user.created_at).toLocaleDateString()}
                            {user.is_default_password && (
                              <span style={{ color: 'var(--accent-color)', marginLeft: '1rem' }}>
                                ⚠️ Default Password
                              </span>
                            )}
                          </p>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => handleResetUserPassword(user.id, user.username)}
                            className="btn-admin btn-admin-secondary btn-admin-sm"
                          >
                            🔑 Reset Password
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.username)}
                            className="btn-admin btn-admin-danger btn-admin-sm"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {users.length === 0 && (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem' }}>
                      No users found. Create one above.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
