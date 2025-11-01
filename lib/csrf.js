/**
 * CSRF Token Generation and Validation
 *
 * Implements CSRF protection for state-changing operations
 * Uses session-based tokens with cryptographic signatures
 */

import crypto from 'crypto';
import { createManagedInterval } from './processManager.js';

// Validate CSRF_SECRET environment variable
if (!process.env.CSRF_SECRET) {
  throw new Error(
    'CSRF_SECRET environment variable is required. ' +
    'Generate a strong random secret: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"'
  );
}

if (process.env.CSRF_SECRET === 'default-csrf-secret-change-in-production') {
  throw new Error(
    'CSRF_SECRET is set to the default value. This is insecure! ' +
    'Please set a strong random value in your environment variables.'
  );
}

if (process.env.NODE_ENV === 'production' && process.env.CSRF_SECRET.length < 32) {
  throw new Error(
    'CSRF_SECRET must be at least 32 characters in production. ' +
    'Current length: ' + process.env.CSRF_SECRET.length
  );
}

// Store the validated secret
const CSRF_SECRET = process.env.CSRF_SECRET;

// Token expiry time (1 hour)
const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

// In-memory token store (for serverless environments)
// In production, consider using Redis or database for distributed systems
const tokenStore = new Map();

/**
 * Generate a CSRF token for a session
 * @param {string} sessionId - The user's session ID
 * @returns {string} - The CSRF token
 */
export function generateCSRFToken(sessionId) {
  if (!sessionId) {
    throw new Error('Session ID required to generate CSRF token');
  }

  // Generate random token
  const token = crypto.randomBytes(32).toString('hex');

  // Create signature using session ID
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${token}:${sessionId}`)
    .digest('hex');

  // Combine token and signature
  const csrfToken = `${token}.${signature}`;

  // Store token with expiry
  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
  tokenStore.set(csrfToken, {
    sessionId,
    expiresAt
  });

  // Cleanup old tokens periodically
  cleanupExpiredTokens();

  return csrfToken;
}

/**
 * Validate a CSRF token
 * @param {string} csrfToken - The CSRF token from request
 * @param {string} sessionId - The user's session ID
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateCSRFToken(csrfToken, sessionId) {
  if (!csrfToken || !sessionId) {
    return false;
  }

  // Check if token exists in store
  const stored = tokenStore.get(csrfToken);

  if (!stored) {
    return false;
  }

  // Check if expired
  if (Date.now() > stored.expiresAt) {
    tokenStore.delete(csrfToken);
    return false;
  }

  // Verify session ID matches
  if (stored.sessionId !== sessionId) {
    return false;
  }

  // Verify signature
  const [token, signature] = csrfToken.split('.');
  const expectedSignature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${token}:${sessionId}`)
    .digest('hex');

  if (signature !== expectedSignature) {
    return false;
  }

  return true;
}

/**
 * Invalidate a CSRF token (e.g., after use)
 * @param {string} csrfToken - The CSRF token to invalidate
 */
export function invalidateCSRFToken(csrfToken) {
  tokenStore.delete(csrfToken);
}

/**
 * Invalidate all tokens for a session (e.g., on logout)
 * @param {string} sessionId - The session ID
 */
export function invalidateSessionTokens(sessionId) {
  for (const [token, data] of tokenStore.entries()) {
    if (data.sessionId === sessionId) {
      tokenStore.delete(token);
    }
  }
}

/**
 * Cleanup expired tokens from store
 */
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (now > data.expiresAt) {
      tokenStore.delete(token);
    }
  }
}

/**
 * Middleware to validate CSRF token for state-changing operations
 * @param {object} req - Request object
 * @param {object} res - Response object
 * @param {string} sessionId - Session ID
 * @returns {boolean|object} - True if valid, error response object if invalid
 */
export function requireCSRFToken(req, res, sessionId) {
  // Only check for state-changing methods
  const methodsToProtect = ['POST', 'PUT', 'DELETE', 'PATCH'];

  if (!methodsToProtect.includes(req.method)) {
    return true; // Skip CSRF check for GET, HEAD, OPTIONS
  }

  // Get token from header or body
  const csrfToken = req.headers['x-csrf-token'] || req.body?.csrfToken;

  if (!csrfToken) {
    return {
      status: 403,
      error: 'CSRF token missing',
      message: 'CSRF token required for this operation'
    };
  }

  const isValid = validateCSRFToken(csrfToken, sessionId);

  if (!isValid) {
    return {
      status: 403,
      error: 'CSRF token invalid',
      message: 'Invalid or expired CSRF token'
    };
  }

  return true;
}

/**
 * Get token store stats (for monitoring)
 */
export function getTokenStats() {
  const now = Date.now();
  let active = 0;
  let expired = 0;

  for (const [, data] of tokenStore.entries()) {
    if (now > data.expiresAt) {
      expired++;
    } else {
      active++;
    }
  }

  return {
    total: tokenStore.size,
    active,
    expired
  };
}

// Cleanup expired tokens every 5 minutes (managed interval)
createManagedInterval(cleanupExpiredTokens, 5 * 60 * 1000);
