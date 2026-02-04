import Link from 'next/link';
import Layout from '../components/Layout';

export default function Terms() {
  return (
    <Layout title="Terms and Conditions - EVU Gaming Network">
      <div className="hero">
        <div className="container">
          <h1>Terms and Conditions</h1>
          <p>Please read these terms carefully before using our services</p>
        </div>
      </div>

      <div className="container main-content">
        <div className="info-card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              By accessing and using EVU Gaming Network&apos;s website and services (&quot;Services&quot;), you accept and agree to be bound by these Terms and Conditions (&quot;Terms&quot;). If you do not agree to these Terms, please do not use our Services.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>2. Description of Services</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
              EVU Gaming Network provides:
            </p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginLeft: '2rem' }}>
              <li>Minecraft and FiveM gaming server access</li>
              <li>Community forums and discussion boards</li>
              <li>User profiles and account management</li>
              <li>Support ticket system for player assistance</li>
              <li>Server status and information services</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>3. User Accounts</h2>

            <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>3.1 Account Creation</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              You must create an account to access certain features. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>

            <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>3.2 Account Requirements</h3>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginLeft: '2rem' }}>
              <li>You must be at least 13 years old to create an account</li>
              <li>You must provide accurate and complete information</li>
              <li>You must not impersonate others or create false identities</li>
              <li>Each person may only create one account</li>
              <li>Account sharing is prohibited</li>
            </ul>

            <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>3.3 Account Security</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              You agree to immediately notify us of any unauthorized use of your account. We are not liable for any loss or damage arising from your failure to protect your account credentials.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>4. Acceptable Use Policy</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
              When using our Services, you agree NOT to:
            </p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginLeft: '2rem' }}>
              <li>Violate any applicable laws or regulations</li>
              <li>Harass, threaten, or abuse other users</li>
              <li>Post offensive, discriminatory, or inappropriate content</li>
              <li>Spam, advertise, or promote unauthorized products/services</li>
              <li>Use cheats, hacks, exploits, or unauthorized modifications</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt our Services</li>
              <li>Scrape, data mine, or use automated tools without permission</li>
              <li>Share or distribute malicious software</li>
              <li>Impersonate staff members or administrators</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>5. Server Rules</h2>

            <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>5.1 General Conduct</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
              Players must:
            </p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginLeft: '2rem' }}>
              <li>Treat all players and staff with respect</li>
              <li>Follow instructions from moderators and administrators</li>
              <li>Use appropriate language in chat and voice communications</li>
              <li>Report bugs and exploits rather than abuse them</li>
              <li>Respect other players&apos; property and creations</li>
            </ul>

            <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>5.2 Prohibited Actions</h3>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginLeft: '2rem' }}>
              <li>Griefing or destroying other players&apos; builds</li>
              <li>Stealing from other players</li>
              <li>PvP harassment or spawn killing</li>
              <li>Building inappropriate structures</li>
              <li>Lag machines or intentional server disruption</li>
            </ul>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>6. Content and Intellectual Property</h2>

            <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>6.1 Your Content</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              You retain ownership of any content you create or upload. However, by posting content on our Services, you grant us a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content as necessary to provide our Services.
            </p>

            <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>6.2 Our Content</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              All website content, including text, graphics, logos, and software, is the property of EVU Gaming Network or its licensors and is protected by copyright and trademark laws. You may not copy, modify, or distribute our content without permission.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>7. Moderation and Enforcement</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '1rem' }}>
              We reserve the right to:
            </p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginLeft: '2rem' }}>
              <li>Monitor and moderate all user content and communications</li>
              <li>Remove content that violates these Terms</li>
              <li>Issue warnings to users who violate rules</li>
              <li>Temporarily or permanently ban users for violations</li>
              <li>Take legal action for serious violations</li>
            </ul>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginTop: '1rem' }}>
              Disciplinary actions are determined at our sole discretion based on the severity and frequency of violations.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>8. Disclaimers and Limitations</h2>

            <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>8.1 Service Availability</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              Our Services are provided &quot;as is&quot; and &quot;as available.&quot; We do not guarantee uninterrupted access or error-free operation. Server maintenance, updates, and technical issues may cause temporary service disruptions.
            </p>

            <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>8.2 No Warranties</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              We make no warranties regarding the accuracy, reliability, or suitability of our Services. Your use of our Services is at your own risk.
            </p>

            <h3 style={{ color: 'var(--text-primary)', marginTop: '1.5rem', marginBottom: '0.75rem' }}>8.3 Limitation of Liability</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              To the maximum extent permitted by law, EVU Gaming Network shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our Services.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>9. Third-Party Links and Services</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              Our Services may contain links to third-party websites or services. We are not responsible for the content, privacy practices, or terms of these third parties. Your use of third-party services is at your own risk.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>10. Termination</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              You may terminate your account at any time through your profile settings. We reserve the right to suspend or terminate your account for violations of these Terms, fraudulent activity, or any other reason at our discretion, with or without notice.
            </p>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginTop: '1rem' }}>
              Upon termination, your right to use our Services immediately ceases. Provisions that should survive termination (including disclaimers and limitations of liability) will remain in effect.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>11. Changes to Terms</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              We may modify these Terms at any time. We will notify users of material changes by posting a notice on our website or sending an email. Your continued use of our Services after changes constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>12. Governing Law</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              These Terms are governed by the laws of Denmark. Any disputes arising from these Terms or your use of our Services shall be subject to the exclusive jurisdiction of the courts of Denmark.
            </p>
          </section>

          <section style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>13. Contact Information</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              For questions about these Terms, please contact us:
            </p>
            <div style={{
              marginTop: '1.5rem',
              padding: '1.5rem',
              backgroundColor: 'var(--secondary-color)',
              borderRadius: '8px',
              borderLeft: '4px solid var(--primary-color)'
            }}>
              <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                <strong>Email:</strong> legal@evulotionary.dk
              </p>
              <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                <strong>Support:</strong> <Link href="/support" style={{ color: 'var(--primary-color)' }}>Submit a Support Ticket</Link>
              </p>
              <p style={{ color: 'var(--text-primary)' }}>
                <strong>Website:</strong> <Link href="/" style={{ color: 'var(--primary-color)' }}>evulotionary.dk</Link>
              </p>
            </div>
          </section>

          <div style={{
            marginTop: '3rem',
            padding: '1.5rem',
            backgroundColor: 'rgba(236, 72, 153, 0.05)',
            border: '2px solid var(--accent-color)',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <p style={{ color: 'var(--accent-color)', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              📜 By using our services, you agree to these terms
            </p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              If you have questions or concerns, please <Link href="/support" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>contact our support team</Link>
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
