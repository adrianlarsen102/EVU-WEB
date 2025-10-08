import { createAdmin } from '../../lib/database';
import { sendWelcomeEmail } from '../../lib/email';
import { rateLimiters } from '../../lib/rateLimit';
import { validateUsername, validatePassword, validateEmail } from '../../lib/validation';
import { securityLog, getClientIP, trackIPViolation, detectSuspiciousActivity } from '../../lib/security';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Apply rate limiting (3 registrations per hour)
  const rateLimitResult = await rateLimiters.register(req, res, null);
  if (rateLimitResult !== true) {
    return; // Rate limit response already sent
  }

  // Check for suspicious activity
  const suspiciousPatterns = detectSuspiciousActivity(req);
  if (suspiciousPatterns.length > 0) {
    const ip = getClientIP(req);
    trackIPViolation(ip, 'SUSPICIOUS_REGISTRATION');
    return res.status(400).json({ error: 'Invalid request' });
  }

  const { username, password, confirmPassword, email } = req.body;

  // Basic validation
  if (!username || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  // Validate username
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.valid) {
    return res.status(400).json({ error: usernameValidation.errors[0] });
  }

  // Validate password with strength check
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({
      error: passwordValidation.errors[0],
      strength: passwordValidation.strength
    });
  }

  // Validate email if provided
  let sanitizedEmail = null;
  if (email) {
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return res.status(400).json({ error: emailValidation.errors[0] });
    }
    sanitizedEmail = emailValidation.sanitized;
  }

  try {
    // Create user with 'user' role
    const result = await createAdmin(
      usernameValidation.sanitized,
      password,
      false,
      'user'
    );

    if (result.success) {
      // Security audit log
      securityLog('New user registration', {
        username: usernameValidation.sanitized,
        ip: getClientIP(req),
        userAgent: req.headers['user-agent'],
        hasEmail: !!sanitizedEmail
      });

      // Send welcome email if email provided
      if (sanitizedEmail) {
        try {
          await sendWelcomeEmail(sanitizedEmail, usernameValidation.sanitized);
        } catch (emailError) {
          console.error('Failed to send welcome email:', emailError);
          // Don't fail registration if email fails
        }
      }

      return res.status(201).json({
        success: true,
        message: 'Account created successfully! Please log in.'
      });
    } else {
      // Check if it's a duplicate username error
      if (result.error.includes('duplicate') || result.error.includes('unique')) {
        securityLog('Duplicate username registration attempt', {
          username: usernameValidation.sanitized,
          ip: getClientIP(req)
        });
        return res.status(409).json({ error: 'Username already taken. Please choose another.' });
      }

      securityLog('Registration failed', {
        username: usernameValidation.sanitized,
        error: result.error,
        ip: getClientIP(req)
      });

      return res.status(500).json({ error: result.error || 'Failed to create account' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    securityLog('Registration error', {
      username: usernameValidation.sanitized,
      error: error.message,
      ip: getClientIP(req)
    });
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
}
