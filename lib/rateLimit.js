/**
 * Rate Limiting Middleware
 * Prevents brute force attacks and API abuse
 */

import { createManagedInterval } from './processManager.js';

const rateLimit = new Map();

/**
 * Clean up old entries every 15 minutes (managed interval)
 */
createManagedInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimit.entries()) {
    if (now - value.resetTime > 0) {
      rateLimit.delete(key);
    }
  }
}, 15 * 60 * 1000);

/**
 * Rate limiter factory
 * @param {Object} options
 * @param {number} options.maxRequests - Maximum requests allowed
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {string} options.message - Error message
 */
export function createRateLimiter(options = {}) {
  const {
    maxRequests = 5,
    windowMs = 15 * 60 * 1000, // 15 minutes
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false
  } = options;

  return async function rateLimiter(req, res, next) {
    // Get identifier (IP address or session)
    const identifier = getIdentifier(req);

    if (!identifier) {
      // If we can't identify the user, allow the request but log it
      console.warn('Rate limiter: Unable to identify request source');
      return next ? next() : true;
    }

    const now = Date.now();
    const key = `${identifier}:${req.url}`;

    let record = rateLimit.get(key);

    if (!record) {
      // First request
      record = {
        count: 1,
        resetTime: now + windowMs,
        firstRequest: now
      };
      rateLimit.set(key, record);
      return next ? next() : true;
    }

    if (now > record.resetTime) {
      // Window expired, reset
      record.count = 1;
      record.resetTime = now + windowMs;
      record.firstRequest = now;
      rateLimit.set(key, record);
      return next ? next() : true;
    }

    // Within window
    if (record.count >= maxRequests) {
      // Rate limit exceeded
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);

      res.setHeader('Retry-After', retryAfter);
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

      // Log the violation
      console.warn(`Rate limit exceeded for ${identifier} on ${req.url}`);

      return res.status(429).json({
        error: message,
        retryAfter: retryAfter
      });
    }

    // Increment counter
    if (!skipSuccessfulRequests) {
      record.count++;
      rateLimit.set(key, record);
    }

    // Add headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - record.count);
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    return next ? next() : true;
  };
}

/**
 * Get identifier from request
 * SECURITY: Use only trusted proxy headers to prevent IP spoofing
 */
function getIdentifier(req) {
  // SECURITY FIX: On Vercel, use x-vercel-forwarded-for which is set by Vercel's infrastructure
  // and cannot be spoofed by clients. Fall back to x-forwarded-for only as last resort.
  // See: https://vercel.com/docs/concepts/edge-network/headers#x-forwarded-for

  // Priority order (most trusted to least):
  // 1. x-real-ip (set by Vercel/trusted proxy)
  // 2. x-vercel-forwarded-for (Vercel-specific, trusted)
  // 3. First IP in x-forwarded-for (can be spoofed, use with caution)
  // 4. Socket remote address (direct connection)

  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return realIp;
  }

  // Vercel-specific trusted header
  const vercelForwarded = req.headers['x-vercel-forwarded-for'];
  if (vercelForwarded) {
    return vercelForwarded;
  }

  // Fallback to x-forwarded-for (less trusted)
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : req.socket?.remoteAddress || 'unknown';

  // Log warning if we had to use less trusted headers
  if (forwarded && !realIp && !vercelForwarded) {
    console.warn('Rate limiting using x-forwarded-for header (less secure):', ip);
  }

  return ip;
}

/**
 * Preset rate limiters for common use cases
 */
export const rateLimiters = {
  // Strict: Login attempts (5 attempts per 15 minutes)
  login: createRateLimiter({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Too many login attempts. Please try again in 15 minutes.'
  }),

  // Strict: Registration (3 accounts per hour)
  register: createRateLimiter({
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
    message: 'Too many registration attempts. Please try again later.'
  }),

  // Moderate: Password changes (5 per hour)
  password: createRateLimiter({
    maxRequests: 5,
    windowMs: 60 * 60 * 1000,
    message: 'Too many password change attempts. Please try again later.'
  }),

  // Moderate: General API (30 per minute)
  api: createRateLimiter({
    maxRequests: 30,
    windowMs: 60 * 1000,
    message: 'Too many requests. Please slow down.'
  }),

  // Lenient: Content updates (20 per minute)
  content: createRateLimiter({
    maxRequests: 20,
    windowMs: 60 * 1000,
    message: 'Too many content updates. Please wait before trying again.'
  }),

  // Very lenient: Read-only operations (100 per minute)
  read: createRateLimiter({
    maxRequests: 100,
    windowMs: 60 * 1000,
    message: 'Too many requests. Please slow down.'
  }),

  // Profile updates (10 per hour)
  profile: createRateLimiter({
    maxRequests: 10,
    windowMs: 60 * 60 * 1000,
    message: 'Too many profile updates. Please try again later.'
  }),

  // Forum posts (20 per hour)
  forumPost: createRateLimiter({
    maxRequests: 20,
    windowMs: 60 * 60 * 1000,
    message: 'Too many forum posts. Please slow down.'
  }),

  // Forum comments (30 per hour)
  forumComment: createRateLimiter({
    maxRequests: 30,
    windowMs: 60 * 60 * 1000,
    message: 'Too many comments. Please slow down.'
  }),

  // Support tickets (5 per hour)
  supportTicket: createRateLimiter({
    maxRequests: 5,
    windowMs: 60 * 60 * 1000,
    message: 'Too many support tickets. Please try again later.'
  }),

  // File uploads (10 per hour)
  upload: createRateLimiter({
    maxRequests: 10,
    windowMs: 60 * 60 * 1000,
    message: 'Too many file uploads. Please try again later.'
  }),

  // Email actions (3 per hour)
  email: createRateLimiter({
    maxRequests: 3,
    windowMs: 60 * 60 * 1000,
    message: 'Too many email requests. Please try again later.'
  }),

  // Data export (2 per hour)
  dataExport: createRateLimiter({
    maxRequests: 2,
    windowMs: 60 * 60 * 1000,
    message: 'Too many data export requests. Please try again later.'
  })
};

/**
 * Apply rate limiter to API route
 */
export async function withRateLimit(handler, limiter) {
  return async (req, res) => {
    const limited = await limiter(req, res, null);
    if (limited === true) {
      return handler(req, res);
    }
    // If limited returns nothing, it means response was already sent (429)
  };
}
