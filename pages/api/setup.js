import { checkIsSetup, setupAdmin } from '../../lib/database';
import { validateUsername } from '../../lib/validation';
import { rateLimiters } from '../../lib/rateLimit';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Apply rate limiting (prevents brute forcing the setup endpoint)
    const rateLimitResult = await rateLimiters.api(req, res, null);
    if (rateLimitResult !== true) {
      return;
    }

    // 1. SECURITY CHECK: Verify the system is NOT already set up
    const isSetup = await checkIsSetup();
    if (isSetup) {
      return res.status(403).json({ 
        error: 'System is already set up. If you need an account, ask an existing administrator.' 
      });
    }

    const { username, displayName, password } = req.body;

    // 2. Validate input
    if (!username || !password || !displayName) {
      return res.status(400).json({ error: 'Username, display name, and password are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.valid) {
      return res.status(400).json({ error: usernameValidation.errors[0] });
    }

    // 3. Create the admin account
    const result = await setupAdmin(usernameValidation.sanitized, displayName, password);

    if (result.success) {
      return res.status(200).json({ success: true, message: 'Setup completed successfully!' });
    } else {
      return res.status(500).json({ error: 'Failed to create admin account', details: result.error });
    }
  } catch (error) {
    console.error('Setup API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
