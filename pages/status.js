import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';

export default function StatusPage() {
  const [healthData, setHealthData] = useState(null);
  const [serverData, setServerData] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  useEffect(() => {
    fetchAllData();
    // Refresh status every 30 seconds
    const interval = setInterval(fetchAllData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    await Promise.all([fetchHealth(), fetchServerStatus(), fetchContent()]);
    setLastChecked(new Date());
    setLoading(false);
  };

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthData(data);
    } catch (error) {
      console.error('Failed to fetch health status:', error);
      setHealthData({
        status: 'error',
        checks: {
          database: { status: 'error', connected: false, error: 'Failed to fetch health status' }
        }
      });
    }
  };

  const fetchServerStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setServerData(data);
    } catch (error) {
      console.error('Failed to fetch server status:', error);
    }
  };

  const fetchContent = async () => {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      setContent(data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
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

            {/* Game Server Status */}
            {content?.servers && (content.servers.minecraft?.enabled || content.servers.fivem?.enabled) && (
              <>
                <h2 style={{
                  fontSize: '1.8rem',
                  marginBottom: '1.5rem',
                  color: 'var(--text-primary)'
                }}>
                  🎮 Game Servers
                </h2>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '3rem'
                }}>
                  {/* Minecraft Server */}
                  {content.servers.minecraft?.enabled && (
                    <div style={{
                      backgroundColor: 'var(--card-bg)',
                      borderRadius: '10px',
                      padding: '1.5rem',
                      border: `2px solid ${content.servers.minecraft.isOnline ? 'var(--success-color)' : '#ef4444'}`
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
                          ⛏️ Minecraft
                        </h3>
                        <span style={{
                          fontSize: '1.5rem'
                        }}>
                          {content.servers.minecraft.isOnline ? '✅' : '❌'}
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
                          <span>Status:</span>
                          <span style={{
                            color: content.servers.minecraft.isOnline ? 'var(--success-color)' : '#ef4444',
                            fontWeight: 'bold'
                          }}>
                            {content.servers.minecraft.isOnline ? 'ONLINE' : 'OFFLINE'}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          color: 'var(--text-secondary)',
                          fontSize: '0.9rem'
                        }}>
                          <span>Players:</span>
                          <span style={{ fontWeight: 'bold' }}>
                            {content.servers.minecraft.currentPlayers || 0} / {content.servers.minecraft.maxPlayers || 0}
                          </span>
                        </div>
                        {content.servers.minecraft.uptime && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem'
                          }}>
                            <span>Uptime:</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--success-color)' }}>
                              {content.servers.minecraft.uptime}
                            </span>
                          </div>
                        )}
                        {content.servers.minecraft.version && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem'
                          }}>
                            <span>Version:</span>
                            <span style={{ fontWeight: 'bold' }}>
                              {content.servers.minecraft.version}
                            </span>
                          </div>
                        )}
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem',
                          backgroundColor: 'var(--secondary-color)',
                          borderRadius: '5px',
                          fontSize: '0.85rem',
                          textAlign: 'center',
                          fontFamily: 'monospace'
                        }}>
                          {content.servers.minecraft.serverIP}:{content.servers.minecraft.port || '25565'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* FiveM Server */}
                  {content.servers.fivem?.enabled && (
                    <div style={{
                      backgroundColor: 'var(--card-bg)',
                      borderRadius: '10px',
                      padding: '1.5rem',
                      border: `2px solid ${content.servers.fivem.isOnline ? 'var(--success-color)' : '#ef4444'}`
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
                          🚗 FiveM
                        </h3>
                        <span style={{
                          fontSize: '1.5rem'
                        }}>
                          {content.servers.fivem.isOnline ? '✅' : '❌'}
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
                          <span>Status:</span>
                          <span style={{
                            color: content.servers.fivem.isOnline ? 'var(--success-color)' : '#ef4444',
                            fontWeight: 'bold'
                          }}>
                            {content.servers.fivem.isOnline ? 'ONLINE' : 'OFFLINE'}
                          </span>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          color: 'var(--text-secondary)',
                          fontSize: '0.9rem'
                        }}>
                          <span>Players:</span>
                          <span style={{ fontWeight: 'bold' }}>
                            {content.servers.fivem.currentPlayers || 0} / {content.servers.fivem.maxPlayers || 0}
                          </span>
                        </div>
                        {content.servers.fivem.uptime && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem'
                          }}>
                            <span>Uptime:</span>
                            <span style={{ fontWeight: 'bold', color: 'var(--success-color)' }}>
                              {content.servers.fivem.uptime}
                            </span>
                          </div>
                        )}
                        {content.servers.fivem.version && (
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem'
                          }}>
                            <span>Version:</span>
                            <span style={{ fontWeight: 'bold' }}>
                              {content.servers.fivem.version}
                            </span>
                          </div>
                        )}
                        <div style={{
                          marginTop: '0.5rem',
                          padding: '0.5rem',
                          backgroundColor: 'var(--secondary-color)',
                          borderRadius: '5px',
                          fontSize: '0.85rem',
                          textAlign: 'center',
                          fontFamily: 'monospace',
                          wordBreak: 'break-all'
                        }}>
                          {content.servers.fivem.serverIP}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* System Component Status */}
            <h2 style={{
              fontSize: '1.8rem',
              marginBottom: '1.5rem',
              color: 'var(--text-primary)'
            }}>
              ⚙️ System Components
            </h2>
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
                onClick={fetchAllData}
                disabled={loading}
                style={{
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  border: 'none',
                  padding: '0.8rem 2rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  borderRadius: '5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.2s',
                  opacity: loading ? 0.6 : 1
                }}
                onMouseOver={(e) => !loading && (e.target.style.transform = 'scale(1.05)')}
                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
              >
                {loading ? '⏳ Refreshing...' : '🔄 Refresh All Status'}
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
