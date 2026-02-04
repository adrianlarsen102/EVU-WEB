import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        setSubmitted(true);
        setMessage({
          type: 'success',
          text: data.message || 'If an account with that email exists, a password reset link has been sent.'
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to process request' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Forgot Password - EVU Gaming">
      <div className="hero">
        <div className="container">
          <h1>Forgot Password</h1>
          <p>Reset your account password</p>
        </div>
      </div>

      <div className="container main-content">
        <div style={{ maxWidth: '500px', margin: '0 auto' }}>
          <div className="connection-box">
            <h3>🔑 Reset Your Password</h3>

            {message.text && (
              <div style={{
                padding: '1rem',
                borderRadius: '5px',
                marginBottom: '1.5rem',
                backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: `1px solid ${message.type === 'success' ? '#10b981' : '#ef4444'}`,
                color: message.type === 'success' ? '#10b981' : '#ef4444'
              }}>
                {message.text}
              </div>
            )}

            {!submitted ? (
              <>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
                </p>

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      color: 'var(--text-primary)',
                      fontWeight: '500'
                    }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
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
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '1rem',
                      backgroundColor: 'var(--primary-color)',
                      color: 'var(--dark-bg)',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.6 : 1,
                      transition: 'transform 0.2s ease, opacity 0.2s'
                    }}
                    onMouseOver={(e) => !loading && (e.target.style.transform = 'scale(1.02)')}
                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    {loading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </form>

                <div style={{ marginTop: '2rem', textAlign: 'center', paddingTop: '1.5rem', borderTop: '1px solid rgba(0, 212, 255, 0.2)' }}>
                  <p style={{ color: 'var(--text-secondary)' }}>
                    Remember your password?{' '}
                    <Link href="/profile" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                      Back to Login
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: '1rem'
                }}>
                  📧
                </div>
                <h3 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>
                  Check Your Email
                </h3>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
                  If an account with email <strong>{email}</strong> exists, we&apos;ve sent instructions to reset your password.
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                  The link will expire in 1 hour. Check your spam folder if you don&apos;t see it.
                </p>
                <button
                  onClick={() => router.push('/profile')}
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: 'var(--primary-color)',
                    color: 'var(--dark-bg)',
                    border: 'none',
                    borderRadius: '5px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Return to Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
