const db = require('./database');

export async function verifyLogin(username, password) {
  return await db.verifyPassword(username, password);
}

export async function createSession(adminId) {
  return await db.createSession(adminId);
}

export async function validateSession(sessionId) {
  return await db.validateSession(sessionId);
}

export async function destroySession(sessionId) {
  return await db.destroySession(sessionId);
}

export async function changePassword(adminId, newPassword) {
  return await db.changePassword(adminId, newPassword);
}

export function getSessionFromCookie(cookieHeader) {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [key, value] = cookie.trim().split('=');
    acc[key] = value;
    return acc;
  }, {});

  return cookies.sessionId || null;
}
