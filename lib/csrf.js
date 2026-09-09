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

/**
 * Generate a stateless CSRF token for a session
 * @param {string} sessionId - The user's session ID
 * @returns {string} - The CSRF token
 */
export function generateCSRFToken(sessionId) {
  if (!sessionId) {
    throw new Error('Session ID required to generate CSRF token');
  }

  const expiresAt = Date.now() + TOKEN_EXPIRY_MS;
  const token = crypto.randomBytes(32).toString('hex');
  const signature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${token}:${expiresAt}:${sessionId}`)
    .digest('hex');

  return `${token}.${expiresAt}.${signature}`;
}

/**
 * Validate a stateless CSRF token
 * @param {string} csrfToken - The CSRF token from request
 * @param {string} sessionId - The user's session ID
 * @returns {boolean} - True if valid, false otherwise
 */
export function validateCSRFToken(csrfToken, sessionId) {
  if (!csrfToken || !sessionId) {
    return false;
  }

  const parts = csrfToken.split('.');
  if (parts.length !== 3) {
    return false;
  }

  const [token, expiresAtStr, signature] = parts;
  const expiresAt = parseInt(expiresAtStr, 10);

  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return false;
  }

  const expectedSignature = crypto
    .createHmac('sha256', CSRF_SECRET)
    .update(`${token}:${expiresAt}:${sessionId}`)
    .digest('hex');

  if (signature !== expectedSignature) {
    return false;
  }

  return true;
}

/**
 * Invalidate a CSRF token (no-op for stateless tokens)
 * @param {string} csrfToken - The CSRF token to invalidate
 */
export function invalidateCSRFToken(csrfToken) {
  // Stateless tokens do not require manual invalidation.
}

/**
 * Invalidate all tokens for a session (no-op for stateless tokens)
 * @param {string} sessionId - The session ID
 */
export function invalidateSessionTokens(sessionId) {
  // Changing the session ID automatically invalidates all previous tokens.
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
 * Get token store stats (for monitoring, mock for stateless)
 */
export function getTokenStats() {
  return {
    total: 0,
    active: 0,
    expired: 0
  };
}
