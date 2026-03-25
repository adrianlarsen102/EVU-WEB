import { validateSession, getSessionFromCookie } from '../../../lib/auth';
import { getSupabaseClient } from '../../../lib/database';
import { rateLimiters } from '../../../lib/rateLimit';
import { requireCSRFToken } from '../../../lib/csrf';
import { sanitizeString, validateEmail, validateUrl } from '../../../lib/validation';

const supabase = getSupabaseClient();

export default async function handler(req, res) {
  // Check authentication
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = sessionId ? await validateSession(sessionId) : null;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // Get user profile
    try {
      const { data: user, error } = await supabase
        .from('admins')
        .select('id, username, email, display_name, avatar_url, bio, is_admin, is_default_password, created_at, updated_at')
        .eq('id', session.adminId)
        .single();

      if (error) throw error;

      res.status(200).json(user);
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({ error: 'Failed to load profile' });
    }
  } else if (req.method === 'PUT') {
    // Apply rate limiting for profile updates
    const rateLimitResult = await rateLimiters.profile(req, res, null);
    if (rateLimitResult !== true) {
      return; // Rate limit response already sent
    }

    // SECURITY: Validate CSRF token for state-changing operation
    const csrfCheck = requireCSRFToken(req, res, sessionId);
    if (csrfCheck !== true) {
      return res.status(csrfCheck.status).json({
        error: csrfCheck.error,
        message: csrfCheck.message
      });
    }

    // Update user profile
    try {
      const { display_name, email, avatar_url, bio } = req.body;

      // Sanitize and validate all inputs
      const updates = { updated_at: new Date().toISOString() };

      if (display_name !== undefined) {
        updates.display_name = sanitizeString(display_name).slice(0, 50);
      }

      if (email !== undefined) {
        if (email === '') {
          updates.email = null;
        } else {
          const emailValidation = validateEmail(email);
          if (!emailValidation.valid) {
            return res.status(400).json({ error: emailValidation.errors[0] });
          }
          updates.email = emailValidation.sanitized;
        }
      }

      if (avatar_url !== undefined) {
        if (avatar_url === '' || avatar_url === null) {
          updates.avatar_url = null;
        } else {
          const urlValidation = validateUrl(avatar_url);
          if (!urlValidation.valid) {
            return res.status(400).json({ error: 'Invalid avatar URL: ' + urlValidation.errors[0] });
          }
          updates.avatar_url = urlValidation.sanitized;
        }
      }

      if (bio !== undefined) {
        updates.bio = sanitizeString(bio).slice(0, 500);
      }

      const { data, error } = await supabase
        .from('admins')
        .update(updates)
        .eq('id', session.adminId)
        .select()
        .single();

      if (error) throw error;

      res.status(200).json({ success: true, user: data });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
