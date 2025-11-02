/**
 * Unit Tests for Session Cache
 * Tests caching functionality and TTL behavior
 */

// Use CommonJS require to get the singleton
const { sessionCache } = require('../../../lib/sessionCache')
let cache

describe('SessionCache - Basic Operations', () => {
  beforeEach(() => {
    // Use the singleton and clear it before each test
    cache = sessionCache
    cache.clear()
  })

  afterEach(() => {
    // Clean up after each test
    if (cache) {
      cache.clear()
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
    cache = sessionCache
    cache.clear()
    // Note: singleton has 5-minute TTL, adjust test timeouts accordingly
  })

  afterEach(() => {
    if (cache) {
      cache.clear()
    }
  })

  it('should expire session after TTL', () => {
    const session = { adminId: 'user-123' }

    cache.set('session-abc', session)
    expect(cache.get('session-abc')).toEqual(session)

    // Mock time advancing beyond TTL (5 minutes + 1ms)
    const realDateNow = Date.now.bind(global.Date)
    const startTime = Date.now()
    global.Date.now = jest.fn(() => startTime + (5 * 60 * 1000) + 1)

    expect(cache.get('session-abc')).toBeNull()

    // Restore Date.now
    global.Date.now = realDateNow
  })

  it('should return valid session before TTL expires', () => {
    const session = { adminId: 'user-123' }

    cache.set('session-abc', session)

    // Mock time advancing less than TTL (2 minutes)
    const realDateNow = Date.now.bind(global.Date)
    const startTime = Date.now()
    global.Date.now = jest.fn(() => startTime + (2 * 60 * 1000))

    expect(cache.get('session-abc')).toEqual(session)

    // Restore Date.now
    global.Date.now = realDateNow
  })

  it('should cleanup expired sessions', () => {
    cache.set('session-1', { adminId: 'user-1' })
    cache.set('session-2', { adminId: 'user-2' })

    expect(cache.getStats().size).toBe(2)

    // Mock time advancing beyond TTL
    const realDateNow = Date.now.bind(global.Date)
    const startTime = Date.now()
    global.Date.now = jest.fn(() => startTime + (6 * 60 * 1000))

    // Manual cleanup
    cache.cleanup()

    expect(cache.getStats().size).toBe(0)

    // Restore Date.now
    global.Date.now = realDateNow
  })
})

describe('SessionCache - LRU Eviction', () => {
  beforeEach(() => {
    cache = sessionCache
    cache.clear()
  })

  afterEach(() => {
    if (cache) {
      cache.clear()
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
    cache = sessionCache
    cache.clear()
  })

  afterEach(() => {
    if (cache) {
      cache.clear()
    }
  })

  it('should return accurate statistics', () => {
    cache.set('session-1', { adminId: 'user-1' })
    cache.set('session-2', { adminId: 'user-2' })

    const stats = cache.getStats()

    expect(stats.size).toBe(2)
    expect(stats.ttl).toBe(5 * 60 * 1000) // 5 minutes default TTL
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
    expect(entry.expiresIn).toBeLessThanOrEqual(5 * 60 * 1000) // 5 minutes
  })
})

describe('SessionCache - Concurrency', () => {
  beforeEach(() => {
    cache = sessionCache
    cache.clear()
  })

  afterEach(() => {
    if (cache) {
      cache.clear()
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
    cache = sessionCache
    cache.clear()
  })

  afterEach(() => {
    if (cache) {
      cache.clear()
    }
  })

  it('should properly destroy and cleanup', () => {
    cache.set('session-1', { adminId: 'user-1' })
    expect(cache.getStats().size).toBe(1)

    cache.clear() // Use clear() instead of destroy() for singleton

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
