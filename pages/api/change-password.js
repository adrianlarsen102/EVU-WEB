import { validateSession, getSessionFromCookie, changePassword } from '../../lib/auth';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = sessionId ? await validateSession(sessionId) : null;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { newPassword, confirmPassword } = req.body;

  // Validation
  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ error: 'Both password fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

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
