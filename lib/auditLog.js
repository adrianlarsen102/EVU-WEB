/**
 * Audit Logging System
 *
 * Tracks critical administrative actions for security and compliance
 * Stores audit logs in Supabase for persistence and analysis
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Audit Event Types
 */
export const AuditEventTypes = {
  // Authentication
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGED: 'PASSWORD_CHANGED',

  // User Management
  USER_CREATED: 'USER_CREATED',
  USER_DELETED: 'USER_DELETED',
  USER_UPDATED: 'USER_UPDATED',
  USER_ROLE_CHANGED: 'USER_ROLE_CHANGED',

  // Content Management
  CONTENT_UPDATED: 'CONTENT_UPDATED',
  CONTENT_DELETED: 'CONTENT_DELETED',

  // Forum Moderation
  TOPIC_DELETED: 'TOPIC_DELETED',
  COMMENT_DELETED: 'COMMENT_DELETED',
  TOPIC_LOCKED: 'TOPIC_LOCKED',

  // Settings
  EMAIL_SETTINGS_UPDATED: 'EMAIL_SETTINGS_UPDATED',
  SYSTEM_SETTINGS_UPDATED: 'SYSTEM_SETTINGS_UPDATED',

  // Roles & Permissions
  ROLE_CREATED: 'ROLE_CREATED',
  ROLE_UPDATED: 'ROLE_UPDATED',
  ROLE_DELETED: 'ROLE_DELETED',

  // Security Events
  UNAUTHORIZED_ACCESS_ATTEMPT: 'UNAUTHORIZED_ACCESS_ATTEMPT',
  CSRF_TOKEN_INVALID: 'CSRF_TOKEN_INVALID',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Support
  TICKET_STATUS_CHANGED: 'TICKET_STATUS_CHANGED',
  TICKET_DELETED: 'TICKET_DELETED'
};

/**
 * Severity Levels
 */
export const AuditSeverity = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * Log an audit event
 * @param {string} eventType - Type of event (from AuditEventTypes)
 * @param {string|null} userId - ID of user performing action
 * @param {object} metadata - Additional event data
 * @param {string} severity - Event severity level
 * @param {string|null} ipAddress - IP address of request
 * @returns {Promise<object>} - Result object
 */
export async function auditLog(
  eventType,
  userId = null,
  metadata = {},
  severity = AuditSeverity.INFO,
  ipAddress = null
) {
  try {
    const logEntry = {
      event_type: eventType,
      user_id: userId ? String(userId) : null,  // Convert to string for compatibility
      metadata: metadata,
      severity: severity,
      ip_address: ipAddress,
      timestamp: new Date().toISOString(),
      user_agent: metadata.userAgent || null
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('AUDIT LOG:', logEntry);
    }

    // Store in database (gracefully handle if table doesn't exist)
    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert([logEntry])
        .select()
        .single();

      if (error) {
        // Log error but don't crash - audit logging is non-critical
        console.warn('Audit log not saved (table may not exist):', error.message);
        return { success: false, error: error.message };
      }

      return { success: true, log: data };
    } catch (dbError) {
      // Database error - likely table doesn't exist
      console.warn('Audit log database error (non-critical):', dbError.message);
      return { success: false, error: 'Audit table not available' };
    }
  } catch (error) {
    // Unexpected error in audit log function
    console.error('Audit log system error (non-critical):', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get audit logs with filtering
 * @param {object} filters - Filter options
 * @returns {Promise<array>} - Array of audit logs
 */
export async function getAuditLogs(filters = {}) {
  try {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false });

    // Apply filters
    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.eventType) {
      query = query.eq('event_type', filters.eventType);
    }

    if (filters.severity) {
      query = query.eq('severity', filters.severity);
    }

    if (filters.startDate) {
      query = query.gte('timestamp', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('timestamp', filters.endDate);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    } else {
      query = query.limit(100); // Default limit
    }

    const { data, error } = await query;

    if (error) {
      console.error('Failed to fetch audit logs:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Get audit logs error:', error);
    return [];
  }
}

/**
 * Get audit log statistics
 * @param {number} days - Number of days to analyze
 * @returns {Promise<object>} - Statistics object
 */
export async function getAuditStats(days = 30) {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await supabase
      .from('audit_logs')
      .select('event_type, severity')
      .gte('timestamp', startDate.toISOString());

    if (error) {
      console.error('Failed to fetch audit stats:', error);
      return null;
    }

    // Calculate statistics
    const stats = {
      total: data.length,
      byEventType: {},
      bySeverity: {
        info: 0,
        warning: 0,
        error: 0,
        critical: 0
      }
    };

    data.forEach(log => {
      // Count by event type
      stats.byEventType[log.event_type] =
        (stats.byEventType[log.event_type] || 0) + 1;

      // Count by severity
      stats.bySeverity[log.severity] =
        (stats.bySeverity[log.severity] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Get audit stats error:', error);
    return null;
  }
}

/**
 * Delete old audit logs (for cleanup)
 * @param {number} retentionDays - Number of days to retain logs
 * @returns {Promise<object>} - Result object
 */
export async function cleanupOldLogs(retentionDays = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const { error } = await supabase
      .from('audit_logs')
      .delete()
      .lt('timestamp', cutoffDate.toISOString());

    if (error) {
      console.error('Failed to cleanup old logs:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Cleanup logs error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper to extract IP address from request
 */
export function getClientIP(req) {
  return (
    req.headers['x-real-ip'] ||
    req.headers['x-vercel-forwarded-for'] ||
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

/**
 * Helper to extract user agent from request
 */
export function getUserAgent(req) {
  return req.headers['user-agent'] || 'unknown';
}

module.exports = {
  auditLog,
  getAuditLogs,
  getAuditStats,
  cleanupOldLogs,
  getClientIP,
  getUserAgent,
  AuditEventTypes,
  AuditSeverity
};
