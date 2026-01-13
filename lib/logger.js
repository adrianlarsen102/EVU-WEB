/**
 * Secure Production Logger
 * SECURITY FIX H1: Prevents sensitive data leakage in production logs
 */

const isProduction = process.env.NODE_ENV === 'production';

/**
 * Sanitize sensitive data from log messages
 */
function sanitizeLogData(data) {
  if (!data) return data;

  if (typeof data === 'string') {
    // Remove potential sensitive patterns
    return data
      .replace(/sessionId[=:]\s*[a-f0-9]{64}/gi, 'sessionId=***REDACTED***')
      .replace(/password[=:]\s*\S+/gi, 'password=***REDACTED***')
      .replace(/token[=:]\s*[a-zA-Z0-9._-]+/gi, 'token=***REDACTED***')
      .replace(/api[_-]?key[=:]\s*\S+/gi, 'apiKey=***REDACTED***')
      .replace(/secret[=:]\s*\S+/gi, 'secret=***REDACTED***');
  }

  if (typeof data === 'object') {
    const sanitized = { ...data };
    const sensitiveKeys = [
      'password', 'password_hash', 'passwordHash',
      'token', 'apiKey', 'api_key', 'secret',
      'sessionId', 'session_id', 'csrfToken'
    ];

    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '***REDACTED***';
      }
    }

    return sanitized;
  }

  return data;
}

/**
 * Logger instance with environment-aware behavior
 */
const logger = {
  /**
   * Log informational messages (dev only)
   */
  info: (message, data) => {
    if (!isProduction) {
      console.log(`[INFO] ${message}`, data ? sanitizeLogData(data) : '');
    }
  },

  /**
   * Log warning messages (always logged, data sanitized in prod)
   */
  warn: (message, data) => {
    if (isProduction) {
      console.warn(`[WARN] ${message}`);
    } else {
      console.warn(`[WARN] ${message}`, data ? sanitizeLogData(data) : '');
    }
  },

  /**
   * Log error messages (always logged, sanitized in prod)
   */
  error: (message, error) => {
    if (isProduction) {
      // In production, only log message and error type, no stack traces
      const errorInfo = error instanceof Error
        ? { type: error.name, message: error.message }
        : { error: String(error) };
      console.error(`[ERROR] ${message}`, sanitizeLogData(errorInfo));
    } else {
      // In development, log full error details
      console.error(`[ERROR] ${message}`, error);
    }
  },

  /**
   * Log debug messages (dev only)
   */
  debug: (message, data) => {
    if (!isProduction && process.env.DEBUG === 'true') {
      console.log(`[DEBUG] ${message}`, data ? sanitizeLogData(data) : '');
    }
  },

  /**
   * Log security events (always logged, minimal info in prod)
   */
  security: (message, data) => {
    if (isProduction) {
      // In production, log security events with minimal context
      console.warn(`[SECURITY] ${message}`);
    } else {
      console.warn(`[SECURITY] ${message}`, sanitizeLogData(data));
    }
  }
};

export default logger;

// Export individual functions for convenience
export const { info, warn, error, debug, security } = logger;
