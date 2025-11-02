import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { SkeletonChangelog } from '../components/LoadingSkeleton';

export default function Changelog() {
  const [content, setContent] = useState(null);
  const [autoChangelog, setAutoChangelog] = useState(null);
  const [activeTab, setActiveTab] = useState('auto'); // 'auto' or 'manual'
  const [serverFilter, setServerFilter] = useState('all'); // 'all', 'minecraft', 'fivem'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      // Load manual changelog from database
      fetch('/api/content')
        .then(res => res.json())
        .then(data => setContent(data))
        .catch(err => console.error('Failed to load content:', err)),

      // Load auto-generated changelog from CHANGELOG.md
      fetch('/api/changelog-md')
        .then(res => res.json())
        .then(data => setAutoChangelog(data))
        .catch(err => console.error('Failed to load auto changelog:', err))
    ]).finally(() => setLoading(false));
  }, []);

  const renderChangelogEntry = (entry, index, isAuto = false) => {
    const sections = isAuto
      ? [
          { key: 'features', title: '✨ New Features', items: entry.features },
          { key: 'improvements', title: '🔧 Improvements', items: entry.improvements },
          { key: 'fixes', title: '🐛 Bug Fixes', items: entry.fixes },
          { key: 'performance', title: '⚡ Performance Improvements', items: entry.performance },
          { key: 'refactoring', title: '♻️ Code Refactoring', items: entry.refactoring },
          { key: 'documentation', title: '📝 Documentation', items: entry.documentation },
        ]
      : [
          { key: 'features', title: '✨ New Features', items: entry.changes?.features },
          { key: 'improvements', title: '🔧 Improvements', items: entry.changes?.improvements },
          { key: 'fixes', title: '🐛 Bug Fixes', items: entry.changes?.fixes },
        ];

    const getServerBadge = () => {
      const serverType = entry.serverType || 'both';
      if (serverType === 'minecraft') return { emoji: '⛏️', text: 'Minecraft', color: '#00AA00' };
      if (serverType === 'fivem') return { emoji: '🚗', text: 'FiveM', color: '#F40552' };
      return { emoji: '🌐', text: 'Both Servers', color: '#6b46c1' };
    };

    const serverBadge = getServerBadge();

    return (
      <div key={index} className="changelog-entry">
        <div className="changelog-header">
          <h2>Version {entry.version}</h2>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {!isAuto && (
              <span className="changelog-badge" style={{
                background: `linear-gradient(135deg, ${serverBadge.color}, ${serverBadge.color}dd)`,
                fontSize: '0.85rem'
              }}>
                {serverBadge.emoji} {serverBadge.text}
              </span>
            )}
            <span className="changelog-date">{entry.date}</span>
            {index === 0 && <span className="changelog-badge new">Latest</span>}
          </div>
        </div>
        <div className="changelog-content">
          {sections.map(section => (
            section.items && section.items.length > 0 && (
              <div key={section.key}>
                <h3>{section.title}</h3>
                <ul>
                  {section.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )
          ))}
        </div>
      </div>
    );
  };

  return (
    <Layout title="EVU - Changelog">
      <div className="hero">
        <div className="container">
          <h1>Changelog</h1>
          <p>Track all updates and changes to EVU Gaming Network</p>
        </div>
      </div>

      <div className="container main-content">
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '2px solid rgba(107, 70, 193, 0.2)',
          paddingBottom: '0'
        }}>
          <button
            onClick={() => setActiveTab('auto')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'auto' ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))' : 'transparent',
              border: 'none',
              color: activeTab === 'auto' ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '8px 8px 0 0',
              transition: 'all 0.3s ease',
              borderBottom: activeTab === 'auto' ? '3px solid var(--primary-color)' : '3px solid transparent'
            }}
          >
            🤖 Website Updates (Auto)
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            style={{
              padding: '1rem 2rem',
              background: activeTab === 'manual' ? 'linear-gradient(135deg, var(--primary-color), var(--accent-color))' : 'transparent',
              border: 'none',
              color: activeTab === 'manual' ? 'white' : 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              borderRadius: '8px 8px 0 0',
              transition: 'all 0.3s ease',
              borderBottom: activeTab === 'manual' ? '3px solid var(--primary-color)' : '3px solid transparent'
            }}
          >
            🎮 Server Updates (Manual)
          </button>
        </div>

        {/* Auto-generated Changelog (from CHANGELOG.md) */}
        {activeTab === 'auto' && (
          <section className="changelog-section">
            <div style={{
              background: 'rgba(107, 70, 193, 0.1)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              border: '1px solid rgba(107, 70, 193, 0.3)'
            }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                📦 <strong>Automated from Git commits</strong> - These updates are automatically generated from code changes and deployments.
              </p>
            </div>

            {loading ? (
              <SkeletonChangelog count={3} />
            ) : autoChangelog?.releases?.length > 0 ? (
              autoChangelog.releases.map((entry, index) => renderChangelogEntry(entry, index, true))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <p>No automated changelog entries yet. Releases will appear here when you use <code>npm run release</code>.</p>
              </div>
            )}
          </section>
        )}

        {/* Manual Changelog (from admin panel) */}
        {activeTab === 'manual' && (
          <section className="changelog-section">
            <div style={{
              background: 'rgba(236, 72, 153, 0.1)',
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '2rem',
              border: '1px solid rgba(236, 72, 153, 0.3)'
            }}>
              <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                🎮 <strong>Server game updates</strong> - Manually curated server changes, features, and improvements.
              </p>
            </div>

            {/* Server Filter Buttons */}
            <div style={{
              display: 'flex',
              gap: '0.75rem',
              marginBottom: '2rem',
              flexWrap: 'wrap'
            }}>
              <button
                onClick={() => setServerFilter('all')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: serverFilter === 'all' ? 'linear-gradient(135deg, #6b46c1, #ec4899)' : 'rgba(107, 70, 193, 0.1)',
                  border: serverFilter === 'all' ? '2px solid #6b46c1' : '2px solid rgba(107, 70, 193, 0.3)',
                  color: serverFilter === 'all' ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
              >
                🌐 All Servers
              </button>
              <button
                onClick={() => setServerFilter('minecraft')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: serverFilter === 'minecraft' ? 'linear-gradient(135deg, #00AA00, #00CC00)' : 'rgba(0, 170, 0, 0.1)',
                  border: serverFilter === 'minecraft' ? '2px solid #00AA00' : '2px solid rgba(0, 170, 0, 0.3)',
                  color: serverFilter === 'minecraft' ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
              >
                ⛏️ Minecraft
              </button>
              <button
                onClick={() => setServerFilter('fivem')}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: serverFilter === 'fivem' ? 'linear-gradient(135deg, #F40552, #FF1E68)' : 'rgba(244, 5, 82, 0.1)',
                  border: serverFilter === 'fivem' ? '2px solid #F40552' : '2px solid rgba(244, 5, 82, 0.3)',
                  color: serverFilter === 'fivem' ? 'white' : 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease'
                }}
              >
                🚗 FiveM
              </button>
            </div>

            {loading ? (
              <SkeletonChangelog count={2} />
            ) : content?.changelog?.length > 0 ? (
              content.changelog
                .filter(entry => {
                  if (serverFilter === 'all') return true;
                  const entryServerType = entry.serverType || 'both';
                  return entryServerType === serverFilter || entryServerType === 'both';
                })
                .map((entry, index) => renderChangelogEntry(entry, index, false))
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                <p>No manual changelog entries yet. Add them from the admin panel.</p>
              </div>
            )}
          </section>
        )}
      </div>
    </Layout>
  );
}

// Force server-side rendering
export async function getServerSideProps() {
  return { props: {} };
}
