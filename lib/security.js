/**
 * Security Utilities and Middleware
 * Security logging and monitoring
 *
 * SECURITY FIX M2: Removed duplicate CSRF implementation
 * Use lib/csrf.js for all CSRF token operations (HMAC-signed, more secure)
 */

import crypto from 'crypto';
import { createManagedInterval } from './processManager.js';

// DEPRECATED: CSRF functions moved to lib/csrf.js
// Import from there instead: import { generateCSRFToken, validateCSRFToken } from './csrf';

/**
 * Delete CSRF token after use (for one-time tokens)
 */
export function consumeCSRFToken(token) {
  csrfTokens.delete(token);
}

/**
 * CSRF Protection Middleware
 */
export function csrfProtection(req, res, next) {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next ? next() : true;
  }

  // Skip CSRF for public endpoints (optional)
  const publicEndpoints = ['/api/login', '/api/register'];
  if (publicEndpoints.includes(req.url)) {
    return next ? next() : true;
  }

  const token = req.headers['x-csrf-token'] || req.body?.csrfToken;
  const sessionId = req.cookies?.sessionId;

  if (!token || !sessionId) {
    return res.status(403).json({
      error: 'CSRF token missing or invalid',
      code: 'CSRF_TOKEN_MISSING'
    });
  }

  if (!validateCSRFToken(token, sessionId)) {
    securityLog('CSRF validation failed', {
      ip: getClientIP(req),
      sessionId,
      url: req.url
    });

    return res.status(403).json({
      error: 'CSRF token invalid or expired',
      code: 'CSRF_TOKEN_INVALID'
    });
  }

  return next ? next() : true;
}

/**
 * Security Event Logging
 */
const securityEvents = [];
const MAX_EVENTS = 1000; // Keep last 1000 events in memory

/**
 * Log security event
 */
export function securityLog(event, details = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    severity: getSeverity(event)
  };

  securityEvents.push(logEntry);

  // Keep only last MAX_EVENTS
  if (securityEvents.length > MAX_EVENTS) {
    securityEvents.shift();
  }

  // Console log for critical events
  if (logEntry.severity === 'critical' || logEntry.severity === 'high') {
    console.warn(`[SECURITY ${logEntry.severity.toUpperCase()}]`, event, details);
  }

  // In production, you would send this to a logging service
  // e.g., Sentry, LogRocket, CloudWatch, etc.
}

/**
 * Get event severity
 */
function getSeverity(event) {
  const critical = ['SQL_INJECTION_ATTEMPT', 'XSS_ATTEMPT', 'UNAUTHORIZED_ACCESS'];
  const high = ['RATE_LIMIT_EXCEEDED', 'CSRF_TOKEN_INVALID', 'FAILED_LOGIN_ATTEMPT'];
  const medium = ['INVALID_INPUT', 'SESSION_EXPIRED', 'PASSWORD_CHANGE'];

  if (critical.some(e => event.includes(e))) return 'critical';
  if (high.some(e => event.includes(e))) return 'high';
  if (medium.some(e => event.includes(e))) return 'medium';
  return 'low';
}

/**
 * Get recent security events
 */
export function getSecurityEvents(limit = 100, minSeverity = 'low') {
  const severityOrder = { low: 0, medium: 1, high: 2, critical: 3 };
  const minLevel = severityOrder[minSeverity] || 0;

  return securityEvents
    .filter(e => severityOrder[e.severity] >= minLevel)
    .slice(-limit)
    .reverse();
}

/**
 * Get client IP address
 */
export function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

/**
 * Get request fingerprint (for tracking suspicious activity)
 */
export function getRequestFingerprint(req) {
  const ip = getClientIP(req);
  const userAgent = req.headers['user-agent'] || '';
  const acceptLanguage = req.headers['accept-language'] || '';

  return crypto
    .createHash('sha256')
    .update(`${ip}:${userAgent}:${acceptLanguage}`)
    .digest('hex')
    .substring(0, 16);
}

