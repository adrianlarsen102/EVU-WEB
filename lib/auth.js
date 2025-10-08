const db = require('./database');

export function verifyLogin(username, password) {
  return db.verifyPassword(username, password);
}

export function createSession(adminId) {
  return db.createSession(adminId);
}

export function validateSession(sessionId) {
  return db.validateSession(sessionId);
}

export function destroySession(sessionId) {
  return db.destroySession(sessionId);
}

export function changePassword(adminId, newPassword) {
  return db.changePassword(adminId, newPassword);
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
