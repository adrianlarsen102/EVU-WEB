import { validateSession, getSessionFromCookie } from '../../../lib/auth';
import { generateCSRFToken } from '../../../lib/csrf';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = sessionId ? await validateSession(sessionId) : null;

  if (session) {
    // Generate CSRF token for authenticated session
    let csrfToken = null;
    try {
      csrfToken = generateCSRFToken(sessionId);
    } catch (error) {
      console.error('Failed to generate CSRF token:', error);
    }

    res.status(200).json({
      authenticated: true,
      isDefaultPassword: session.isDefaultPassword,
      csrfToken // Include CSRF token for client-side use
    });
  } else {
    res.status(200).json({
      authenticated: false,
      isDefaultPassword: false,
      csrfToken: null
    });
  }
}
