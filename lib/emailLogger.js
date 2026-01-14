/**
 * Email Logging System
 *
 * Provides functions to log all email sending activity for:
 * - Debugging email delivery issues
 * - Compliance and audit trail
 * - Monitoring email sending patterns
 * - GDPR data retention
 *
 * Usage:
 * ```javascript
 * import { logEmailSent, logEmailFailed } from './emailLogger';
 *
 * // After successfully sending email
 * await logEmailSent({
 *   recipient: 'user@example.com',
 *   subject: 'Welcome!',
 *   emailType: 'welcome',
 *   provider: 'resend',
 *   userId: 'user-uuid'
 * });
 *
 * // After email sending fails
 * await logEmailFailed({
 *   recipient: 'user@example.com',
 *   subject: 'Welcome!',
 *   emailType: 'welcome',
 *   errorMessage: 'SMTP timeout',
 *   provider: 'smtp'
 * });
 * ```
 */

import { getSupabaseClient } from './database';

const supabase = getSupabaseClient();

/**
 * Email type constants for consistency
 */
export const EmailTypes = {
  WELCOME: 'welcome',
  PASSWORD_RESET: 'password_reset',
  TICKET_CREATED: 'ticket_created',
  TICKET_REPLY: 'ticket_reply',
  FORUM_MENTION: 'forum_mention',
  FORUM_REPLY: 'forum_reply',
  ANNOUNCEMENT: 'announcement',
  TEST: 'test',
  ADMIN_NOTIFICATION: 'admin_notification',
  SECURITY_ALERT: 'security_alert'
};

/**
 * Log a successfully sent email
 *
 * @param {Object} options - Email logging options
 * @param {string} options.recipient - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.emailType - Type of email (use EmailTypes constants)
 * @param {string} [options.provider='unknown'] - Email provider used ('resend', 'smtp', etc.)
 * @param {string} [options.userId] - User ID if recipient is a registered user
 * @param {string} [options.relatedEntityType] - Type of related entity ('ticket', 'forum_topic', etc.)
 * @param {string} [options.relatedEntityId] - ID of related entity
 * @param {string} [options.templateName] - Name of email template used
 * @returns {Promise<string|null>} - Log ID or null if logging failed
 */
export async function logEmailSent({
  recipient,
  subject,
  emailType,
  provider = 'unknown',
  userId = null,
  relatedEntityType = null,
  relatedEntityId = null,
  templateName = null
}) {
  try {
    const { data, error } = await supabase.rpc('log_email_sent', {
      p_recipient: recipient,
      p_subject: subject,
      p_email_type: emailType,
      p_provider: provider,
      p_user_id: userId,
      p_related_entity_type: relatedEntityType,
      p_related_entity_id: relatedEntityId,
      p_template_name: templateName
    });

    if (error) {
      console.error('Error logging sent email:', error);
      return null;
    }

    return data;
  } catch (error) {
    // Non-blocking: email was sent, but logging failed
    console.error('Email logging error (sent):', error);
    return null;
  }
}

/**
 * Log a failed email attempt
 *
 * @param {Object} options - Email logging options
 * @param {string} options.recipient - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.emailType - Type of email (use EmailTypes constants)
 * @param {string} options.errorMessage - Error message explaining why email failed
 * @param {string} [options.provider='unknown'] - Email provider used
 * @param {string} [options.userId] - User ID if recipient is a registered user
 * @param {string} [options.relatedEntityType] - Type of related entity
 * @param {string} [options.relatedEntityId] - ID of related entity
 * @returns {Promise<string|null>} - Log ID or null if logging failed
 */
export async function logEmailFailed({
  recipient,
  subject,
  emailType,
  errorMessage,
  provider = 'unknown',
  userId = null,
  relatedEntityType = null,
  relatedEntityId = null
}) {
  try {
    const { data, error } = await supabase.rpc('log_email_failed', {
      p_recipient: recipient,
      p_subject: subject,
      p_email_type: emailType,
      p_error_message: errorMessage,
      p_provider: provider,
      p_user_id: userId,
      p_related_entity_type: relatedEntityType,
      p_related_entity_id: relatedEntityId
    });

    if (error) {
      console.error('Error logging failed email:', error);
      return null;
    }

    return data;
  } catch (error) {
    // Non-blocking: Don't throw error if logging fails
    console.error('Email logging error (failed):', error);
    return null;
  }
}

/**
 * Get recent email logs (for admin dashboard)
 *
 * @param {number} [limit=50] - Number of logs to return
 * @param {number} [offset=0] - Offset for pagination
 * @returns {Promise<Array>} - Array of email log objects
 */
