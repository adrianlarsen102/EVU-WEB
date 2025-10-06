import { validateSession, getSessionFromCookie } from '../../lib/auth';
import { getAllAdmins, createAdmin, deleteAdmin, updateAdminPassword, updateAdminRole } from '../../lib/database';

export default async function handler(req, res) {
  // Check authentication
  const sessionId = getSessionFromCookie(req.headers.cookie);
  const session = sessionId ? await validateSession(sessionId) : null;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Check if user is admin for write operations
  if (req.method !== 'GET' && !session.isAdmin) {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
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

      const role = req.body.role || 'user';
      const result = await createAdmin(username, password, false, role);

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
    // Update user password or role
    try {
      const { userId, newPassword, role } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' });
      }

      // Update password if provided
      if (newPassword) {
        if (newPassword.length < 8) {
          return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        const result = await updateAdminPassword(userId, newPassword);
        if (!result.success) {
          return res.status(400).json({ error: result.error || 'Failed to update password' });
        }
      }

      // Update role if provided
      if (role) {
        const result = await updateAdminRole(userId, role);
        if (!result.success) {
          return res.status(400).json({ error: result.error || 'Failed to update role' });
        }
      }

      res.status(200).json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
