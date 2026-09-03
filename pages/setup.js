import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { fetchWithTimeout } from '../lib/fetchWithTimeout';
import { checkIsSetup } from '../lib/database';

export default function Setup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    username: 'admin',
    displayName: 'Administrator',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Passwords do not match');
    }

    if (formData.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }

    setLoading(true);

    try {
      const response = await fetchWithTimeout('/api/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          displayName: formData.displayName,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to setup administrator');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin');
      }, 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="setup-container">
        <Head>
          <title>Setup Complete | EVU Gaming</title>
        </Head>
        <div className="glass-panel success-panel">
          <div className="success-icon">✅</div>
          <h1>Setup Complete!</h1>
          <p>Your administrator account has been created successfully.</p>
          <p className="redirect-text">Redirecting to login...</p>
        </div>
        <style jsx>{`
          .setup-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1a1c2c 0%, #4a1c40 100%);
            padding: 20px;
          }
          .glass-panel {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            text-align: center;
            color: white;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          }
          .success-icon {
            font-size: 4rem;
            margin-bottom: 20px;
          }
          h1 {
            margin-bottom: 15px;
            font-size: 2rem;
            background: linear-gradient(to right, #fff, #a5b4fc);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .redirect-text {
            color: #a5b4fc;
            margin-top: 20px;
            font-size: 0.9rem;
            animation: pulse 1.5s infinite;
          }
          @keyframes pulse {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="setup-container">
      <Head>
        <title>Initial Setup | EVU Gaming</title>
      </Head>
      
      <div className="glass-panel">
        <div className="logo-placeholder">🎮</div>
        <h1>Welcome to EVU Gaming</h1>
        <p className="subtitle">Let's create your administrator account to get started.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              required
              className="glass-input"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="8"
              className="glass-input"
              placeholder="Min 8 characters"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength="8"
              className="glass-input"
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Setting up...' : 'Create Admin Account'}
          </button>
        </form>
      </div>

      <style jsx>{`
        .setup-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          padding: 20px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 40px;
          max-width: 440px;
          width: 100%;
          color: white;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }
        .logo-placeholder {
          font-size: 3rem;
          text-align: center;
          margin-bottom: 10px;
        }
        h1 {
          margin-bottom: 10px;
          font-size: 1.8rem;
          text-align: center;
          background: linear-gradient(to right, #fff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle {
          text-align: center;
          color: #94a3b8;
          margin-bottom: 30px;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #fca5a5;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 20px;
          text-align: center;
          font-size: 0.9rem;
        }
        .form-group {
          margin-bottom: 20px;
        }
        label {
          display: block;
          margin-bottom: 8px;
          color: #cbd5e1;
          font-size: 0.9rem;
        }
        .glass-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          font-size: 1rem;
          transition: all 0.2s ease;
        }
        .glass-input:focus {
          outline: none;
          border-color: #6366f1;
          background: rgba(0, 0, 0, 0.3);
          box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
        }
        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          margin-top: 10px;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export async function getServerSideProps() {
  const isSetup = await checkIsSetup();

  if (isSetup) {
    return {
      redirect: {
        destination: '/admin',
        permanent: false,
      },
    };
  }

  return { props: {} };
}
