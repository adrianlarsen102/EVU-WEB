import { validateSession, getSessionFromCookie } from '../../lib/auth';
import { getAllAdmins, createAdmin, deleteAdmin, updateAdminPassword } from '../../lib/database';

export default async function handler(req, res) {
  // Check authentication
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = sessionId ? await validateSession(sessionId) : null;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    // Get all users
    try {
      const admins = await getAllAdmins();
      res.status(200).json(admins);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  } else if (req.method === 'POST') {
    // Create new user
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const result = await createAdmin(username, password, false);

      if (result.success) {
        res.status(201).json({ success: true, admin: result.admin });
      } else {
        res.status(400).json({ error: result.error || 'Failed to create user' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  } else if (req.method === 'DELETE') {
    // Delete user
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // Prevent deleting yourself
      if (userId === session.adminId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      const result = await deleteAdmin(userId);

      if (result.success) {
        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ error: result.error || 'Failed to delete user' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  } else if (req.method === 'PUT') {
    // Update user password
    try {
      const { userId, newPassword } = req.body;

      if (!userId || !newPassword) {
        return res.status(400).json({ error: 'User ID and new password required' });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const result = await updateAdminPassword(userId, newPassword);

      if (result.success) {
        res.status(200).json({ success: true });
      } else {
        res.status(400).json({ error: result.error || 'Failed to update password' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Failed to update password' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
