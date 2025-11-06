import { verifyLogin, createSession } from '../../lib/auth';
import { rateLimiters } from '../../lib/rateLimit';
import { validateUsername } from '../../lib/validation';
import { securityLog, getClientIP, trackIPViolation } from '../../lib/security';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting (5 attempts per 15 minutes)
  const rateLimitResult = await rateLimiters.login(req, res, null);
  if (rateLimitResult !== true) {
    return; // Rate limit response already sent
  }

  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  // Validate username format
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    return res.status(400).json({ error: usernameValidation.errors[0] });
  }

  // Verify login
  const admin = await verifyLogin(usernameValidation.sanitized, password);

  if (admin) {
    // Successful login
    const sessionId = await createSession(admin.id);

    // Secure cookie settings
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = [
      `sessionId=${sessionId}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      isProduction ? 'Secure' : '', // HTTPS only in production
      'Max-Age=86400' // 24 hours
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', cookieOptions);

    // Security audit log
    securityLog('Successful login', {
      userId: admin.id,
      username: admin.username,
      ip: getClientIP(req),
      userAgent: req.headers['user-agent']
    });

    return res.status(200).json({
      success: true,
      isDefaultPassword: admin.isDefaultPassword
    });
  } else {
    // Failed login attempt
    const ip = getClientIP(req);

    securityLog('Failed login attempt', {
      username: usernameValidation.sanitized,
      ip,
      userAgent: req.headers['user-agent']
    });

    // Track violations for auto-blocking
    trackIPViolation(ip, 'FAILED_LOGIN');

    // Generic error message (don&apos;t reveal if username exists)
    return res.status(401).json({ error: 'Invalid credentials' });
  }
}
