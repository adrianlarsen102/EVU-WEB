import { getSupabaseClient } from '../../../lib/database';
import crypto from 'crypto';

const supabase = getSupabaseClient();

// SECURITY: Timing-safe string comparison to prevent timing attacks
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    // Perform comparison anyway to prevent length-based timing attacks
    crypto.timingSafeEqual(bufA, Buffer.alloc(bufA.length));
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
}

export default async function handler(req, res) {
  // Verify this is an authorized cron request
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  // SECURITY: Require CRON_SECRET to prevent unauthorized access
  if (!cronSecret) {
    console.error('CRON_SECRET not configured - metrics recording disabled for security');
    return res.status(503).json({
      error: 'Service unavailable'
    });
  }

  // SECURITY: Use timing-safe comparison to prevent timing attacks
  const expectedHeader = `Bearer ${cronSecret}`;
  if (!authHeader || !timingSafeEqual(authHeader, expectedHeader)) {
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

    // Insert metrics snapshot
    const { error } = await supabase
      .from('metrics_history')
      .insert([metricsSnapshot]);

    if (error) {
      console.error('Error recording metrics:', error);
      // SECURITY: Never expose error details in production responses
      return res.status(500).json({ error: 'Failed to record metrics' });
    }

    console.log('Metrics recorded successfully:', metricsSnapshot);
    res.status(200).json({
      success: true,
      snapshot: metricsSnapshot,
      message: 'Metrics recorded successfully'
    });
  } catch (error) {
    console.error('Metrics recording error:', error);
    // SECURITY: Never expose error details in production responses
    res.status(500).json({ error: 'Failed to record metrics' });
  }
}
