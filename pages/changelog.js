import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Changelog() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(err => console.error('Failed to load content:', err));
  }, []);

  return (
    <Layout title="EVU - Changelog">
      <div className="hero">
        <div className="container">
          <h1>Server Changelog</h1>
          <p>Track all updates and changes to EVU Server</p>
        </div>
      </div>

      <div className="container main-content">
        <section className="changelog-section">
          {content?.changelog?.map((entry, index) => (
            <div key={index} className="changelog-entry">
              <div className="changelog-header">
                <h2>Version {entry.version}</h2>
                <span className="changelog-date">{entry.date}</span>
                {index === 0 && <span className="changelog-badge new">Latest</span>}
              </div>
              <div className="changelog-content">
                {entry.changes.features?.length > 0 && (
                  <>
                    <h3>✨ New Features</h3>
                    <ul>
                      {entry.changes.features.map((feature, i) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </>
                )}

                {entry.changes.improvements?.length > 0 && (
                  <>
                    <h3>🔧 Improvements</h3>
                    <ul>
                      {entry.changes.improvements.map((improvement, i) => (
                        <li key={i}>{improvement}</li>
                      ))}
                    </ul>
                  </>
                )}

                {entry.changes.fixes?.length > 0 && (
                  <>
                    <h3>🐛 Bug Fixes</h3>
                    <ul>
                      {entry.changes.fixes.map((fix, i) => (
                        <li key={i}>{fix}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </Layout>
  );
}
