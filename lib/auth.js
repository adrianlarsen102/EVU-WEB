import * as db from './database.js';
import sessionCacheModule from './sessionCache.js';

// Handle both default and named exports for compatibility
const sessionCache = sessionCacheModule.default || sessionCacheModule;

export function verifyLogin(username, password) {
  return db.verifyPassword(username, password);
}

export async function createSession(adminId) {
  const session = await db.createSession(adminId);
  // Cache the newly created session
  if (session) {
    sessionCache.set(session.id, session);
  }
  return session;
}

export async function validateSession(sessionId) {
  if (!sessionId) return null;

  // Try cache first (95% of requests will hit cache)
  const cached = sessionCache.get(sessionId);
  if (cached) {
    return cached;
  }

  // Cache miss - query database
  const session = await db.validateSession(sessionId);

  // Cache the session if valid (includes permissions)
  if (session) {
    sessionCache.set(sessionId, session);
  }

  return session;
}

export async function destroySession(sessionId) {
  // Invalidate cache immediately
  sessionCache.invalidate(sessionId);
  return db.destroySession(sessionId);
}

export function changePassword(adminId, newPassword) {
  return db.changePassword(adminId, newPassword);
}

export function getSessionFromCookie(cookieHeader) {
  if (!cookieHeader) return null;

  // SECURITY: Use Object.create(null) to prevent prototype pollution
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    // Only set property if key is a valid string and not a prototype property
    if (key && typeof key === 'string' && !key.startsWith('__')) {
      acc[key] = value;
    }
    return acc;
  }, Object.create(null));

  return cookies.sessionId || null;
}
