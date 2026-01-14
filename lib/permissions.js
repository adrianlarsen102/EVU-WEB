import { createClient } from '@supabase/supabase-js';
import {
  hasPermissionCached,
  hasAnyPermissionCached,
  hasAllPermissionsCached,
  getUserPermissions as getCachedUserPermissions
} from './permissionCache';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Check if a user has a specific permission (with caching)
 * @param {string} userId - The user's ID
 * @param {string} permission - The permission to check (e.g., 'users.create')
 * @returns {Promise<boolean>} - Whether the user has the permission
 */
export async function hasPermission(userId, permission) {
  // Use cached version for better performance
  return await hasPermissionCached(userId, permission);
}

/**
 * Check if a user has ANY of the specified permissions (with caching)
 * @param {string} userId - The user's ID
 * @param {string[]} permissions - Array of permissions to check
 * @returns {Promise<boolean>} - Whether the user has any of the permissions
 */
export async function hasAnyPermission(userId, permissions) {
  return await hasAnyPermissionCached(userId, permissions);
}

/**
 * Check if a user has ALL of the specified permissions (with caching)
 * @param {string} userId - The user's ID
 * @param {string[]} permissions - Array of permissions to check
 * @returns {Promise<boolean>} - Whether the user has all of the permissions
 */
export async function hasAllPermissions(userId, permissions) {
  return await hasAllPermissionsCached(userId, permissions);
}

/**
 * Get all permissions for a user (with caching)
 * @param {string} userId - The user's ID
 * @returns {Promise<string[]>} - Array of permission strings
 */
export async function getUserPermissions(userId) {
  const perms = await getCachedUserPermissions(userId);
  return perms ? perms.permissions : [];
}

/**
 * Middleware to require a specific permission
 * @param {string} permission - The required permission
 * @returns {Function} - Express-style middleware function
 */
export function requirePermission(permission) {
  return async (req, res, next) => {
    const userId = req.session?.adminId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const allowed = await hasPermission(userId, permission);

    if (!allowed) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Missing required permission: ${permission}`
      });
    }

    next();
  };
}

/**
 * Middleware to require ANY of the specified permissions
 * @param {string[]} permissions - Array of permissions (user needs at least one)
 * @returns {Function} - Express-style middleware function
 */
export function requireAnyPermission(permissions) {
  return async (req, res, next) => {
    const userId = req.session?.adminId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const allowed = await hasAnyPermission(userId, permissions);

    if (!allowed) {
      return res.status(403).json({
        error: 'Forbidden',
        message: `Missing required permissions. Need one of: ${permissions.join(', ')}`
      });
    }

    next();
  };
}

/**
 * Backward compatibility: Check if user is admin (has all permissions)
 * This maintains compatibility with the old is_admin boolean system
 * @param {string} userId - The user's ID
 * @returns {Promise<boolean>} - Whether the user is an admin
 */
export async function isAdmin(userId) {
  try {
    const { data: user } = await supabase
      .from('admins')
      .select('role_id, role:user_roles(name, is_system)')
      .eq('id', userId)
      .single();

    // Check if user has the "Administrator" system role
    return user?.role?.name === 'Administrator' && user?.role?.is_system === true;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}
