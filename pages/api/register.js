import { createAdmin } from '../../lib/database';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password, confirmPassword, email } = req.body;

  // Validation
  if (!username || !password || !confirmPassword) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' });
  }

  if (username.length < 3 || username.length > 20) {
    return res.status(400).json({ error: 'Username must be between 3 and 20 characters' });
  }

  // Check if username contains only valid characters
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return res.status(400).json({ error: 'Username can only contain letters, numbers, hyphens, and underscores' });
  }

  // Prevent using default password
  if (password === 'admin123') {
    return res.status(400).json({ error: 'Please choose a different password' });
  }

  try {
    // Create user with 'user' role
    const result = await createAdmin(username, password, false, 'user');

    if (result.success) {
      return res.status(201).json({
        success: true,
        message: 'Account created successfully! Please log in.'
      });
    } else {
      // Check if it's a duplicate username error
      if (result.error.includes('duplicate') || result.error.includes('unique')) {
        return res.status(409).json({ error: 'Username already taken. Please choose another.' });
      }
      return res.status(500).json({ error: result.error || 'Failed to create account' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
}
