import { validateSession, getSessionFromCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = sessionId ? await validateSession(sessionId) : null;

  if (session) {
    res.status(200).json({
      authenticated: true,
      isDefaultPassword: session.isDefaultPassword
    });
  } else {
    res.status(200).json({
      authenticated: false,
      isDefaultPassword: false
    });
  }
}
