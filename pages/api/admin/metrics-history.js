import { createClient } from '@supabase/supabase-js';
import { validateSession, getSessionFromCookie } from '../../../lib/auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Validate admin session
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = await validateSession(sessionId);

  if (!session || !session.isAdmin) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // Get historical metrics
    const { range = '7d' } = req.query;

    try {
      // Calculate date range
      let startDate = new Date();
      switch (range) {
        case '24h':
          startDate.setHours(startDate.getHours() - 24);
          break;
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7);
      }

      const { data: metrics, error } = await supabase
        .from('metrics_history')
        .select('*')
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: true });

      if (error) {
        console.error('Error fetching metrics history:', error);
        return res.status(500).json({ error: 'Failed to fetch metrics history' });
      }

      res.status(200).json({ metrics: metrics || [] });
    } catch (error) {
      console.error('Metrics history error:', error);
      res.status(500).json({ error: 'Failed to fetch metrics history' });
    }
  } else if (req.method === 'POST') {
    // Record current metrics snapshot
    try {
      // Fetch current metrics
      const { data: allUsers } = await supabase.from('admins').select('*');
      const { data: sessions } = await supabase
        .from('sessions')
        .select('*')
        .gte('expires_at', new Date().toISOString());
      const { data: forumTopics } = await supabase.from('forum_topics').select('*');
      const { data: forumComments } = await supabase.from('forum_comments').select('*');
      const { data: supportTickets } = await supabase.from('support_tickets').select('*');

      const metricsSnapshot = {
        total_users: allUsers?.length || 0,
        total_admins: allUsers?.filter(u => u.role === 'admin').length || 0,
        active_sessions: sessions?.length || 0,
        total_forum_topics: forumTopics?.length || 0,
        total_forum_comments: forumComments?.length || 0,
        total_support_tickets: supportTickets?.length || 0,
        open_tickets: supportTickets?.filter(t => t.status === 'open').length || 0,
        recorded_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('metrics_history')
        .insert([metricsSnapshot]);

      if (error) {
        console.error('Error recording metrics:', error);
        return res.status(500).json({ error: 'Failed to record metrics' });
      }

      res.status(200).json({ success: true, snapshot: metricsSnapshot });
    } catch (error) {
      console.error('Metrics recording error:', error);
      res.status(500).json({ error: 'Failed to record metrics' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
