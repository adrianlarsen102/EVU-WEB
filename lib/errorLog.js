/**
 * Error Logging System
 *
 * Separate from audit logs - tracks application errors, exceptions, and failures
 * Stores error logs in Supabase for debugging and monitoring
 */

import { getSupabaseClient } from './database.js';

/**
 * Error Types
 */
export const ErrorTypes = {
  // API Errors
  API_ERROR: 'API_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',

  // Database Errors
  DATABASE_ERROR: 'DATABASE_ERROR',
  QUERY_ERROR: 'QUERY_ERROR',

  // External Service Errors
  EMAIL_ERROR: 'EMAIL_ERROR',
  DISCORD_WEBHOOK_ERROR: 'DISCORD_WEBHOOK_ERROR',

  // File Errors
  FILE_UPLOAD_ERROR: 'FILE_UPLOAD_ERROR',
  FILE_READ_ERROR: 'FILE_READ_ERROR',

  // Application Errors
  UNHANDLED_EXCEPTION: 'UNHANDLED_EXCEPTION',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',

  // Authentication Errors
  SESSION_ERROR: 'SESSION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR'
};

/**
 * Error Severity Levels
 */
export const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Log an error event
 * @param {string} errorType - Type of error (from ErrorTypes)
 * @param {string} message - Error message
 * @param {object} details - Additional error details (stack trace, request data, etc.)
 * @param {string} severity - Error severity level
 * @param {string|null} userId - ID of user who encountered the error (if applicable)
 * @param {string|null} endpoint - API endpoint where error occurred
 * @param {string|null} ipAddress - IP address of request
 * @returns {Promise<object>} - Result object
 */
export async function logError(
  errorType,
  message,
  details = {},
  severity = ErrorSeverity.MEDIUM,
  userId = null,
  endpoint = null,
  ipAddress = null
) {
  try {
    const supabase = getSupabaseClient();

    const errorEntry = {
      error_type: errorType,
      message: message,
      details: details,
      severity: severity,
      user_id: userId ? String(userId) : null,
      endpoint: endpoint,
      ip_address: ipAddress,
      timestamp: new Date().toISOString(),
      user_agent: details.userAgent || null
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ERROR LOG:', errorEntry);
    }

    // Insert into database
    const { data, error } = await supabase
      .from('error_logs')
      .insert([errorEntry])
      .select()
      .single();

    if (error) {
      console.error('Failed to log error to database:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err) {
    // Triple-layer error handling - don't let error logging break the app
    console.error('Critical: Error logging system failed:', err);
    return { success: false, error: 'Error logging failed' };
  }
}

/**
 * Helper function to extract error details from an Error object
 */
export function extractErrorDetails(error, additionalContext = {}) {
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
    code: error.code,
    ...additionalContext
  };
}

/**
 * Helper function to get client IP from request
 */
export function getClientIP(req) {
  return (
    req.headers['x-real-ip'] ||
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}
