import { validateSession, getSessionFromCookie } from '../../lib/auth';
import { hasPermission } from '../../lib/permissions';
import { rateLimiters } from '../../lib/rateLimit';
import {
  getRecentEmailLogs,
  getEmailStats,
  getFailedEmails,
  cleanupOldEmailLogs
} from '../../lib/emailLogger';

/**
 * Email Logs API
 *
 * GET - Fetch email logs and statistics (requires email.view permission)
 * POST - Trigger cleanup of old logs (requires email.edit permission)
 */
export default async function handler(req, res) {
  // Validate session
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = await validateSession(sessionId);

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check permissions
  const canViewEmails = await hasPermission(session.adminId, 'email.view') || session.isAdmin;

  if (!canViewEmails) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'You do not have permission to view email logs'
    });
  }

  // GET - Fetch email logs
  if (req.method === 'GET') {
    // Apply rate limiting
    const rateLimitResult = await rateLimiters.read(req, res, null);
    if (rateLimitResult !== true) return;

    try {
      const { type = 'recent', limit = 50, offset = 0, days = 7 } = req.query;

      let data;

      switch (type) {
        case 'stats':
          // Get email statistics
          data = await getEmailStats(parseInt(days));
          return res.status(200).json({ stats: data });

        case 'failed':
          // Get failed emails for debugging
          data = await getFailedEmails(parseInt(limit));
          return res.status(200).json({ logs: data, type: 'failed' });

        case 'recent':
        default:
          // Get recent email logs
          data = await getRecentEmailLogs(parseInt(limit), parseInt(offset));
          return res.status(200).json({ logs: data, type: 'recent' });
      }
    } catch (error) {
      console.error('Email logs fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch email logs' });
    }
  }

  // POST - Cleanup old logs
  if (req.method === 'POST') {
    // Check edit permission for cleanup
    const canEditEmails = await hasPermission(session.adminId, 'email.edit') || session.isAdmin;

    if (!canEditEmails) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to manage email logs'
      });
    }

    try {
      const { action } = req.body;

      if (action === 'cleanup') {
        const deletedCount = await cleanupOldEmailLogs();

        return res.status(200).json({
          success: true,
          message: `Cleaned up ${deletedCount} old email log(s)`,
          deletedCount
        });
      }

      return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      console.error('Email logs cleanup error:', error);
      return res.status(500).json({ error: 'Failed to cleanup email logs' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
