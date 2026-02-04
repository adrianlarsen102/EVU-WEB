import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';

export default function ResetPassword() {
  const router = useRouter();
  const { token } = router.query;

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Check password strength
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (newPassword.length >= 8) strength += 1;
    if (newPassword.length >= 12) strength += 1;
    if (/[A-Z]/.test(newPassword)) strength += 1;
    if (/[a-z]/.test(newPassword)) strength += 1;
    if (/\d/.test(newPassword)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) strength += 1;

    setPasswordStrength(strength);
  }, [newPassword]);

  const getStrengthLabel = () => {
    if (passwordStrength === 0) return { label: '', color: '#666' };
    if (passwordStrength <= 2) return { label: 'Weak', color: '#ef4444' };
    if (passwordStrength <= 4) return { label: 'Moderate', color: '#f59e0b' };
    return { label: 'Strong', color: '#10b981' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!token) {
      setMessage({ type: 'error', text: 'Invalid reset token' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
      return;
    }

    if (passwordStrength < 3) {
      setMessage({ type: 'error', text: 'Please use a stronger password' });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword, confirmPassword })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: data.message });
        setTimeout(() => {
          router.push('/profile');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to reset password' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const strengthIndicator = getStrengthLabel();

  return (
    <Layout title="Reset Password - EVU Gaming">
      <div className="container" style={{ maxWidth: '500px', marginTop: '3rem' }}>
        <div className="info-card">
          <h1 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
            Reset Password
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Enter your new password below.
          </p>

          {message.text && (
            <div style={{
              padding: '1rem',
              borderRadius: '5px',
              marginBottom: '1rem',
              backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
              color: message.type === 'success' ? '#10b981' : '#ef4444'
            }}>
              {message.text}
            </div>
          )}

          {!token ? (
            <div style={{
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <p>Invalid or missing reset token.</p>
              <button
                onClick={() => router.push('/profile')}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 2rem',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                Go to Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)'
                }}>
                  New Password *
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Enter new password"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--secondary-color)',
                    border: '2px solid var(--dark-bg)',
                    borderRadius: '5px',
                    color: 'var(--text-primary)',
                    fontSize: '1rem'
                  }}
                />
                {newPassword && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.25rem'
                    }}>
                      <div style={{
                        flex: 1,
                        height: '4px',
                        backgroundColor: 'var(--dark-bg)',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${(passwordStrength / 6) * 100}%`,
                          height: '100%',
                          backgroundColor: strengthIndicator.color,
                          transition: 'width 0.3s, background-color 0.3s'
                        }} />
                      </div>
                      <span style={{
                        fontSize: '0.875rem',
                        color: strengthIndicator.color,
                        fontWeight: '500'
                      }}>
                        {strengthIndicator.label}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                      Use 12+ characters with uppercase, lowercase, numbers, and special characters
                    </p>
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: 'var(--text-primary)'
                }}>
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Confirm new password"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    backgroundColor: 'var(--secondary-color)',
                    border: '2px solid var(--dark-bg)',
                    borderRadius: '5px',
                    color: 'var(--text-primary)',
                    fontSize: '1rem'
                  }}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p style={{ fontSize: '0.875rem', color: '#ef4444', marginTop: '0.5rem' }}>
                    Passwords do not match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '1rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading || !newPassword || !confirmPassword ? 0.6 : 1,
                  transition: 'opacity 0.2s'
                }}
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => router.push('/profile')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary-color)',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}
