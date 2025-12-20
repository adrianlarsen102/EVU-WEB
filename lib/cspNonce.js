/**
 * CSP Nonce Generation for Inline Scripts
 * Generates unique nonces per request to allow specific inline scripts
 * while blocking all others
 */

import crypto from 'crypto';

/**
 * Generate a cryptographically random nonce
 * @returns {string} Base64-encoded random nonce
 */
export function generateNonce() {
  return crypto.randomBytes(16).toString('base64');
}

/**
 * Build CSP header with nonce support
 * @param {string} nonce - The nonce for this request
 * @returns {string} Complete CSP header value
 */
export function buildCSP(nonce) {
  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https://web.cmp.usercentrics.eu https://cdn.vercel-insights.com https://va.vercel-scripts.com;
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' data: https: blob:;
    font-src 'self' data:;
    connect-src 'self' https://*.supabase.co https://vitals.vercel-insights.com wss://*.supabase.co https://*.usercentrics.eu;
    frame-ancestors 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  return csp;
}

/**
 * Middleware to inject CSP nonce into response headers
 * Use in _document.js or API routes
 */
export function injectCSPNonce(req, res, next) {
  const nonce = generateNonce();

  // Store nonce in request for use in templates
  req.cspNonce = nonce;

  // Set CSP header with nonce
  res.setHeader('Content-Security-Policy', buildCSP(nonce));

  if (next) next();

  return nonce;
}
