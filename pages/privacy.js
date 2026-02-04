import Link from 'next/link';
import Layout from '../components/Layout';

export default function Privacy() {
  return (
    <Layout title="Privacy Policy - EVU Gaming Network">
      <div className="hero">
        <div className="container">
          <h1>Privacy Policy</h1>
          <p>Your privacy is important to us</p>
        </div>
      </div>

      <div className="container main-content">
        <div className="info-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>1. Introduction</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              EVU Gaming Network (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>2. Information We Collect</h2>

            <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>2.1 Personal Information</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
              When you create an account or use our services, we may collect:
            </p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginLeft: '2rem' }}>
              <li>Username</li>
              <li>Email address (optional)</li>
              <li>Profile information (display name, bio, avatar)</li>
              <li>Account creation date and last login information</li>
            </ul>

            <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>2.2 Usage Data</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              We automatically collect certain information when you use our website:
            </p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginLeft: '2rem' }}>
              <li>IP address and browser type</li>
              <li>Pages visited and time spent on pages</li>
              <li>Referring website addresses</li>
              <li>Performance and analytics data (via Vercel Analytics)</li>
            </ul>

            <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>2.3 Cookies and Tracking</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              We use essential cookies for authentication and session management. We also use analytics cookies to improve our services. You can manage your cookie preferences through your browser settings.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>3. How We Use Your Information</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
              We use the collected information for:
            </p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginLeft: '2rem' }}>
              <li>Providing and maintaining our gaming services</li>
              <li>Managing your account and authentication</li>
              <li>Communicating with you about updates and support</li>
              <li>Improving our website and user experience</li>
              <li>Analyzing usage patterns and performance metrics</li>
              <li>Preventing fraud and ensuring security</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>4. Data Storage and Security</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              Your data is stored securely using Supabase (PostgreSQL database) with industry-standard encryption. We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginTop: '1rem' }}>
              However, no method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>5. Your Rights (GDPR)</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
              Under the General Data Protection Regulation (GDPR), you have the following rights:
            </p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginLeft: '2rem' }}>
              <li><strong>Right to Access:</strong> You can request a copy of your personal data</li>
              <li><strong>Right to Rectification:</strong> You can update or correct your information</li>
              <li><strong>Right to Erasure:</strong> You can delete your account and all associated data</li>
              <li><strong>Right to Data Portability:</strong> You can export your data in JSON format</li>
              <li><strong>Right to Object:</strong> You can object to certain processing of your data</li>
              <li><strong>Right to Restriction:</strong> You can request limitation of processing</li>
            </ul>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginTop: '1rem' }}>
              To exercise these rights, visit your <Link href="/profile" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Profile Page</Link> or contact us directly.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>6. Data Retention</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              We retain your personal information only for as long as necessary to provide our services and comply with legal obligations. When you delete your account, all associated personal data is permanently removed from our systems within 30 days.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>7. Third-Party Services</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
              We use the following third-party services:
            </p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginLeft: '2rem' }}>
              <li><strong>Vercel:</strong> Website hosting and deployment</li>
              <li><strong>Vercel Analytics:</strong> Usage analytics and performance monitoring</li>
              <li><strong>Supabase:</strong> Database and authentication services</li>
            </ul>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginTop: '1rem' }}>
              These services have their own privacy policies and we encourage you to review them.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>8. Children&apos;s Privacy</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              Our services are not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>9. International Data Transfers</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              Your information may be transferred to and maintained on servers located outside of your country. By using our services, you consent to this transfer. We ensure appropriate safeguards are in place to protect your data.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>10. Changes to This Policy</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the &quot;Last Updated&quot; date. Continued use of our services after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>11. Contact Us</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              If you have any questions about this Privacy Policy or wish to exercise your data rights, please contact us:
            </p>
            <div style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              backgroundColor: 'var(--secondary-color)',
              borderRadius: '8px',
              borderLeft: '4px solid var(--primary-color)'
            }}>
              <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                <strong>Email:</strong> privacy@evulotionary.dk
              </p>
              <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                <strong>Support:</strong> <Link href="/support" style={{ color: 'var(--primary-color)' }}>Submit a Support Ticket</Link>
              </p>
              <p style={{ color: 'var(--text-primary)' }}>
                <strong>Response Time:</strong> Within 30 days of your request
              </p>
            </div>
          </section>

          <div style={{
            marginTop: '3rem',
            padding: '1.5rem',
            backgroundColor: 'rgba(0, 212, 255, 0.05)',
            border: '2px solid var(--primary-color)',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--primary-color)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              🔒 Your Data, Your Control
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              You can download or delete all your data anytime from your <Link href="/profile" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>Profile Page</Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Force server-side rendering
export async function getServerSideProps() {
  return { props: {} };
}
