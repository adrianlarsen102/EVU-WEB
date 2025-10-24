import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Verify this is an authorized cron request
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  // SECURITY: Require CRON_SECRET to prevent unauthorized access
  if (!cronSecret) {
    console.error('CRON_SECRET not configured - metrics recording disabled for security');
    return res.status(503).json({
      error: 'Service unavailable',
      message: 'CRON_SECRET environment variable must be configured'
    });
  }

  // Validate authorization header
  if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
    console.warn('Unauthorized cron access attempt:', {
      ip: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
      timestamp: new Date().toISOString()
    });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Insert metrics snapshot
    const { error } = await supabase
      .from('metrics_history')
      .insert([metricsSnapshot]);

    if (error) {
      console.error('Error recording metrics:', error);
      return res.status(500).json({ error: 'Failed to record metrics', details: error.message });
    }

    console.log('Metrics recorded successfully:', metricsSnapshot);
    res.status(200).json({
      success: true,
      snapshot: metricsSnapshot,
      message: 'Metrics recorded successfully'
    });
  } catch (error) {
    console.error('Metrics recording error:', error);
    res.status(500).json({ error: 'Failed to record metrics', details: error.message });
  }
}
