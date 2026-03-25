import { getSupabaseClient } from '../../../lib/database';
import { validateSession, getSessionFromCookie } from '../../../lib/auth';

const supabase = getSupabaseClient();

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
      // PERFORMANCE: Use count queries instead of fetching all rows
      const now = new Date().toISOString();
      const [
        { count: totalUsers },
        { count: totalAdmins },
        { count: activeSessions },
        { count: totalTopics },
        { count: totalComments },
        { count: totalTickets },
        { count: openTickets }
      ] = await Promise.all([
        supabase.from('admins').select('*', { count: 'exact', head: true }),
        supabase.from('admins').select('*', { count: 'exact', head: true }).eq('role', 'admin'),
        supabase.from('sessions').select('*', { count: 'exact', head: true }).gte('expires_at', now),
        supabase.from('forum_topics').select('*', { count: 'exact', head: true }),
        supabase.from('forum_comments').select('*', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }),
        supabase.from('support_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open')
      ]);

      const metricsSnapshot = {
        total_users: totalUsers || 0,
        total_admins: totalAdmins || 0,
        active_sessions: activeSessions || 0,
        total_forum_topics: totalTopics || 0,
        total_forum_comments: totalComments || 0,
        total_support_tickets: totalTickets || 0,
        open_tickets: openTickets || 0,
        recorded_at: now
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
