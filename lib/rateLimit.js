/**
 * Rate Limiting Middleware
 * Prevents brute force attacks and API abuse
 */

const rateLimit = new Map();

/**
 * Clean up old entries every 15 minutes
 */
setInterval(() => {
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
 */
function getIdentifier(req) {
  // Try to get real IP (considering proxies)
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? forwarded.split(',')[0].trim()
    : req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';

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
