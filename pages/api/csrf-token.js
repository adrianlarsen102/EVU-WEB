import { validateSession, getSessionFromCookie } from '../../lib/auth';
import { generateCSRFToken } from '../../lib/csrf';

/**
 * GET /api/csrf-token
 * Generate a new CSRF token for the authenticated session
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = await validateSession(sessionId);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Generate CSRF token for this session
    const csrfToken = generateCSRFToken(sessionId);

    return res.status(200).json({
      csrfToken,
      expiresIn: 3600 // 1 hour in seconds
    });
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return res.status(500).json({ error: 'Failed to generate CSRF token' });
  }
}
