import { validateSession, getSessionFromCookie } from '../../../lib/auth';
import { getSupabaseClient } from '../../../lib/database';
import { rateLimiters } from '../../../lib/rateLimit';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate session
    const sessionId = getSessionFromCookie(req.headers.cookie);
    const session = await validateSession(sessionId);

    if (!session || !session.isAdmin) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // SECURITY: Apply rate limiting to prevent excessive querying
    const rateLimitResult = await rateLimiters.read(req, res, null);
    if (rateLimitResult !== true) return;

    // Get query parameters
    const {
      page = '1',
      limit = '50',
      severity,
      eventType
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Get Supabase client
    const supabase = getSupabaseClient();

    // Build query
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(offset, offset + limitNum - 1);

    // Apply filters
    if (severity && severity !== 'all') {
      query = query.eq('severity', severity);
    }

    if (eventType && eventType !== 'all') {
      query = query.eq('event_type', eventType);
    }

    const { data: logs, error, count } = await query;

    if (error) {
      console.error('Fetch audit logs error:', error);
      return res.status(500).json({ error: 'Failed to fetch audit logs' });
    }

    const totalPages = Math.ceil(count / limitNum);

    return res.status(200).json({
      logs: logs || [],
      totalPages,
      currentPage: pageNum,
      totalLogs: count
    });

  } catch (error) {
    console.error('Audit logs API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
