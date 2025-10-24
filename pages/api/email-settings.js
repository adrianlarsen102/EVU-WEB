import { validateSession, getSessionFromCookie } from '../../lib/auth';
import { getEmailSettings, updateEmailSettings } from '../../lib/database';

export default async function handler(req, res) {
  // Check authentication for all methods
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = await validateSession(sessionId);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only admins can access email settings
  if (!session.isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  // GET - Fetch email settings
  if (req.method === 'GET') {
    const result = await getEmailSettings();

    if (result.success) {
      // SECURITY: Mask sensitive credentials before sending to client
      const maskedSettings = {
        ...result.settings,
        // Mask API key (show only last 4 characters)
        resend_api_key: result.settings.resend_api_key
          ? '***' + result.settings.resend_api_key.slice(-4)
          : null,
        // Completely hide SMTP password
        smtp_pass: result.settings.smtp_pass ? '***' : null,
        // Partially mask SMTP username (show only before @)
        smtp_user: result.settings.smtp_user
          ? result.settings.smtp_user.split('@')[0] + '@***'
          : null
      };
      return res.status(200).json(maskedSettings);
    } else {
      return res.status(500).json({ error: result.error });
    }
  }

  // POST - Update email settings
  if (req.method === 'POST') {
    const {
      provider,
      enabled,
      resend_api_key,
      smtp_host,
      smtp_port,
      smtp_user,
      smtp_pass,
      smtp_secure,
      email_from,
      admin_email
    } = req.body;

    // Validation
    if (!provider || (provider !== 'resend' && provider !== 'smtp')) {
      return res.status(400).json({ error: 'Valid provider required (resend or smtp)' });
    }

    if (enabled) {
      // Validate based on provider
      if (provider === 'resend') {
        if (!resend_api_key || !resend_api_key.trim()) {
          return res.status(400).json({ error: 'Resend API key required when using Resend' });
        }
      } else if (provider === 'smtp') {
        if (!smtp_host || !smtp_user || !smtp_pass) {
          return res.status(400).json({ error: 'SMTP host, user, and password required when using SMTP' });
        }
      }

      // Validate email_from
      if (!email_from || !email_from.includes('@')) {
        return res.status(400).json({ error: 'Valid sender email address required' });
      }
    }

    const settings = {
      provider,
      enabled: enabled === true,
      resend_api_key: resend_api_key || null,
      smtp_host: smtp_host || null,
      smtp_port: smtp_port ? parseInt(smtp_port) : 587,
      smtp_user: smtp_user || null,
      smtp_pass: smtp_pass || null,
      smtp_secure: smtp_secure === true,
      email_from: email_from || 'noreply@yourdomain.com',
      admin_email: admin_email || null
    };

    const result = await updateEmailSettings(settings);

    if (result.success) {
      return res.status(200).json({ success: true, settings: result.settings });
    } else {
      return res.status(500).json({ error: result.error });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
