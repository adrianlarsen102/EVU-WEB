import { validateSession, getSessionFromCookie } from '../../lib/auth';
import { requireCSRFToken } from '../../lib/csrf';
import { auditLog, getClientIP, getUserAgent, AuditEventTypes, AuditSeverity } from '../../lib/auditLog';
import { getSupabaseClient } from '../../lib/database';

const supabase = getSupabaseClient();

export default async function handler(req, res) {
  // Set JSON content type to prevent HTML responses
  res.setHeader('Content-Type', 'application/json');

  // Check for environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Environment variables not configured');
    return res.status(500).json({
      error: 'Server configuration error',
      message: 'Database connection not configured. Please check environment variables.'
    });
  }

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
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return res.status(500).json({
          error: 'Failed to read content',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }

      if (!data || !data.content) {
        console.error('No content found in database');
        return res.status(500).json({
          error: 'No content found',
          message: 'Database is empty. Please initialize the site content.'
        });
      }

      return res.status(200).json(data.content);
    } catch (error) {
      console.error('Content read error:', error);
      console.error('Error stack:', error.stack);
      return res.status(500).json({
        error: 'Failed to read content',
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
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

      // AUDIT LOG: Content updated (non-blocking - don't fail if audit fails)
      try {
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
      } catch (auditError) {
        // Log audit failure but don't block the response
        console.error('Audit log failed (non-critical):', auditError);
      }

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
