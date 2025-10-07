import { validateSession, getSessionFromCookie } from '../../lib/auth';
import { sendTestEmail } from '../../lib/email';

export default async function handler(req, res) {
  // Check authentication
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = await validateSession(sessionId);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only admins can send test emails
  if (!session.isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  // Only POST method allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  // Validate email
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email address required' });
  }

  try {
    // Send test email
    const result = await sendTestEmail(email);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: `Test email sent successfully to ${email}`
      });
    } else {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to send test email'
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to send test email'
    });
  }
}
