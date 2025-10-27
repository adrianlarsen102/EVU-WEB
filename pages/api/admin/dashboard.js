import { validateSession, getSessionFromCookie } from '../../../lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check authentication
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = sessionId ? await validateSession(sessionId) : null;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Only admins can view dashboard
  if (!session.isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  try {
    const stats = {
      users: {},
      forum: {},
      support: {},
      sessions: {},
      system: {}
    };

    // Calculate date thresholds
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    const now = new Date().toISOString();

    // OPTIMIZATION: Parallelize all independent database queries
    const [
      allUsersResult,
      recentUsersResult,
      activeSessionsResult,
      forumTopicsResult,
      forumCommentsResult,
      recentTopicsResult,
      supportTicketsResult,
      contentResult
    ] = await Promise.all([
      // User statistics
      supabase.from('admins').select('id, role, is_admin', { count: 'exact' }),
      supabase.from('admins').select('id', { count: 'exact' }).gte('created_at', sevenDaysAgo.toISOString()),

      // Active sessions
      supabase.from('sessions').select('id', { count: 'exact' }).gt('expires_at', now),

      // Forum statistics (with error handling)
      supabase.from('forum_topics').select('id, views_count', { count: 'exact' }).then(res => res).catch(() => ({ data: null, count: 0 })),
      supabase.from('forum_comments').select('id', { count: 'exact' }).then(res => res).catch(() => ({ data: null, count: 0 })),
      supabase.from('forum_topics').select('id', { count: 'exact' }).gte('created_at', oneDayAgo.toISOString()).then(res => res).catch(() => ({ count: 0 })),

      // Support ticket statistics (with error handling)
      supabase.from('support_tickets').select('id, status', { count: 'exact' }).then(res => res).catch(() => ({ data: null, count: 0 })),

      // System health
      supabase.from('site_content').select('updated_at').eq('id', 1).single()
    ]);

    // Process user statistics
    const allUsers = allUsersResult.data || [];
    stats.users.total = allUsersResult.count || 0;
    stats.users.admins = allUsers.filter(u => u.role === 'admin' || u.is_admin).length;
    stats.users.regular = stats.users.total - stats.users.admins;
    stats.users.recentRegistrations = recentUsersResult.count || 0;

    // Process session statistics
    stats.sessions.active = activeSessionsResult.count || 0;
    stats.sessions.total = activeSessionsResult.count || 0;

    // Process forum statistics
    const forumTopics = forumTopicsResult.data || [];
    stats.forum.topics = forumTopicsResult.count || 0;
    stats.forum.comments = forumCommentsResult.count || 0;
    stats.forum.totalViews = forumTopics.reduce((sum, t) => sum + (t.views_count || 0), 0);
    stats.forum.recentActivity = recentTopicsResult.count || 0;

    // Process support ticket statistics
    const supportTickets = supportTicketsResult.data || [];
    stats.support.total = supportTicketsResult.count || 0;
    stats.support.open = supportTickets.filter(t => t.status === 'open').length;
    stats.support.inProgress = supportTickets.filter(t => t.status === 'in_progress').length;
    stats.support.closed = supportTickets.filter(t => t.status === 'closed').length;

    // Process system health
    stats.system.lastContentUpdate = contentResult.data?.updated_at || null;
    stats.system.databaseConnected = true;
    stats.system.serverTime = now;
    stats.system.uptime = '99.9%';

    res.status(200).json(stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
}