/**
 * Detect suspicious patterns
 */
export function detectSuspiciousActivity(req) {
  const suspiciousPatterns = [];

  // Check for SQL injection patterns
  const params = { ...req.query, ...req.body };
  for (const value of Object.values(params)) {
    if (typeof value === 'string') {
      if (/(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b)/gi.test(value)) {
        suspiciousPatterns.push('SQL_INJECTION_ATTEMPT');
      }
      if (/<script|javascript:|onerror=/gi.test(value)) {
        suspiciousPatterns.push('XSS_ATTEMPT');
      }
      if (/\.\.[/\\]/g.test(value)) {
        suspiciousPatterns.push('PATH_TRAVERSAL_ATTEMPT');
      }
    }
  }

  // Check for suspicious headers (skip for now - causes false positives in development)
  // const referer = req.headers.referer || req.headers.referrer;
  // Allow requests without referer or from same origin
  // This check is too strict and causes issues with legitimate requests

  // Log if suspicious
  if (suspiciousPatterns.length > 0) {
    securityLog('Suspicious activity detected', {
      patterns: suspiciousPatterns,
      ip: getClientIP(req),
      url: req.url,
      userAgent: req.headers['user-agent']
    });
  }

  return suspiciousPatterns;
}

/**
 * Audit log for important actions
 */
export function auditLog(action, userId, details = {}) {
  securityLog(`AUDIT: ${action}`, {
    userId,
    ...details
  });
}

/**
 * Security headers middleware
 */
export function securityHeaders(req, res, next) {
  // Already set in next.config.js and vercel.json, but adding extra headers
  res.setHeader('X-DNS-Prefetch-Control', 'off');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

  return next ? next() : true;
}

/**
 * Check if IP is blocked (simple implementation)
 */
const blockedIPs = new Set();
const ipViolations = new Map();

export function checkIPBlocked(req, res, next) {
  const ip = getClientIP(req);

  if (blockedIPs.has(ip)) {
    securityLog('Blocked IP attempted access', { ip, url: req.url });
    return res.status(403).json({
      error: 'Access denied',
      code: 'IP_BLOCKED'
    });
  }

  return next ? next() : true;
}

/**
 * Track IP violations and auto-block
 */
export function trackIPViolation(ip, violation) {
  const violations = ipViolations.get(ip) || [];
  violations.push({
    violation,
    timestamp: Date.now()
  });

  // Keep only violations from last hour
  const oneHourAgo = Date.now() - 3600000;
  const recentViolations = violations.filter(v => v.timestamp > oneHourAgo);
  ipViolations.set(ip, recentViolations);

  // Auto-block after 10 violations in an hour
  if (recentViolations.length >= 10) {
    blockedIPs.add(ip);
    securityLog('IP auto-blocked', {
      ip,
      violations: recentViolations.length,
      types: recentViolations.map(v => v.violation)
    });

    // Auto-unblock after 24 hours
    setTimeout(() => {
      blockedIPs.delete(ip);
      securityLog('IP auto-unblocked', { ip });
    }, 24 * 3600000);
  }
}

/**
 * Sanitize error messages (don't leak sensitive info)
 */
export function sanitizeError(error) {
  // In production, don't expose internal errors
  if (process.env.NODE_ENV === 'production') {
    return {
      error: 'An error occurred. Please try again later.',
      code: 'INTERNAL_ERROR'
    };
  }

  // In development, show more details
  return {
    error: error.message || 'An error occurred',
    code: error.code || 'INTERNAL_ERROR',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };
}

/**
 * Prevent timing attacks on password comparison
 */
export async function constantTimeCompare(a, b) {
  // bcrypt.compare already does this, but here's a general utility
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    // Still compare to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.alloc(32, 0),
      Buffer.alloc(32, 1)
    );
  }

  return crypto.timingSafeEqual(aBuffer, bBuffer);
}
