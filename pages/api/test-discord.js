import { validateSession, getSessionFromCookie } from '../../lib/auth';
import { requireCSRFToken } from '../../lib/csrf';
import { testDiscordWebhook } from '../../lib/discordWebhook';

/**
 * POST /api/test-discord - Send test Discord notification
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = sessionId ? await validateSession(sessionId) : null;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check admin permission
  if (!session.isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  // CSRF protection
  const csrfCheck = requireCSRFToken(req, res, sessionId);
  if (csrfCheck !== true) {
    return res.status(csrfCheck.status).json({
      error: csrfCheck.error,
      message: csrfCheck.message
    });
  }

  try {
    const { webhook_url } = req.body;

    if (!webhook_url) {
      return res.status(400).json({
        error: 'Webhook URL is required'
      });
    }

    // Test the webhook
    const result = await testDiscordWebhook(webhook_url);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Test notification sent successfully! Check your Discord channel.'
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || 'Failed to send test notification'
      });
    }

  } catch (error) {
    console.error('Test Discord webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error while testing webhook'
    });
  }
}
