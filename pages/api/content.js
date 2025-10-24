import { validateSession, getSessionFromCookie } from '../../lib/auth';
import { requireCSRFToken } from '../../lib/csrf';
import { auditLog, getClientIP, getUserAgent, AuditEventTypes, AuditSeverity } from '../../lib/auditLog';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    // Read content from Supabase with caching
    try {
      // Set cache headers for public content
      res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 8000)
      );

      const queryPromise = supabase
        .from('site_content')
        .select('content')
        .eq('id', 1)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      if (error) {
        console.error('Supabase error:', error);
        return res.status(500).json({ error: 'Failed to read content' });
      }

      return res.status(200).json(data.content);
    } catch (error) {
      console.error('Content read error:', error);
      return res.status(500).json({ error: 'Failed to read content' });
    }
  } else if (req.method === 'POST') {
    // Update content (requires authentication)
    const sessionId = getSessionFromCookie(req.headers.cookie);
    const session = sessionId ? await validateSession(sessionId) : null;

    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // SECURITY: Validate CSRF token for state-changing operation
    const csrfCheck = requireCSRFToken(req, res, sessionId);
    if (csrfCheck !== true) {
      return res.status(csrfCheck.status).json({
        error: csrfCheck.error,
        message: csrfCheck.message
      });
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

      // AUDIT LOG: Content updated
      await auditLog(
        AuditEventTypes.CONTENT_UPDATED,
        session.adminId,
        {
          contentType: 'site_content',
          userAgent: getUserAgent(req)
        },
        AuditSeverity.INFO,
        getClientIP(req)
      );

      return res.status(200).json({ success: true });
    } catch (error) {
      console.error('Content save error:', error);
      return res.status(500).json({ error: 'Failed to save content' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
