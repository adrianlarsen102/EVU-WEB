import { destroySession, getSessionFromCookie } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = getSessionFromCookie(req.headers.cookie);

  if (sessionId) {
    await destroySession(sessionId);
  }

  res.setHeader('Set-Cookie', 'sessionId=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0');
  res.status(200).json({ success: true });
}
