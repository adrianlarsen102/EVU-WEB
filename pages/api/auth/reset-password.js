import { getSupabaseClient } from '../../../lib/database';
import { rateLimiters } from '../../../lib/rateLimit';
import { validatePassword } from '../../../lib/validation';
import { requireCSRFToken } from '../../../lib/csrf';
import logger from '../../../lib/logger';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const supabase = getSupabaseClient();
const SALT_ROUNDS = 10;

/**
 * Reset password with token
 * POST /api/auth/reset-password
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting
  const rateLimitResult = await rateLimiters.password(req, res, null);
  if (rateLimitResult !== true) return;

  try {
    const { token, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Invalid reset token' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      return res.status(400).json({
        error: 'Password requirements not met',
        details: passwordValidation.errors
      });
    }

    if (passwordValidation.strength < 3) {
      return res.status(400).json({
        error: 'Password is too weak',
        details: ['Please use a stronger password with a mix of uppercase, lowercase, numbers, and special characters']
      });
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find valid reset token
    const { data: resetToken, error: tokenError } = await supabase
      .from('password_reset_tokens')
      .select('*')
      .eq('token_hash', tokenHash)
      .eq('used', false)
      .single();

    if (tokenError || !resetToken) {
      logger.security('Invalid password reset token attempted', { tokenHash });
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(resetToken.expires_at);

    if (now > expiresAt) {
      logger.security('Expired password reset token used', {
        userId: resetToken.user_id,
        expiresAt: resetToken.expires_at
      });
      return res.status(400).json({ error: 'Reset token has expired' });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Update user password
    const { error: updateError } = await supabase
      .from('admins')
      .update({
        password_hash: passwordHash,
        is_default_password: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', resetToken.user_id);

    if (updateError) {
      logger.error('Failed to update password', updateError);
      return res.status(500).json({ error: 'Failed to reset password' });
    }

    // Mark token as used
    await supabase
      .from('password_reset_tokens')
      .update({ used: true, used_at: new Date().toISOString() })
      .eq('id', resetToken.id);

    // Invalidate all existing sessions for this user
    await supabase
      .from('sessions')
      .delete()
      .eq('admin_id', resetToken.user_id);

    // Invalidate session cache
    const sessionCache = require('../../../lib/sessionCache');
    sessionCache.invalidateUserSessions(resetToken.user_id);

    logger.info('Password reset successful', { userId: resetToken.user_id });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. Please log in with your new password.'
    });

  } catch (error) {
    logger.error('Reset password error', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
}
