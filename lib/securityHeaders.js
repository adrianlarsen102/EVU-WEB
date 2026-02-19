/**
 * Security Headers Middleware
 * Implements OWASP security best practices
 */

/**
 * Set comprehensive security headers on API responses
 * @param {Object} res - Next.js response object
 */
export function setSecurityHeaders(res) {
  // Prevent clickjacking attacks
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection (legacy browsers)
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy - don't leak URLs
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy - restrict browser features
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Content Security Policy (strict)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vitals.vercel-insights.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  res.setHeader('Content-Security-Policy', csp);

  // Strict Transport Security (HSTS) - only in production with HTTPS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  return res;
}

/**
 * Security headers middleware for API routes
 * @param {Function} handler - API route handler
 * @returns {Function} Wrapped handler with security headers
 */
export function withSecurityHeaders(handler) {
  return async (req, res) => {
    setSecurityHeaders(res);
    return await handler(req, res);
  };
}

/**
 * Set CORS headers for API endpoints
 * @param {Object} res - Next.js response object
 * @param {Object} options - CORS options
 */
export function setCORSHeaders(res, options = {}) {
  // SECURITY: Never fall back to wildcard '*' - fail safely with no CORS header
  const defaultOrigin = process.env.NEXT_PUBLIC_APP_URL || null;
  const {
    origin = defaultOrigin,
    methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders = ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    credentials = true,
    maxAge = 86400 // 24 hours
  } = options;

  // SECURITY: Only set CORS header if a valid origin is configured
  if (!origin) {
    return res;
  }

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', allowedHeaders.join(', '));

  if (credentials) {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.setHeader('Access-Control-Max-Age', maxAge.toString());

  return res;
}

/**
 * Handle CORS preflight requests
 * @param {Object} req - Next.js request object
 * @param {Object} res - Next.js response object
 * @param {Object} options - CORS options
 * @returns {boolean} True if preflight was handled
 */
export function handleCORSPreflight(req, res, options = {}) {
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res, options);
    res.status(204).end();
    return true;
  }
  return false;
}

/**
 * Set cache control headers
 * @param {Object} res - Next.js response object
 * @param {string} directive - Cache directive (e.g., 'no-store', 'max-age=3600')
 */
export function setCacheControl(res, directive) {
  res.setHeader('Cache-Control', directive);
  return res;
}

/**
 * Disable caching for sensitive endpoints
 * @param {Object} res - Next.js response object
 */
export function disableCache(res) {
  return setCacheControl(res, 'no-store, no-cache, must-revalidate, proxy-revalidate');
}

/**
 * Set public cache for static content
 * @param {Object} res - Next.js response object
 * @param {number} maxAge - Max age in seconds
 */
export function setPublicCache(res, maxAge = 3600) {
  return setCacheControl(res, `public, max-age=${maxAge}, s-maxage=${maxAge}`);
}

/**
 * Complete API security middleware combining multiple protections
 * @param {Function} handler - API route handler
 * @param {Object} options - Security options
 * @returns {Function} Wrapped handler
 */
export function withAPISecurity(handler, options = {}) {
  return async (req, res) => {
    // Set security headers
    setSecurityHeaders(res);

    // Handle CORS if enabled
    if (options.cors) {
      if (handleCORSPreflight(req, res, options.corsOptions)) {
        return; // Preflight handled
      }
      setCORSHeaders(res, options.corsOptions);
    }

    // Set cache control
    if (options.cache === false) {
      disableCache(res);
    } else if (options.cache) {
      setCacheControl(res, options.cache);
    } else {
      // Default: no cache for API routes
      disableCache(res);
    }

    // Call the original handler
    return await handler(req, res);
  };
}