export async function getRecentEmailLogs(limit = 50, offset = 0) {
  try {
    const { data, error } = await supabase.rpc('get_recent_email_logs', {
      p_limit: limit,
      p_offset: offset
    });

    if (error) {
      console.error('Error fetching email logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Email logs fetch error:', error);
    return [];
  }
}

/**
 * Get email sending statistics
 *
 * @param {number} [days=7] - Number of days to include in statistics
 * @returns {Promise<Object>} - Statistics object with total_sent, total_failed, success_rate
 */
export async function getEmailStats(days = 7) {
  try {
    const { data, error } = await supabase.rpc('get_email_stats', {
      p_days: days
    });

    if (error) {
      console.error('Error fetching email stats:', error);
      return {
        total_sent: 0,
        total_failed: 0,
        total_pending: 0,
        success_rate: 0
      };
    }

    return data?.[0] || {
      total_sent: 0,
      total_failed: 0,
      total_pending: 0,
      success_rate: 0
    };
  } catch (error) {
    console.error('Email stats fetch error:', error);
    return {
      total_sent: 0,
      total_failed: 0,
      total_pending: 0,
      success_rate: 0
    };
  }
}

/**
 * Get email logs for a specific user
 *
 * @param {string} userId - User ID
 * @param {number} [limit=20] - Number of logs to return
 * @returns {Promise<Array>} - Array of email log objects
 */
export async function getUserEmailLogs(userId, limit = 20) {
  try {
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching user email logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('User email logs fetch error:', error);
    return [];
  }
}

/**
 * Get failed emails for debugging
 *
 * @param {number} [limit=20] - Number of logs to return
 * @returns {Promise<Array>} - Array of failed email log objects
 */
export async function getFailedEmails(limit = 20) {
  try {
    const { data, error } = await supabase
      .from('email_logs')
      .select('*')
      .in('status', ['failed', 'bounced'])
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching failed emails:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Failed emails fetch error:', error);
    return [];
  }
}

/**
 * Cleanup old email logs (GDPR compliance)
 * Call this from a scheduled job (e.g., Vercel Cron)
 *
 * @returns {Promise<number>} - Number of deleted logs
 */
export async function cleanupOldEmailLogs() {
  try {
    const { data, error } = await supabase.rpc('cleanup_old_email_logs');

    if (error) {
      console.error('Error cleaning up old email logs:', error);
      return 0;
    }

    console.log(`Cleaned up ${data} old email logs`);
    return data || 0;
  } catch (error) {
    console.error('Email logs cleanup error:', error);
    return 0;
  }
}

/**
 * Helper function to determine email provider from settings
 * (Use this when integrating with email sending)
 *
 * @param {Object} emailSettings - Email settings object
 * @returns {string} - Provider name ('resend', 'smtp', 'unknown')
 */
export function getEmailProvider(emailSettings) {
  if (!emailSettings) return 'unknown';

  if (emailSettings.provider === 'resend' && emailSettings.resendApiKey) {
    return 'resend';
  }

  if (emailSettings.provider === 'smtp' && emailSettings.smtpHost) {
    return 'smtp';
  }

  return 'unknown';
}

/**
 * Wrapper function to send email with automatic logging
 * Use this instead of calling sendEmail directly
 *
 * @param {Function} sendEmailFn - The actual email sending function
 * @param {Object} emailOptions - Email options (to, subject, html, etc.)
 * @param {Object} loggingOptions - Logging metadata
 * @returns {Promise<Object>} - { success: boolean, error?: string, logId?: string }
 */
export async function sendEmailWithLogging(sendEmailFn, emailOptions, loggingOptions = {}) {
  const {
    emailType,
    provider = 'unknown',
    userId = null,
    relatedEntityType = null,
    relatedEntityId = null,
    templateName = null
  } = loggingOptions;

  try {
    // Send the email
    const result = await sendEmailFn(emailOptions);

    // Log success
    if (result.success) {
      const logId = await logEmailSent({
        recipient: emailOptions.to,
        subject: emailOptions.subject,
        emailType,
        provider,
        userId,
        relatedEntityType,
        relatedEntityId,
        templateName
      });

      return { success: true, logId };
    } else {
      // Log failure
      const logId = await logEmailFailed({
        recipient: emailOptions.to,
        subject: emailOptions.subject,
        emailType,
        errorMessage: result.error || 'Unknown error',
        provider,
        userId,
        relatedEntityType,
        relatedEntityId
      });

      return { success: false, error: result.error, logId };
    }
  } catch (error) {
    // Log exception
    const logId = await logEmailFailed({
      recipient: emailOptions.to,
      subject: emailOptions.subject,
      emailType,
      errorMessage: error.message || 'Exception during email send',
      provider,
      userId,
      relatedEntityType,
      relatedEntityId
    });

    return { success: false, error: error.message, logId };
  }
}
