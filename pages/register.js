import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Link from 'next/link';

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already logged in
    fetch('/api/auth/check')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated) {
          router.push('/profile');
        }
      })
      .catch(() => {});
  }, []);

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { label: 'Weak', color: '#ff6b6b', width: '33%' };
    if (strength <= 4) return { label: 'Medium', color: '#ffaa00', width: '66%' };
    return { label: 'Strong', color: '#00ff88', width: '100%' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        alert('Account created successfully! Please log in.');
        router.push('/profile');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = formData.password ? getPasswordStrength(formData.password) : null;

  return (
    <Layout title="EVU - Register">
      <div className="hero">
        <div className="container">
          <h1>Create Account</h1>
          <p>Join the EVU Gaming community today!</p>
        </div>
      </div>

      <div className="container main-content">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="connection-box" style={{ textAlign: 'left' }}>
            <h3 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem' }}>Register New Account</h3>

            {error && (
              <div style={{
                padding: '1rem',
                marginBottom: '1rem',
                background: 'rgba(255, 107, 107, 0.2)',
                border: '1px solid rgba(255, 107, 107, 0.5)',
                borderRadius: '8px',
                color: '#ff6b6b'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Username *
                </label>
                <input
                  type="text"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="form-input"
                  minLength={3}
                  maxLength={20}
                  required
                />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  3-20 characters. Letters, numbers, hyphens, and underscores only.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Email (optional)
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                />
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Optional. Used for account recovery and notifications.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Password *
                </label>
                <input
                  type="password"
                  placeholder="Choose a strong password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="form-input"
                  minLength={8}
                  required
                />
                {passwordStrength && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{
                      height: '6px',
                      background: 'var(--card-bg)',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        width: passwordStrength.width,
                        background: passwordStrength.color,
                        transition: 'all 0.3s ease'
                      }} />
                    </div>
                    <p style={{ fontSize: '0.85rem', color: passwordStrength.color, marginTop: '0.5rem' }}>
                      Password strength: {passwordStrength.label}
                    </p>
                  </div>
                )}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Must be at least 8 characters with uppercase, lowercase, and numbers.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                  Confirm Password *
                </label>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="form-input"
                  required
                />
              </div>

              <div style={{
                padding: '1rem',
                background: 'rgba(0, 212, 255, 0.1)',
                border: '1px solid rgba(0, 212, 255, 0.3)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                <p style={{ marginBottom: '0.5rem' }}>By creating an account, you agree to:</p>
                <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
                  <li>Follow community rules and guidelines</li>
                  <li>Respect other members</li>
                  <li>Use the platform responsibly</li>
                </ul>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '1rem',
                  background: loading ? 'var(--text-secondary)' : 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                  border: 'none',
                  color: 'var(--dark-bg)',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid rgba(0, 212, 255, 0.2)' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                Already have an account?{' '}
                <Link href="/profile" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                  Log in here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
