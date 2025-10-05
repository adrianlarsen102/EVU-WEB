import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function Profile() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Profile editing
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  // Password change
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/check');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        loadProfile();
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  };

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      const data = await res.json();
      if (res.ok) {
        setUser(data);
        setDisplayName(data.display_name || '');
        setEmail(data.email || '');
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url || '');
      }
    } catch (error) {
      console.error('Load profile error:', error);
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
        setLoginError('');
        loadProfile();
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch (error) {
      setLoginError('Login failed');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setIsAuthenticated(false);
    setUser(null);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          display_name: displayName,
          email,
          bio,
          avatar_url: avatarUrl
        })
      });

      if (res.ok) {
        showMessage('success', 'Profile updated successfully!');
        loadProfile();
      } else {
        const data = await res.json();
        showMessage('error', data.error || 'Failed to update profile');
      }
    } catch (error) {
      showMessage('error', 'Failed to update profile');
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
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    try {
      const res = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setShowPasswordChange(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showMessage('success', 'Password changed successfully!');
      } else {
        setPasswordError(data.error || 'Failed to change password');
      }
    } catch (error) {
      setPasswordError('Failed to change password');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (!isAuthenticated) {
    return (
      <Layout title="User Login - EVU Server">
        <div className="main-content">
          <div className="container">
            <div className="admin-login-wrapper" style={{ minHeight: '60vh', padding: '2rem 0' }}>
              <div className="admin-card" style={{ maxWidth: '450px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h2 style={{ color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '0.5rem' }}>👤 User Login</h2>
                  <p style={{ color: 'var(--text-secondary)' }}>Login to manage your profile</p>
                </div>
                {loginError && (
                  <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
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
                  Don't have an account? Contact an administrator.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Profile - EVU Server">
      <Head>
        <link rel="stylesheet" href="/styles/admin.css" />
      </Head>

      <div className="main-content">
        <div className="container" style={{ maxWidth: '1000px' }}>
          <div className="admin-navbar" style={{ position: 'relative', marginBottom: '2rem' }}>
            <div className="admin-navbar-content">
              <div className="admin-navbar-left">
                <h1 className="admin-logo">👤 MY PROFILE</h1>
              </div>
              <div className="admin-navbar-right">
                {user?.is_admin && (
                  <Link href="/admin" className="btn-admin btn-admin-secondary">
                    ⚙️ Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} className="btn-admin btn-admin-danger">
                  Logout
                </button>
              </div>
            </div>
          </div>

          {message.text && (
            <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              {message.text}
            </div>
          )}

          {/* User Info Card */}
          <div className="admin-card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    style={{
                      width: '100px',
                      height: '100px',
                      borderRadius: '50%',
                      border: '3px solid var(--primary-color)'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--card-bg)',
                    border: '3px solid var(--primary-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem'
                  }}>
                    👤
                  </div>
                )}
              </div>
              <div>
                <h2 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                  {displayName || user?.username || 'User'}
                </h2>
                <p style={{ color: 'var(--text-secondary)' }}>@{user?.username}</p>
                {user?.is_admin && (
                  <span style={{
                    backgroundColor: 'var(--primary-color)',
                    color: 'var(--dark-bg)',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '5px',
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    display: 'inline-block',
                    marginTop: '0.5rem'
                  }}>
                    ⚡ ADMIN
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Profile Settings */}
          <div className="admin-card" style={{ marginBottom: '2rem' }}>
            <h3 className="admin-card-title">Profile Settings</h3>
            <form onSubmit={handleSaveProfile}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your display name"
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Avatar URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  className="form-input"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>
              <button type="submit" className="btn-admin btn-admin-primary">
                💾 Save Profile
              </button>
            </form>
          </div>

          {/* Password Change */}
          <div className="admin-card">
            <h3 className="admin-card-title">Security</h3>
            {!showPasswordChange ? (
              <button
                onClick={() => setShowPasswordChange(true)}
                className="btn-admin btn-admin-secondary"
              >
                🔑 Change Password
              </button>
            ) : (
              <>
                {passwordError && (
                  <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                    {passwordError}
                  </div>
                )}
                <form onSubmit={handlePasswordChange}>
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button type="submit" className="btn-admin btn-admin-primary">
                      Update Password
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordChange(false);
                        setPasswordError('');
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="btn-admin btn-admin-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>

          <div style={{ textAlign: 'center', margin: '3rem 0 2rem', color: 'var(--text-secondary)' }}>
            <p>Account created: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
