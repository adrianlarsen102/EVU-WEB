import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

export default function StatusPage() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    fetchHealth();
    // Refresh health status every 30 seconds
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthData(data);
      setLastChecked(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch health status:', error);
      setHealthData({
        status: 'error',
        checks: {
          database: { status: 'error', connected: false, error: 'Failed to fetch health status' }
        }
      });
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ok':
        return 'var(--success-color)';
      case 'degraded':
        return '#fbbf24';
      case 'error':
        return '#ef4444';
      default:
        return 'var(--text-secondary)';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'ok':
        return '✅';
      case 'degraded':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return '❓';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ok':
        return 'All Systems Operational';
      case 'degraded':
        return 'Degraded Performance';
      case 'error':
        return 'System Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <Layout title="System Status - EVU Gaming">
      <Head>
        <meta name="description" content="Real-time system status for EVU Gaming Network" />
      </Head>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '3rem'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            System Status
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
            Real-time health monitoring for EVU Gaming Network
          </p>
        </div>

        {loading ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-secondary)'
          }}>
            <div style={{
              fontSize: '2rem',
              marginBottom: '1rem'
            }}>⏳</div>
            <p>Loading system status...</p>
          </div>
        ) : (
          <>
            {/* Overall Status Banner */}
            <div style={{
              backgroundColor: 'var(--card-bg)',
              borderRadius: '10px',
              padding: '2rem',
              marginBottom: '2rem',
              border: `2px solid ${getStatusColor(healthData?.status)}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
                {getStatusIcon(healthData?.status)}
              </div>
              <h2 style={{
                color: getStatusColor(healthData?.status),
                fontSize: '1.8rem',
                marginBottom: '0.5rem'
              }}>
                {getStatusText(healthData?.status)}
              </h2>
              {lastChecked && (
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  marginTop: '1rem'
                }}>
                  Last checked: {lastChecked.toLocaleTimeString()}
                </p>
              )}
            </div>

            {/* Component Status Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {/* Database Status */}
              {healthData?.checks?.database && (
                <div style={{
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  border: `2px solid ${getStatusColor(healthData.checks.database.status)}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{
                      fontSize: '1.3rem',
                      margin: 0
                    }}>
                      🗄️ Database
                    </h3>
                    <span style={{
                      fontSize: '1.5rem'
                    }}>
                      {getStatusIcon(healthData.checks.database.status)}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem'
                    }}>
                      <span>Connection:</span>
                      <span style={{
                        color: healthData.checks.database.connected ? 'var(--success-color)' : '#ef4444',
                        fontWeight: 'bold'
                      }}>
                        {healthData.checks.database.connected ? 'Connected' : 'Disconnected'}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem'
                    }}>
                      <span>Status:</span>
                      <span style={{
                        color: getStatusColor(healthData.checks.database.status),
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}>
                        {healthData.checks.database.status}
                      </span>
                    </div>
                    {healthData.checks.database.error && (
                      <div style={{
                        marginTop: '0.5rem',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '5px',
                        fontSize: '0.85rem',
                        color: '#ef4444'
                      }}>
                        Error: {healthData.checks.database.error}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Environment Status */}
              {healthData?.checks?.env && (
                <div style={{
                  backgroundColor: 'var(--card-bg)',
                  borderRadius: '10px',
                  padding: '1.5rem',
                  border: `2px solid ${getStatusColor(healthData.checks.env.status)}`
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{
                      fontSize: '1.3rem',
                      margin: 0
                    }}>
                      ⚙️ Configuration
                    </h3>
                    <span style={{
                      fontSize: '1.5rem'
                    }}>
                      {getStatusIcon(healthData.checks.env.status)}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem'
                    }}>
                      <span>Supabase URL:</span>
                      <span style={{
                        color: healthData.checks.env.supabaseUrl ? 'var(--success-color)' : '#ef4444',
                        fontWeight: 'bold'
                      }}>
                        {healthData.checks.env.supabaseUrl ? '✓' : '✗'}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      color: 'var(--text-secondary)',
                      fontSize: '0.9rem'
                    }}>
                      <span>API Key:</span>
                      <span style={{
                        color: healthData.checks.env.supabaseKey ? 'var(--success-color)' : '#ef4444',
                        fontWeight: 'bold'
                      }}>
                        {healthData.checks.env.supabaseKey ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Refresh Button */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={fetchHealth}
                style={{
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  padding: '0.8rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                🔄 Refresh Status
              </button>
            </div>

            {/* Auto-refresh Notice */}
            <div style={{
              textAlign: 'center',
              marginTop: '2rem',
              color: 'var(--text-secondary)',
              fontSize: '0.9rem'
            }}>
              <p>Status automatically refreshes every 30 seconds</p>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}
