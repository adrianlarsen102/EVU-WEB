import { getSupabaseClient } from '../../../lib/database';
import { sendEmail } from '../../../lib/email';
import { rateLimiters } from '../../../lib/rateLimit';
import { validateEmail } from '../../../lib/validation';
import logger from '../../../lib/logger';
import crypto from 'crypto';

const supabase = getSupabaseClient();

/**
 * Request password reset
 * POST /api/auth/forgot-password
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply strict rate limiting (3 requests per hour per IP)
  const rateLimitResult = await rateLimiters.email(req, res, null);
  if (rateLimitResult !== true) return;

  try {
    const { email } = req.body;

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ error: emailValidation.errors[0] });
    }

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('admins')
      .select('id, username, email')
      .eq('email', emailValidation.sanitized)
      .single();

    // SECURITY: Always return success to prevent user enumeration
    // Don't reveal whether email exists or not
    if (userError || !user) {
      logger.security('Password reset requested for non-existent email', {
        email: emailValidation.sanitized
      });
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      });
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const expiresAt = new Date(Date.now() + 3600000); // 1 hour expiry

    // Store reset token in database
    const { error: insertError } = await supabase
      .from('password_reset_tokens')
      .insert({
        user_id: user.id,
        token_hash: resetTokenHash,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });

    if (insertError) {
      logger.error('Failed to store password reset token', insertError);
      return res.status(500).json({ error: 'Failed to process password reset request' });
    }

    // Generate reset link
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Send reset email
    const emailResult = await sendEmail(
      user.email,
      'Password Reset Request - EVU Gaming',
      `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #6b46c1;">Password Reset Request</h2>
          <p>Hi ${user.username},</p>
          <p>You requested to reset your password for your EVU Gaming Network account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}"
               style="background-color: #6b46c1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:</p>
          <p style="color: #666; font-size: 12px; word-break: break-all;">${resetUrl}</p>
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            <strong>This link will expire in 1 hour.</strong>
          </p>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this password reset, please ignore this email or contact support if you have concerns.
          </p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="color: #999; font-size: 12px;">
            EVU Gaming Network<br />
            This is an automated message, please do not reply.
          </p>
        </div>
      `,
      `Password Reset Request\n\nHi ${user.username},\n\nYou requested to reset your password. Click the link below:\n\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.`
    );

    if (!emailResult.success) {
      logger.error('Failed to send password reset email', emailResult.error);
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    logger.info('Password reset email sent', { userId: user.id, email: user.email });

    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });

  } catch (error) {
    logger.error('Forgot password error', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
}
