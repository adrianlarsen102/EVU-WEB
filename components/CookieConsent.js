import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setShowBanner(false);
  };

  const declineCookies = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Consent Banner */}
      <div className="cookie-consent-overlay">
        <div className="cookie-consent-banner">
          <div className="cookie-consent-content">
            <h3>🍪 Cookie & Privacy Notice</h3>
            <p>
              We use essential cookies to ensure the website functions properly, including admin authentication and session management.
              By using this website, you agree to our use of cookies and data processing practices.
            </p>
            <div className="cookie-consent-links">
              <button onClick={() => setShowPrivacy(true)} className="link-button">
                Privacy Policy
              </button>
              <span>•</span>
              <button onClick={() => setShowTerms(true)} className="link-button">
                Terms of Service
              </button>
            </div>
          </div>
          <div className="cookie-consent-actions">
            <button onClick={declineCookies} className="btn-cookie btn-cookie-decline">
              Decline
            </button>
            <button onClick={acceptCookies} className="btn-cookie btn-cookie-accept">
              Accept
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <div className="modal-overlay" onClick={() => setShowPrivacy(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Privacy Policy & GDPR Notice</h2>
              <button onClick={() => setShowPrivacy(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <h3>1. Data Controller</h3>
              <p>EVU Server ("we", "our", "us") operates this website.</p>

              <h3>2. Data We Collect</h3>
              <p>We collect and process the following data:</p>
              <ul>
                <li><strong>Authentication Data:</strong> Admin username and encrypted password for site administration</li>
                <li><strong>Session Data:</strong> Session cookies to maintain your login state</li>
                <li><strong>Technical Data:</strong> Browser type, IP address, and access logs</li>
              </ul>

              <h3>3. Purpose of Data Processing</h3>
              <p>We process your data for the following purposes:</p>
              <ul>
                <li>Website administration and security</li>
                <li>User authentication and session management</li>
                <li>Analytics and website improvement</li>
              </ul>

              <h3>4. Legal Basis (GDPR)</h3>
              <p>We process data based on:</p>
              <ul>
                <li><strong>Legitimate Interest:</strong> To operate and secure the website</li>
                <li><strong>Consent:</strong> When you accept cookies</li>
                <li><strong>Contract:</strong> When you use admin features</li>
              </ul>

              <h3>5. Data Storage</h3>
              <p>Your data is stored securely using Supabase (PostgreSQL) with encryption at rest and in transit. Admin passwords are hashed using bcrypt.</p>

              <h3>6. Your Rights (GDPR)</h3>
              <p>Under GDPR, you have the right to:</p>
              <ul>
                <li>Access your personal data</li>
                <li>Rectify inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to data processing</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>

              <h3>7. Cookies</h3>
              <p>We use the following cookies:</p>
              <ul>
                <li><strong>Session Cookie:</strong> Required for admin authentication (essential)</li>
                <li><strong>Consent Cookie:</strong> Stores your cookie preferences</li>
              </ul>

              <h3>8. Data Retention</h3>
              <p>We retain data for as long as necessary:</p>
              <ul>
                <li>Session data: 24 hours</li>
                <li>Admin accounts: Until deletion requested</li>
              </ul>

              <h3>9. Third-Party Services</h3>
              <p>We use the following third-party services:</p>
              <ul>
                <li><strong>Supabase:</strong> Database hosting (USA/EU)</li>
                <li><strong>Vercel:</strong> Website hosting (Global CDN)</li>
              </ul>

              <h3>10. Contact</h3>
              <p>For privacy concerns or to exercise your rights, contact us through Discord.</p>

              <p><small>Last updated: January 2025</small></p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowPrivacy(false)} className="btn-cookie btn-cookie-accept">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terms of Service Modal */}
      {showTerms && (
        <div className="modal-overlay" onClick={() => setShowTerms(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Terms of Service</h2>
              <button onClick={() => setShowTerms(false)} className="modal-close">×</button>
            </div>
            <div className="modal-body">
              <h3>1. Acceptance of Terms</h3>
              <p>By accessing and using this website, you accept and agree to be bound by the terms and conditions of this agreement.</p>

              <h3>2. Use License</h3>
              <p>Permission is granted to view and interact with this website for personal, non-commercial use only.</p>
              <p>You may not:</p>
              <ul>
                <li>Modify or copy the website materials</li>
                <li>Use the materials for commercial purposes</li>
                <li>Attempt to reverse engineer any software</li>
                <li>Remove any copyright or proprietary notations</li>
                <li>Transfer the materials to another person</li>
              </ul>

              <h3>3. Admin Access</h3>
              <p>Admin panel access is restricted to authorized personnel only. Unauthorized access attempts will be logged and may result in legal action.</p>

              <h3>4. Disclaimer</h3>
              <p>The materials on this website are provided on an 'as is' basis. We make no warranties, expressed or implied, and hereby disclaim all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.</p>

              <h3>5. Limitations</h3>
              <p>In no event shall EVU Server or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use this website.</p>

              <h3>6. Accuracy of Materials</h3>
              <p>The materials appearing on this website may include technical, typographical, or photographic errors. We do not warrant that any of the materials are accurate, complete, or current.</p>

              <h3>7. Links</h3>
              <p>We have not reviewed all sites linked to this website and are not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement.</p>

              <h3>8. Modifications</h3>
              <p>We may revise these terms of service at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.</p>

              <h3>9. Governing Law</h3>
              <p>These terms and conditions are governed by and construed in accordance with applicable laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.</p>

              <h3>10. FiveM Server Rules</h3>
              <p>By connecting to our FiveM server, you also agree to follow our in-game rules and community guidelines. Rule violations may result in warnings, kicks, or permanent bans.</p>

              <p><small>Last updated: January 2025</small></p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowTerms(false)} className="btn-cookie btn-cookie-accept">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .cookie-consent-overlay {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 10000;
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }

        .cookie-consent-banner {
          background: linear-gradient(135deg, var(--secondary-color) 0%, var(--dark-bg) 100%);
          border-top: 3px solid var(--primary-color);
          padding: 1.5rem 2rem;
          box-shadow: 0 -5px 30px rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .cookie-consent-content {
          flex: 1;
          min-width: 300px;
        }

        .cookie-consent-content h3 {
          color: var(--primary-color);
          margin-bottom: 0.5rem;
          font-size: 1.2rem;
        }

        .cookie-consent-content p {
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
          line-height: 1.5;
        }

        .cookie-consent-links {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          font-size: 0.9rem;
        }

        .link-button {
          background: none;
          border: none;
          color: var(--primary-color);
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
          font-size: 0.9rem;
        }

        .link-button:hover {
          color: var(--success-color);
        }

        .cookie-consent-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-cookie {
          padding: 0.75rem 2rem;
          border: none;
          border-radius: 5px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .btn-cookie-accept {
          background-color: var(--primary-color);
          color: var(--dark-bg);
        }

        .btn-cookie-accept:hover {
          background-color: var(--success-color);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0, 212, 255, 0.4);
        }

        .btn-cookie-decline {
          background-color: var(--card-bg);
          color: var(--text-secondary);
          border: 2px solid var(--text-secondary);
        }

        .btn-cookie-decline:hover {
          background-color: var(--accent-color);
          color: var(--text-primary);
          border-color: var(--accent-color);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10001;
          padding: 20px;
          animation: fadeIn 0.3s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .modal-content {
          background-color: var(--card-bg);
          border: 2px solid var(--primary-color);
          border-radius: 10px;
          max-width: 800px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 10px 50px rgba(0, 212, 255, 0.3);
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from {
            transform: translateY(-50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          padding: 1.5rem 2rem;
          border-bottom: 2px solid var(--primary-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          color: var(--primary-color);
          margin: 0;
          font-size: 1.5rem;
        }

        .modal-close {
          background: none;
          border: none;
          color: var(--text-primary);
          font-size: 2rem;
          cursor: pointer;
          padding: 0;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.3s ease;
        }

        .modal-close:hover {
          background-color: var(--accent-color);
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 2rem;
          color: var(--text-secondary);
        }

        .modal-body h3 {
          color: var(--primary-color);
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-size: 1.2rem;
        }

        .modal-body p {
          margin-bottom: 1rem;
          line-height: 1.6;
        }

        .modal-body ul {
          margin-left: 1.5rem;
          margin-bottom: 1rem;
        }

        .modal-body li {
          margin-bottom: 0.5rem;
          line-height: 1.6;
        }

        .modal-body strong {
          color: var(--text-primary);
        }

        .modal-body small {
          color: var(--text-secondary);
          font-style: italic;
        }

        .modal-footer {
          padding: 1.5rem 2rem;
          border-top: 2px solid rgba(0, 212, 255, 0.2);
          display: flex;
          justify-content: flex-end;
        }

        @media (max-width: 768px) {
          .cookie-consent-banner {
            flex-direction: column;
            align-items: stretch;
            padding: 1rem;
          }

          .cookie-consent-actions {
            width: 100%;
          }

          .btn-cookie {
            flex: 1;
          }

          .modal-content {
            max-height: 95vh;
          }

          .modal-body {
            padding: 1.5rem;
          }
        }
      `}</style>
    </>
  );
}
