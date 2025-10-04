import { useState, useEffect } from 'react';
import Layout from '../components/Layout';

export default function Forum() {
  const [content, setContent] = useState(null);

  useEffect(() => {
    fetch('/api/content')
      .then(res => res.json())
      .then(data => setContent(data))
      .catch(err => console.error('Failed to load content:', err));
  }, []);

  return (
    <Layout title="EVU - Forum">
      <div className="hero">
        <div className="container">
          <h1>Community Forum</h1>
          <p>Discuss, share, and connect with the EVU community</p>
        </div>
      </div>

      <div className="container main-content">
        <section className="forum-section">
          <div className="forum-categories">
            {content?.forumCategories?.map((category, index) => (
              <div key={index} className="forum-category">
                <div className="category-icon">💬</div>
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <div className="category-stats">
                    <span>{category.topics} Topics</span>
                    <span>{category.posts} Posts</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="forum-info">
            <h3>Recent Activity</h3>
            <div className="recent-posts">
              <div className="recent-post">
                <div className="post-avatar">👤</div>
                <div className="post-content">
                  <h4>New Update Coming Soon!</h4>
                  <p className="post-meta">Posted by Admin • 2 hours ago</p>
                </div>
              </div>
              <div className="recent-post">
                <div className="post-avatar">👤</div>
                <div className="post-content">
                  <h4>Looking for mechanics</h4>
                  <p className="post-meta">Posted by Player123 • 5 hours ago</p>
                </div>
              </div>
              <div className="recent-post">
                <div className="post-avatar">👤</div>
                <div className="post-content">
                  <h4>Great RP session last night!</h4>
                  <p className="post-meta">Posted by RPFan • 1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="forum-rules">
          <h2>Forum Rules</h2>
          <div className="rules-grid">
            <div className="rule-card">
              <h3>1. Be Respectful</h3>
              <p>Treat all members with respect and courtesy</p>
            </div>
            <div className="rule-card">
              <h3>2. No Spam</h3>
              <p>Keep posts relevant and avoid spamming</p>
            </div>
            <div className="rule-card">
              <h3>3. Stay On Topic</h3>
              <p>Post in the appropriate category</p>
            </div>
            <div className="rule-card">
              <h3>4. Follow Guidelines</h3>
              <p>Adhere to server rules and community guidelines</p>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
