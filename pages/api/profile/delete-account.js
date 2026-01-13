import { validateSession, getSessionFromCookie } from '../../../lib/auth';
import { getSupabaseClient } from '../../../lib/database';
import { requireCSRFToken } from '../../../lib/csrf';

const supabase = getSupabaseClient();

export default async function handler(req, res) {
  // Check authentication
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = sessionId ? await validateSession(sessionId) : null;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // SECURITY FIX H2: Validate CSRF token for account deletion
  const csrfCheck = requireCSRFToken(req, res, sessionId);
  if (csrfCheck !== true) {
    return res.status(csrfCheck.status).json({
      error: csrfCheck.error,
      message: csrfCheck.message
    });
  }

  try {
    const { confirmUsername, confirmPassword } = req.body;

    // Get user data for verification
    const { data: user, error: userError } = await supabase
      .from('admins')
      .select('username, password_hash, avatar_url, is_admin, role')
      .eq('id', session.adminId)
      .single();

    if (userError) throw userError;

    // Verify username matches
    if (user.username !== confirmUsername) {
      return res.status(400).json({ error: 'Username does not match' });
    }

    // Verify password
    const bcrypt = require('bcrypt');
    const passwordMatch = await bcrypt.compare(confirmPassword, user.password_hash);

    if (!passwordMatch) {
      return res.status(400).json({ error: 'Password is incorrect' });
    }

    // Prevent last admin from deleting their account
    const isAdmin = user.role === 'admin' || user.is_admin === true;

    if (isAdmin) {
      const { data: allAdmins, error: adminCountError } = await supabase
        .from('admins')
        .select('id, role, is_admin');

      if (adminCountError) throw adminCountError;

      const adminCount = allAdmins.filter(a =>
        a.role === 'admin' || a.is_admin === true
      ).length;

      if (adminCount <= 1) {
        return res.status(400).json({
          error: 'Cannot delete the last admin account. Please create another admin first.'
        });
      }
    }

    // Delete avatar from storage if exists
    if (user.avatar_url && user.avatar_url.includes('profile-images')) {
      try {
        const urlParts = user.avatar_url.split('/');
        const fileName = urlParts[urlParts.length - 1];

        // SECURITY: Validate filename to prevent path traversal attacks
        // Only allow alphanumeric, hyphens, underscores, and safe extensions
        const safeFilenameRegex = /^[a-zA-Z0-9_-]+\.(jpg|jpeg|png|gif|webp)$/;

        if (!safeFilenameRegex.test(fileName)) {
          console.warn('Invalid avatar filename detected, skipping deletion:', fileName);
          // Continue without deleting if filename is suspicious
        } else {
          const filePath = `avatars/${fileName}`;

          await supabase.storage
            .from('profile-images')
            .remove([filePath]);
        }
      } catch (storageError) {
        console.error('Failed to delete avatar from storage:', storageError);
        // Continue with account deletion even if avatar deletion fails
      }
    }

    // Delete all user sessions
    const { error: sessionsError } = await supabase
      .from('sessions')
      .delete()
      .eq('admin_id', session.adminId);

    if (sessionsError) {
      console.error('Failed to delete sessions:', sessionsError);
      // Continue with account deletion
    }

    // Delete user account
    const { error: deleteError } = await supabase
      .from('admins')
      .delete()
      .eq('id', session.adminId);

    if (deleteError) throw deleteError;

    // SECURITY: Clear session cookie with Secure flag for production
    const isProduction = process.env.NODE_ENV === 'production';
    const secureCookie = isProduction ? '; Secure' : '';
    res.setHeader('Set-Cookie', `sessionId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Strict${secureCookie}`);

    res.status(200).json({
      success: true,
      message: 'Account and all associated data have been permanently deleted'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: 'Failed to delete account' });
  }
}
