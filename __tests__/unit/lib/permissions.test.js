/**
 * Unit Tests for RBAC Permission System
 * Tests all permission checking functions and helpers
 */

import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getUserPermissions,
  isAdmin
} from '../../../lib/permissions'

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn()
        }))
      }))
    }))
  }))
}))

const { createClient } = require('@supabase/supabase-js')

describe('Permission System - hasPermission', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return true when user has the permission', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        role: {
          permissions: ['content.edit', 'users.view', 'forum.moderate']
        }
      },
      error: null
    })

    const result = await hasPermission('user-123', 'content.edit')
    expect(result).toBe(true)
  })

  it('should return false when user does not have the permission', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        role: {
          permissions: ['content.view', 'users.view']
        }
      },
      error: null
    })

    const result = await hasPermission('user-123', 'content.edit')
    expect(result).toBe(false)
  })

  it('should return false when user has no role', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: null,
      error: null
    })

    const result = await hasPermission('user-123', 'content.edit')
    expect(result).toBe(false)
  })

  it('should return false when role has no permissions', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        role: {
          permissions: null
        }
      },
      error: null
    })

    const result = await hasPermission('user-123', 'content.edit')
    expect(result).toBe(false)
  })

  it('should handle database errors gracefully', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockRejectedValue(
      new Error('Database connection failed')
    )

    const result = await hasPermission('user-123', 'content.edit')
    expect(result).toBe(false)
  })
})

describe('Permission System - hasAnyPermission', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return true when user has at least one permission', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        role: {
          permissions: ['content.view', 'forum.post']
        }
      },
      error: null
    })

    const result = await hasAnyPermission('user-123', [
      'content.edit',
      'forum.post',
      'users.delete'
    ])
    expect(result).toBe(true)
  })

  it('should return false when user has none of the permissions', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        role: {
          permissions: ['content.view']
        }
      },
      error: null
    })

    const result = await hasAnyPermission('user-123', [
      'content.edit',
      'users.delete'
    ])
    expect(result).toBe(false)
  })

  it('should handle empty permission array', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        role: {
          permissions: ['content.edit']
        }
      },
      error: null
    })

    const result = await hasAnyPermission('user-123', [])
    expect(result).toBe(false)
  })
})

describe('Permission System - hasAllPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return true when user has all permissions', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        role: {
          permissions: [
            'content.view',
            'content.edit',
            'users.view',
            'users.create'
          ]
        }
      },
      error: null
    })

    const result = await hasAllPermissions('user-123', [
      'content.view',
      'content.edit',
      'users.view'
    ])
    expect(result).toBe(true)
  })

  it('should return false when user is missing one permission', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        role: {
          permissions: ['content.view', 'content.edit']
        }
      },
      error: null
    })

    const result = await hasAllPermissions('user-123', [
      'content.view',
      'content.edit',
      'users.delete'
    ])
    expect(result).toBe(false)
  })

  it('should return true for empty permission array', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        role: {
          permissions: ['content.edit']
        }
      },
      error: null
    })

    const result = await hasAllPermissions('user-123', [])
    expect(result).toBe(true)
  })
})

describe('Permission System - getUserPermissions', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return array of permissions', async () => {
    const mockSupabase = createClient()
    const permissions = ['content.view', 'content.edit', 'forum.post']

    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        role: {
          permissions
        }
      },
      error: null
    })

    const result = await getUserPermissions('user-123')
    expect(result).toEqual(permissions)
  })

  it('should return empty array when user has no permissions', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        role: {
          permissions: null
        }
      },
      error: null
    })

    const result = await getUserPermissions('user-123')
    expect(result).toEqual([])
  })

  it('should return empty array on database error', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockRejectedValue(
      new Error('Database error')
    )

    const result = await getUserPermissions('user-123')
    expect(result).toEqual([])
  })
})

describe('Permission System - isAdmin', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return true for Administrator system role', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        role: {
          name: 'Administrator',
          is_system: true
        }
      },
      error: null
    })

    const result = await isAdmin('user-123')
    expect(result).toBe(true)
  })

  it('should return false for non-admin system role', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        role: {
          name: 'Moderator',
          is_system: true
        }
      },
      error: null
    })

    const result = await isAdmin('user-123')
    expect(result).toBe(false)
  })

  it('should return false for custom admin-named role', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        role: {
          name: 'Administrator',
          is_system: false  // Not a system role
        }
      },
      error: null
    })

    const result = await isAdmin('user-123')
    expect(result).toBe(false)
  })

  it('should return false when user has no role', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: null,
      error: null
    })

    const result = await isAdmin('user-123')
    expect(result).toBe(false)
  })
})

describe('Permission System - Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should handle case-sensitive permission names', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        role: {
          permissions: ['content.edit']
        }
      },
      error: null
    })

    const result = await hasPermission('user-123', 'Content.Edit')
    expect(result).toBe(false)  // Should be case-sensitive
  })

  it('should handle wildcard-like permissions strictly', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        role: {
          permissions: ['content.*']
        }
      },
      error: null
    })

    const result = await hasPermission('user-123', 'content.edit')
    expect(result).toBe(false)  // No wildcard support currently
  })

  it('should handle duplicate permissions in role', async () => {
    const mockSupabase = createClient()
    mockSupabase.from().select().eq().single.mockResolvedValue({
      data: {
        role: {
          permissions: ['content.edit', 'content.edit', 'content.edit']
        }
      },
      error: null
    })

    const result = await hasPermission('user-123', 'content.edit')
    expect(result).toBe(true)
  })
})
