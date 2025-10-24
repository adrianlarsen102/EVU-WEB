/**
 * CSRF Token Generation and Validation
 *
 * Implements CSRF protection for state-changing operations
 * Uses session-based tokens with cryptographic signatures
 */

const crypto = require('crypto');

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
function generateCSRFToken(sessionId) {
  if (!sessionId) {
    throw new Error('Session ID required to generate CSRF token');
  }

  // Generate random token
  const token = crypto.randomBytes(32).toString('hex');

  // Create signature using session ID
  const secret = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';
  const signature = crypto
    .createHmac('sha256', secret)
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
function validateCSRFToken(csrfToken, sessionId) {
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
  const secret = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production';
  const expectedSignature = crypto
    .createHmac('sha256', secret)
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
function invalidateCSRFToken(csrfToken) {
  tokenStore.delete(csrfToken);
}

/**
 * Invalidate all tokens for a session (e.g., on logout)
 * @param {string} sessionId - The session ID
 */
function invalidateSessionTokens(sessionId) {
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
function requireCSRFToken(req, res, sessionId) {
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
function getTokenStats() {
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

// Cleanup expired tokens every 5 minutes
setInterval(cleanupExpiredTokens, 5 * 60 * 1000);

module.exports = {
  generateCSRFToken,
  validateCSRFToken,
  invalidateCSRFToken,
  invalidateSessionTokens,
  requireCSRFToken,
  getTokenStats
};
