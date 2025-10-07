import { validateSession, getSessionFromCookie } from '../../../lib/auth';
import { getOpenTicketCount } from '../../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = await validateSession(sessionId);

  if (!session || !session.isAdmin) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  const count = await getOpenTicketCount();
  return res.status(200).json({ openTickets: count });
}
