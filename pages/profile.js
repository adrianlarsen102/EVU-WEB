import { useState, useEffect } from 'react';
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
        <div className="hero">
          <div className="container">
            <h1>User Login</h1>
            <p>Access your profile and manage your account</p>
          </div>
        </div>

        <div className="container main-content">
          <div style={{ maxWidth: '500px', margin: '0 auto' }}>
            <div className="connection-box">
              <h3>👤 Login to Your Account</h3>
              {loginError && (
                <div style={{
                  backgroundColor: 'rgba(255, 0, 110, 0.1)',
                  border: '1px solid var(--accent-color)',
                  padding: '1rem',
                  borderRadius: '5px',
                  marginBottom: '1.5rem',
                  color: 'var(--accent-color)'
                }}>
                  {loginError}
                </div>
              )}
              <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--secondary-color)',
                      border: '2px solid var(--card-bg)',
                      borderRadius: '5px',
                      color: 'var(--text-primary)',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: '500' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      backgroundColor: 'var(--secondary-color)',
                      border: '2px solid var(--card-bg)',
                      borderRadius: '5px',
                      color: 'var(--text-primary)',
                      fontSize: '1rem'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '1rem',
                    backgroundColor: 'var(--primary-color)',
                    color: 'var(--dark-bg)',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.02)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                >
                  Login
                </button>
              </form>
              <p style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Don't have an account? Contact an administrator.
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Profile - EVU Server">
      <div className="hero">
        <div className="container">
          <h1>My Profile</h1>
          <p>Manage your account settings and information</p>
        </div>
      </div>

      <div className="container main-content">

        {message.text && (
          <div style={{
            backgroundColor: message.type === 'success' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 0, 110, 0.1)',
            border: `1px solid ${message.type === 'success' ? 'var(--success-color)' : 'var(--accent-color)'}`,
            padding: '1rem',
            borderRadius: '5px',
            marginBottom: '2rem',
            textAlign: 'center',
            color: message.type === 'success' ? 'var(--success-color)' : 'var(--accent-color)'
          }}>
            {message.text}
          </div>
        )}

        {/* User Info Card */}
        <div className="info-card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div>
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    border: '3px solid var(--primary-color)',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '120px',
                  height: '120px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--secondary-color)',
                  border: '3px solid var(--primary-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '4rem'
                }}>
                  👤
                </div>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem', fontSize: '2rem' }}>
                {displayName || user?.username || 'User'}
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '1rem' }}>
                @{user?.username}
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                {user?.is_admin && (
                  <span style={{
                    backgroundColor: 'var(--primary-color)',
                    color: 'var(--dark-bg)',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold'
                  }}>
                    ⚡ ADMIN
                  </span>
                )}
                <button
                  onClick={handleLogout}
                  style={{
                    backgroundColor: 'var(--accent-color)',
                    color: 'white',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
          {bio && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'var(--secondary-color)', borderRadius: '5px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>{bio}</p>
            </div>
          )}
        </div>

        <div className="info-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {/* Profile Settings Card */}
          <div className="info-card">
            <h3>Profile Settings</h3>
            <form onSubmit={handleSaveProfile}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Display Name</label>
                <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Your display name" style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--secondary-color)', border: '2px solid var(--dark-bg)', borderRadius: '5px', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--secondary-color)', border: '2px solid var(--dark-bg)', borderRadius: '5px', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Avatar URL</label>
                <input type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://example.com/avatar.jpg" style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--secondary-color)', border: '2px solid var(--dark-bg)', borderRadius: '5px', color: 'var(--text-primary)' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Bio</label>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={4} style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--secondary-color)', border: '2px solid var(--dark-bg)', borderRadius: '5px', color: 'var(--text-primary)', fontFamily: 'inherit', resize: 'vertical' }} />
              </div>
              <button type="submit" style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--primary-color)', color: 'var(--dark-bg)', border: 'none', borderRadius: '5px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>💾 Save Profile</button>
            </form>
          </div>

          {/* Security Card */}
          <div className="info-card">
            <h3>Security</h3>
            {!showPasswordChange ? (
              <button onClick={() => setShowPasswordChange(true)} style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--secondary-color)', color: 'var(--primary-color)', border: '2px solid var(--primary-color)', borderRadius: '5px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>🔑 Change Password</button>
            ) : (
              <>
                {passwordError && (
                  <div style={{ backgroundColor: 'rgba(255, 0, 110, 0.1)', border: '1px solid var(--accent-color)', padding: '1rem', borderRadius: '5px', marginBottom: '1rem', color: 'var(--accent-color)' }}>{passwordError}</div>
                )}
                <form onSubmit={handlePasswordChange}>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Current Password</label>
                    <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--secondary-color)', border: '2px solid var(--dark-bg)', borderRadius: '5px', color: 'var(--text-primary)' }} />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>New Password</label>
                    <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--secondary-color)', border: '2px solid var(--dark-bg)', borderRadius: '5px', color: 'var(--text-primary)' }} />
                  </div>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Confirm Password</label>
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: '0.75rem', backgroundColor: 'var(--secondary-color)', border: '2px solid var(--dark-bg)', borderRadius: '5px', color: 'var(--text-primary)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button type="submit" style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--primary-color)', color: 'var(--dark-bg)', border: 'none', borderRadius: '5px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>Update</button>
                    <button type="button" onClick={() => { setShowPasswordChange(false); setPasswordError(''); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); }} style={{ flex: 1, padding: '0.75rem', backgroundColor: 'var(--secondary-color)', color: 'var(--text-secondary)', border: '2px solid var(--card-bg)', borderRadius: '5px', fontSize: '1rem', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </form>
              </>
            )}
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: 'var(--secondary-color)', borderRadius: '5px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center' }}>Account created: {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
