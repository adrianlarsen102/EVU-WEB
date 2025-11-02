import { validateSession, getSessionFromCookie } from '../../../lib/auth';
import { getSupabaseClient } from '../../../lib/database';
import { rateLimiters } from '../../../lib/rateLimit';

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

    // Update user profile
    try {
      const { display_name, email, avatar_url, bio } = req.body;

      const { data, error } = await supabase
        .from('admins')
        .update({
          display_name,
          email,
          avatar_url,
          bio,
          updated_at: new Date().toISOString()
        })
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
