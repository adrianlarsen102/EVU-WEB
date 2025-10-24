import { validateSession, getSessionFromCookie, changePassword } from '../../lib/auth';
import { requireCSRFToken } from '../../lib/csrf';
import { validatePassword } from '../../lib/validation';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = sessionId ? await validateSession(sessionId) : null;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // SECURITY: Validate CSRF token
  const csrfCheck = requireCSRFToken(req, res, sessionId);
  if (csrfCheck !== true) {
    return res.status(csrfCheck.status).json({
      error: csrfCheck.error,
      message: csrfCheck.message
    });
  }

  const { newPassword, confirmPassword } = req.body;

  // Validation
  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'Both password fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  // SECURITY: Use comprehensive password validation
  const passwordValidation = validatePassword(newPassword);

  if (!passwordValidation.valid) {
    return res.status(400).json({
      error: 'Password does not meet security requirements',
      details: passwordValidation.errors
    });
  }

  // Check password strength
  if (passwordValidation.strength < 2) {
    return res.status(400).json({
      error: 'Password is too weak',
      details: [
        'Password must contain at least:',
        '- 8 characters',
        '- One uppercase letter',
        '- One lowercase letter',
        '- One number or special character'
      ]
    });
  }

  // Prevent use of default password
  if (newPassword === 'admin123') {
    return res.status(400).json({ error: 'Please choose a different password than the default' });
  }

  try {
    await changePassword(session.adminId, newPassword);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
}
