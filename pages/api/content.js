import fs from 'fs';
import path from 'path';
import { validateSession, getSessionFromCookie } from '../../lib/auth';

const DATA_FILE = path.join(process.cwd(), 'data', 'content.json');

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Read content
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf8');
      res.status(200).json(JSON.parse(data));
    } catch (error) {
      res.status(500).json({ error: 'Failed to read content' });
    }
  } else if (req.method === 'POST') {
    // Update content (requires authentication)
    const sessionId = getSessionFromCookie(req.headers.cookie);
    const session = sessionId ? await validateSession(sessionId) : null;

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const content = req.body;
      fs.writeFileSync(DATA_FILE, JSON.stringify(content, null, 2));
      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save content' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
