/**
 * Permission Cache System
 * Caches user permissions to reduce database queries
 * Similar to sessionCache.js but specifically for permissions
 */

import { getSupabaseClient } from './database';

const supabase = getSupabaseClient();

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CLEANUP_INTERVAL = 10 * 60 * 1000; // 10 minutes

// In-memory cache structure
// { userId: { permissions: [...], roleId: '...', expiresAt: timestamp } }
const permissionCache = new Map();

/**
 * Get user permissions from cache or database
 * @param {string} userId - User ID
 * @returns {Promise<{permissions: string[], roleId: string} | null>}
 */
export async function getUserPermissions(userId) {
  if (!userId) return null;

  // Check cache first
  const cached = permissionCache.get(userId);
  if (cached && cached.expiresAt > Date.now()) {
    return {
      permissions: cached.permissions,
      roleId: cached.roleId
    };
  }

  // Cache miss or expired - fetch from database
  try {
    const { data: user } = await supabase
      .from('admins')
      .select('role_id')
      .eq('id', userId)
      .single();

    if (!user || !user.role_id) {
      return null;
    }

    const { data: role } = await supabase
      .from('user_roles')
      .select('permissions')
      .eq('id', user.role_id)
      .single();

    if (!role || !role.permissions) {
      return null;
    }

    // Store in cache
    const cacheEntry = {
      permissions: role.permissions,
      roleId: user.role_id,
      expiresAt: Date.now() + CACHE_TTL
    };
    permissionCache.set(userId, cacheEntry);

    return {
      permissions: role.permissions,
      roleId: user.role_id
    };
  } catch (error) {
    console.error('Permission cache fetch error:', error);
    return null;
  }
}

/**
 * Check if user has a specific permission (with caching)
 * @param {string} userId - User ID
 * @param {string} permission - Permission string (e.g., 'users.edit')
 * @returns {Promise<boolean>}
 */
export async function hasPermissionCached(userId, permission) {
  const userPerms = await getUserPermissions(userId);
  if (!userPerms) return false;

  return userPerms.permissions.includes(permission);
}

/**
 * Check if user has any of the specified permissions (with caching)
 * @param {string} userId - User ID
 * @param {string[]} permissions - Array of permission strings
 * @returns {Promise<boolean>}
 */
export async function hasAnyPermissionCached(userId, permissions) {
  const userPerms = await getUserPermissions(userId);
  if (!userPerms) return false;

  return permissions.some(perm => userPerms.permissions.includes(perm));
}

/**
 * Check if user has all specified permissions (with caching)
 * @param {string} userId - User ID
 * @param {string[]} permissions - Array of permission strings
 * @returns {Promise<boolean>}
 */
export async function hasAllPermissionsCached(userId, permissions) {
  const userPerms = await getUserPermissions(userId);
  if (!userPerms) return false;

  return permissions.every(perm => userPerms.permissions.includes(perm));
}

/**
 * Invalidate permissions cache for a specific user
 * Call this when user's role changes
 * @param {string} userId - User ID
 */
export function invalidateUserPermissions(userId) {
  if (!userId) return;
  permissionCache.delete(userId);
}

/**
 * Invalidate permissions cache for all users with a specific role
 * Call this when a role's permissions are updated
 * @param {string} roleId - Role ID
 */
export function invalidateRolePermissions(roleId) {
  if (!roleId) return;

  // Find all users with this role and invalidate their cache
  for (const [userId, cache] of permissionCache.entries()) {
    if (cache.roleId === roleId) {
      permissionCache.delete(userId);
    }
  }
}

/**
 * Clear entire permission cache
 * Use when making bulk role/permission changes
 */
export function clearPermissionCache() {
  permissionCache.clear();
}

/**
 * Get cache statistics (for monitoring)
 * @returns {Object} Cache stats
 */
export function getPermissionCacheStats() {
  let activeCount = 0;
  let expiredCount = 0;
  const now = Date.now();

  for (const cache of permissionCache.values()) {
    if (cache.expiresAt > now) {
      activeCount++;
    } else {
      expiredCount++;
    }
  }

  return {
    total: permissionCache.size,
    active: activeCount,
    expired: expiredCount,
    ttlMinutes: CACHE_TTL / 60000
  };
}

/**
 * Clean up expired cache entries
 * Runs automatically on interval
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  let cleaned = 0;

  for (const [userId, cache] of permissionCache.entries()) {
    if (cache.expiresAt <= now) {
      permissionCache.delete(userId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`Permission cache cleanup: removed ${cleaned} expired entries`);
  }
}

// Start automatic cleanup
const cleanupTimer = setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL);

// Ensure cleanup stops when process exits (for testing)
if (typeof process !== 'undefined' && process.on) {
  process.on('beforeExit', () => {
    clearInterval(cleanupTimer);
  });
}

// Export for use in other modules
export const permissionCacheInstance = {
  getUserPermissions,
  hasPermissionCached,
  hasAnyPermissionCached,
  hasAllPermissionsCached,
  invalidateUserPermissions,
  invalidateRolePermissions,
  clearPermissionCache,
  getPermissionCacheStats
};
