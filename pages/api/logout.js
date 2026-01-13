import { destroySession, getSessionFromCookie } from '../../lib/auth';
import { invalidateSessionTokens } from '../../lib/csrf';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = getSessionFromCookie(req.headers.cookie);

  if (sessionId) {
    // Destroy session in database
    await destroySession(sessionId);

    // Invalidate all CSRF tokens for this session
    invalidateSessionTokens(sessionId);
  }

  // SECURITY: Add Secure flag for production (HTTPS only)
  const isProduction = process.env.NODE_ENV === 'production';
  const secureCookie = isProduction ? '; Secure' : '';
  res.setHeader('Set-Cookie', `sessionId=; Path=/; HttpOnly; SameSite=Strict${secureCookie}; Max-Age=0`);
  res.status(200).json({ success: true });
}
