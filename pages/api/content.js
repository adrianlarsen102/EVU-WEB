import { validateSession, getSessionFromCookie } from '../../lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Read content from Supabase
    try {
      const { data, error } = await supabase
        .from('site_content')
        .select('content')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to read content' });
      }

      res.status(200).json(data.content);
    } catch (error) {
      console.error('Content read error:', error);
      res.status(500).json({ error: 'Failed to read content' });
    }
  } else if (req.method === 'POST') {
    // Update content (requires authentication)
    const sessionId = getSessionFromCookie(req.headers.cookie);
    const session = sessionId ? await validateSession(sessionId) : null;

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Only admins can update content
    if (!session.isAdmin) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }

    try {
      const content = req.body;

      const { error } = await supabase
        .from('site_content')
        .update({
          content: content,
          updated_at: new Date().toISOString()
        })
        .eq('id', 1);

      if (error) {
        console.error('Supabase update error:', error);
        return res.status(500).json({ error: 'Failed to save content' });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Content save error:', error);
      res.status(500).json({ error: 'Failed to save content' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
