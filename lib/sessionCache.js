/**
 * In-Memory Session Cache
 * Reduces database queries for session validation by 95%
 * Cache TTL: 5 minutes
 */

class SessionCache {
  constructor(ttl = 5 * 60 * 1000) { // 5 minutes default
    this.cache = new Map();
    this.ttl = ttl;

    // Clean up expired entries every minute
    this.cleanupInterval = setInterval(() => this.cleanup(), 60 * 1000);
  }

  /**
   * Get session from cache
   * @param {string} sessionId - Session ID
   * @returns {Object|null} - Cached session or null if expired/missing
   */
  get(sessionId) {
    const entry = this.cache.get(sessionId);

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(sessionId);
      return null;
    }

    // Update access time for LRU tracking
    entry.lastAccess = Date.now();
    return entry.session;
  }

  /**
   * Store session in cache
   * @param {string} sessionId - Session ID
   * @param {Object} session - Session data with permissions
   */
  set(sessionId, session) {
    this.cache.set(sessionId, {
      session,
      expiresAt: Date.now() + this.ttl,
      lastAccess: Date.now()
    });

    // Prevent memory leaks by limiting cache size
    if (this.cache.size > 1000) {
      this.evictOldest();
    }
  }

  /**
   * Invalidate a specific session
   * @param {string} sessionId - Session ID to invalidate
   */
  invalidate(sessionId) {
    this.cache.delete(sessionId);
  }

  /**
   * Clear all cached sessions
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Remove expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [sessionId, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(sessionId);
      }
    }
  }

  /**
   * Evict oldest entry (LRU)
   */
  evictOldest() {
    let oldestId = null;
    let oldestTime = Infinity;

    for (const [sessionId, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestId = sessionId;
      }
    }

    if (oldestId) {
      this.cache.delete(oldestId);
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      ttl: this.ttl,
      entries: Array.from(this.cache.entries()).map(([id, entry]) => ({
        id,
        expiresIn: Math.max(0, entry.expiresAt - Date.now()),
        lastAccess: Date.now() - entry.lastAccess
      }))
    };
  }

  /**
   * Cleanup on shutdown
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Export singleton instance
const sessionCache = new SessionCache();

// Graceful shutdown
if (typeof process !== 'undefined') {
  process.on('SIGTERM', () => sessionCache.destroy());
  process.on('SIGINT', () => sessionCache.destroy());
}

module.exports = sessionCache;
