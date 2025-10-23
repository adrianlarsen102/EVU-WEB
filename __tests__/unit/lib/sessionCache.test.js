/**
 * Unit Tests for Session Cache
 * Tests caching functionality and TTL behavior
 */

const SessionCache = require('../../../lib/sessionCache')

// Create fresh instance for each test
let cache

describe('SessionCache - Basic Operations', () => {
  beforeEach(() => {
    // Create new cache with 100ms TTL for faster tests
    cache = new (require('../../../lib/sessionCache').constructor)(100)
  })

  afterEach(() => {
    if (cache) {
      cache.destroy()
    }
  })

  it('should store and retrieve session', () => {
    const session = {
      adminId: 'user-123',
      username: 'testuser',
      permissions: ['content.edit']
    }

    cache.set('session-abc', session)
    const retrieved = cache.get('session-abc')

    expect(retrieved).toEqual(session)
  })

  it('should return null for non-existent session', () => {
    const retrieved = cache.get('non-existent')
    expect(retrieved).toBeNull()
  })

  it('should invalidate specific session', () => {
    const session = { adminId: 'user-123' }

    cache.set('session-abc', session)
    expect(cache.get('session-abc')).toEqual(session)

    cache.invalidate('session-abc')
    expect(cache.get('session-abc')).toBeNull()
  })

  it('should clear all sessions', () => {
    cache.set('session-1', { adminId: 'user-1' })
    cache.set('session-2', { adminId: 'user-2' })

    expect(cache.getStats().size).toBe(2)

    cache.clear()
    expect(cache.getStats().size).toBe(0)
  })
})

describe('SessionCache - TTL Expiration', () => {
  beforeEach(() => {
    cache = new (require('../../../lib/sessionCache').constructor)(100) // 100ms TTL
  })

  afterEach(() => {
    if (cache) {
      cache.destroy()
    }
  })

  it('should expire session after TTL', async () => {
    const session = { adminId: 'user-123' }

    cache.set('session-abc', session)
    expect(cache.get('session-abc')).toEqual(session)

    // Wait for TTL to expire
    await new Promise(resolve => setTimeout(resolve, 150))

    expect(cache.get('session-abc')).toBeNull()
  })

  it('should return valid session before TTL expires', async () => {
    const session = { adminId: 'user-123' }

    cache.set('session-abc', session)

    // Wait less than TTL
    await new Promise(resolve => setTimeout(resolve, 50))

    expect(cache.get('session-abc')).toEqual(session)
  })

  it('should cleanup expired sessions', async () => {
    cache.set('session-1', { adminId: 'user-1' })
    cache.set('session-2', { adminId: 'user-2' })

    expect(cache.getStats().size).toBe(2)

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150))

    // Manual cleanup
    cache.cleanup()

    expect(cache.getStats().size).toBe(0)
  })
})

describe('SessionCache - LRU Eviction', () => {
  beforeEach(() => {
    cache = new (require('../../../lib/sessionCache').constructor)(5000)
  })

  afterEach(() => {
    if (cache) {
      cache.destroy()
    }
  })

  it('should evict oldest entry when cache is full', () => {
    // Fill cache to 1000 entries (max size)
    for (let i = 0; i < 1001; i++) {
      cache.set(`session-${i}`, { adminId: `user-${i}` })
    }

    // Cache should have evicted the oldest entry
    expect(cache.getStats().size).toBeLessThanOrEqual(1000)
  })

  it('should update lastAccess on get', () => {
    cache.set('session-1', { adminId: 'user-1' })

    // Get the session twice
    cache.get('session-1')
    const stats1 = cache.getStats()

    // Wait a bit
    setTimeout(() => {
      cache.get('session-1')
      const stats2 = cache.getStats()

      // lastAccess should be updated
      expect(stats2.entries[0].lastAccess).toBeLessThan(stats1.entries[0].lastAccess)
    }, 50)
  })
})

describe('SessionCache - Statistics', () => {
  beforeEach(() => {
    cache = new (require('../../../lib/sessionCache').constructor)(5000)
  })

  afterEach(() => {
    if (cache) {
      cache.destroy()
    }
  })

  it('should return accurate statistics', () => {
    cache.set('session-1', { adminId: 'user-1' })
    cache.set('session-2', { adminId: 'user-2' })

    const stats = cache.getStats()

    expect(stats.size).toBe(2)
    expect(stats.ttl).toBe(5000)
    expect(stats.entries).toHaveLength(2)
    expect(stats.entries[0]).toHaveProperty('id')
    expect(stats.entries[0]).toHaveProperty('expiresIn')
    expect(stats.entries[0]).toHaveProperty('lastAccess')
  })

  it('should show remaining TTL in stats', () => {
    cache.set('session-1', { adminId: 'user-1' })

    const stats = cache.getStats()
    const entry = stats.entries.find(e => e.id === 'session-1')

    expect(entry.expiresIn).toBeGreaterThan(0)
    expect(entry.expiresIn).toBeLessThanOrEqual(5000)
  })
})

describe('SessionCache - Concurrency', () => {
  beforeEach(() => {
    cache = new (require('../../../lib/sessionCache').constructor)(5000)
  })

  afterEach(() => {
    if (cache) {
      cache.destroy()
    }
  })

  it('should handle concurrent sets', () => {
    const promises = []

    for (let i = 0; i < 100; i++) {
      promises.push(
        Promise.resolve().then(() => {
          cache.set(`session-${i}`, { adminId: `user-${i}` })
        })
      )
    }

    return Promise.all(promises).then(() => {
      expect(cache.getStats().size).toBe(100)
    })
  })

  it('should handle concurrent gets', () => {
    cache.set('session-1', { adminId: 'user-1' })

    const promises = []

    for (let i = 0; i < 100; i++) {
      promises.push(
        Promise.resolve().then(() => cache.get('session-1'))
      )
    }

    return Promise.all(promises).then(results => {
      expect(results.every(r => r.adminId === 'user-1')).toBe(true)
    })
  })
})

describe('SessionCache - Memory Management', () => {
  beforeEach(() => {
    cache = new (require('../../../lib/sessionCache').constructor)(5000)
  })

  afterEach(() => {
    if (cache) {
      cache.destroy()
    }
  })

  it('should properly destroy and cleanup', () => {
    cache.set('session-1', { adminId: 'user-1' })
    expect(cache.getStats().size).toBe(1)

    cache.destroy()

    expect(cache.getStats().size).toBe(0)
  })

  it('should not leak memory on repeated set/get', () => {
    const initialMemory = process.memoryUsage().heapUsed

    // Perform many operations
    for (let i = 0; i < 10000; i++) {
      cache.set(`session-${i % 100}`, { adminId: `user-${i}` })
      cache.get(`session-${i % 100}`)
    }

    const finalMemory = process.memoryUsage().heapUsed
    const memoryIncrease = finalMemory - initialMemory

    // Memory increase should be reasonable (less than 10MB for this test)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
  })
})
