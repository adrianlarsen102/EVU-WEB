import { validateSession, getSessionFromCookie } from '../../../lib/auth';
import { getSupabaseClient } from '../../../lib/database';

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

    // Get query parameters
    const {
      page = '1',
      limit = '50',
      severity,
      errorType,
      resolved
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Get Supabase client
    const supabase = getSupabaseClient();

    // Build query
    let query = supabase
      .from('error_logs')
      .select('*', { count: 'exact' })
      .order('timestamp', { ascending: false })
      .range(offset, offset + limitNum - 1);

    // Apply filters
    if (severity && severity !== 'all') {
      query = query.eq('severity', severity);
    }

    if (errorType && errorType !== 'all') {
      query = query.eq('error_type', errorType);
    }

    if (resolved && resolved !== 'all') {
      query = query.eq('resolved', resolved === 'true');
    }

    const { data: logs, error, count } = await query;

    if (error) {
      console.error('Fetch error logs error:', error);
      return res.status(500).json({ error: 'Failed to fetch error logs' });
    }

    const totalPages = Math.ceil(count / limitNum);

    return res.status(200).json({
      logs: logs || [],
      totalPages,
      currentPage: pageNum,
      totalLogs: count
    });

  } catch (error) {
    console.error('Error logs API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
