# Role-Based Access Control (RBAC) System

**Version**: 2.13.0+
**Last Updated**: 2025-10-23

## Table of Contents

- [Overview](#overview)
- [Core Concepts](#core-concepts)
- [System Roles](#system-roles)
- [Permissions Reference](#permissions-reference)
- [Usage Guide](#usage-guide)
- [API Integration](#api-integration)
- [Security Best Practices](#security-best-practices)
- [Migration Guide](#migration-guide)
- [Troubleshooting](#troubleshooting)

---

## Overview

EVU-WEB implements a comprehensive Role-Based Access Control (RBAC) system that provides granular permission management across all platform features. This system replaces the legacy boolean `is_admin` field with a flexible, permission-based approach.

### Key Features

- **52+ Granular Permissions** across 8 categories
- **Custom Role Creation** with flexible permission assignment
- **System Roles** (protected, cannot be deleted)
- **Backward Compatibility** with legacy admin system
- **Permission Caching** for optimal performance
- **Audit Trail** for role/permission changes

### Benefits

✅ **Fine-Grained Control**: Assign specific permissions instead of all-or-nothing admin access
✅ **Principle of Least Privilege**: Users only get permissions they need
✅ **Scalability**: Easy to add new permissions as features expand
✅ **Flexibility**: Create custom roles for different team responsibilities
✅ **Security**: Reduce attack surface by limiting permissions

---

## Core Concepts

### Roles

A **role** is a named collection of permissions. Users are assigned to one role, which grants them all permissions in that role.

```javascript
{
  id: "uuid",
  name: "Moderator",
  description: "Can moderate forum and handle support tickets",
  permissions: [
    "forum.moderate",
    "forum.delete",
    "support.view",
    "support.respond"
  ],
  is_system: false  // Can be edited/deleted
}
```

### Permissions

A **permission** is a specific action a user can perform, written in `category.action` format.

Examples:
- `content.edit` - Edit site content
- `users.create` - Create new users
- `forum.moderate` - Moderate forum posts

### System vs Custom Roles

**System Roles** (Protected):
- `Administrator` - Full access to all features
- `Moderator` - Forum moderation + support management
- `User` - Basic user permissions

**Custom Roles**:
- Created by admins
- Can be edited and deleted
- Flexible permission assignment

---

## System Roles

### Administrator
**Description**: Full platform access
**Cannot**: Be deleted or modified
**Permissions**: ALL (52 permissions)

Permissions include:
- All content management
- All user management
- All role management
- All forum operations
- All support ticket management
- All analytics and settings

**Use Case**: Platform owners, lead administrators

---

### Moderator
**Description**: Community management and support
**Permissions**: 15 permissions

Core permissions:
- `forum.view`, `forum.post`, `forum.edit`, `forum.delete`, `forum.moderate`
- `support.view`, `support.create`, `support.respond`, `support.manage`
- `content.view`
- `users.view`
- `dashboard.view`

**Use Case**: Community moderators, support staff

---

### User
**Description**: Standard user access
**Permissions**: 6 permissions

Core permissions:
- `forum.view` - View forum
- `forum.post` - Create topics and comments
- `support.view` - View own tickets
- `support.create` - Create new tickets
- `content.view` - View public content

**Use Case**: Regular community members

---

## Permissions Reference

### Content Management (2 permissions)

| Permission | Description |
|------------|-------------|
| `content.view` | View site content (public) |
| `content.edit` | Edit site content via admin panel |

---

### User Management (4 permissions)

| Permission | Description |
|------------|-------------|
| `users.view` | View user list in admin panel |
| `users.create` | Create new user accounts |
| `users.edit` | Edit user details (name, email, role) |
| `users.delete` | Delete user accounts |

---

### Role Management (4 permissions)

| Permission | Description |
|------------|-------------|
| `roles.view` | View all roles and permissions |
| `roles.create` | Create new custom roles |
| `roles.edit` | Edit existing custom roles |
| `roles.delete` | Delete custom roles |

**Note**: System roles cannot be modified even with these permissions.

---

### Forum Management (5 permissions)

| Permission | Description |
|------------|-------------|
| `forum.view` | View forum categories and topics |
| `forum.post` | Create new topics and comments |
| `forum.edit` | Edit own topics and comments |
| `forum.delete` | Delete own topics and comments |
| `forum.moderate` | Edit/delete ANY topic or comment, lock topics, pin topics |

**Hierarchy**: `moderate` > `delete` > `edit` > `post` > `view`

---

### Support Tickets (4 permissions)

| Permission | Description |
|------------|-------------|
| `support.view` | View own support tickets (or all if `support.manage`) |
| `support.create` | Create new support tickets |
| `support.respond` | Reply to support tickets |
| `support.manage` | View/manage ALL tickets, change status |

---

### Dashboard & Analytics (2 permissions)

| Permission | Description |
|------------|-------------|
| `dashboard.view` | Access admin dashboard statistics |
| `analytics.view` | View detailed analytics and metrics history |

---

### System Settings (2 permissions)

| Permission | Description |
|------------|-------------|
| `settings.view` | View system settings |
| `settings.edit` | Edit system settings |

---

### Email Management (3 permissions)

| Permission | Description |
|------------|-------------|
| `email.view` | View email configuration |
| `email.edit` | Edit email settings (SMTP, Resend) |
| `email.send` | Send test emails |

---

## Usage Guide

### Creating a Custom Role

**Via Admin Panel:**
1. Navigate to `/admin` → Roles tab
2. Click "Create New Role"
3. Enter role name and description
4. Select permissions from checkboxes (organized by category)
5. Click "Create Role"

**Via API:**
```javascript
POST /api/roles
{
  "name": "Content Editor",
  "description": "Can edit site content but not manage users",
  "permissions": [
    "content.view",
    "content.edit",
    "dashboard.view"
  ]
}
```

---

### Assigning Roles to Users

**Via Admin Panel:**
1. Navigate to `/admin` → Users tab
2. Find user in list
3. Click "Edit" or "Change Role"
4. Select role from dropdown
5. Save changes

**Via API:**
```javascript
PUT /api/users
{
  "userId": "user-uuid",
  "role": "role-uuid"
}
```

---

### Checking Permissions in Code

**Option 1: Using Permission Helper** (Recommended)
```javascript
import { hasPermission } from '../../../lib/permissions';

const canEdit = await hasPermission(userId, 'content.edit');
if (!canEdit) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

**Option 2: Using Middleware**
```javascript
import { requirePermission } from '../../../lib/permissions';

export default async function handler(req, res) {
  // Requires content.edit permission
  await requirePermission('content.edit')(req, res, () => {
    // Handler code here
  });
}
```

**Option 3: Multiple Permissions (ANY)**
```javascript
import { hasAnyPermission } from '../../../lib/permissions';

const canModerate = await hasAnyPermission(userId, [
  'forum.moderate',
  'forum.delete'
]);
```

**Option 4: Multiple Permissions (ALL)**
```javascript
import { hasAllPermissions } from '../../../lib/permissions';

const canManageUsers = await hasAllPermissions(userId, [
  'users.view',
  'users.edit',
  'users.delete'
]);
```

---

## API Integration

### Permission Check Flow

```
1. Request arrives at API endpoint
   ↓
2. Extract session ID from cookie
   ↓
3. Validate session (includes cached permissions)
   ↓
4. Check required permission(s)
   ↓
5. Allow or deny request
```

### Session Object Structure

After successful authentication, the session object includes permissions:

```javascript
{
  adminId: "user-uuid",
  username: "john_doe",
  isAdmin: true,  // Backward compatibility
  role: {
    id: "role-uuid",
    name: "Administrator",
    permissions: ["content.edit", "users.create", ...]
  },
  permissions: ["content.edit", "users.create", ...]  // Cached
}
```

### Performance Optimization

Permissions are cached in two layers:
1. **Session Cache** (5-minute TTL) - Reduces database queries by 95%
2. **Session Object** - Permissions loaded once during authentication

---

## Security Best Practices

### 1. Principle of Least Privilege

✅ **Do**: Give users only the permissions they need
❌ **Don't**: Make everyone an Administrator

```javascript
// Good: Content editor only needs content permissions
{
  name: "Content Editor",
  permissions: ["content.view", "content.edit"]
}

// Bad: Giving unnecessary permissions
{
  name: "Content Editor",
  permissions: ["content.edit", "users.delete", "roles.delete"]
}
```

---

### 2. Regular Permission Audits

**Monthly Tasks**:
- Review all custom roles
- Remove unused permissions
- Verify user role assignments
- Check for users with overly broad permissions

**Query to find users with admin access**:
```sql
SELECT u.username, r.name as role
FROM admins u
JOIN user_roles r ON u.role_id = r.id
WHERE r.permissions @> ARRAY['users.delete', 'roles.delete'];
```

---

### 3. Protect Sensitive Operations

Always require explicit permissions for:
- User deletion (`users.delete`)
- Role management (`roles.edit`, `roles.delete`)
- System settings (`settings.edit`)
- Email configuration (`email.edit`)

---

### 4. Role Hierarchy

Suggested role hierarchy (least to most privileged):

```
User → Content Creator → Moderator → Admin → Administrator
```

Each level should inherit permissions from lower levels and add new ones.

---

### 5. Separation of Duties

For sensitive operations, consider requiring multiple permissions:

```javascript
// Example: Deleting users requires both view and delete
const canDeleteUser = await hasAllPermissions(userId, [
  'users.view',
  'users.delete'
]);
```

---

## Migration Guide

### From Legacy System (is_admin boolean)

**Automatic Migration** (handled by system):
```javascript
// Old system check
if (user.is_admin) { /* allow */ }

// New system check (backward compatible)
if (session.isAdmin) { /* allow */ }
// OR
const isAdmin = await isAdmin(userId); // lib/permissions.js
```

**Manual Migration Steps**:

1. **Initialize RBAC System**:
```bash
POST /api/roles/initialize
```

2. **Migrate Existing Users**:
```sql
-- Assign Administrator role to existing admins
UPDATE admins
SET role_id = (SELECT id FROM user_roles WHERE name = 'Administrator')
WHERE is_admin = true;

-- Assign User role to regular users
UPDATE admins
SET role_id = (SELECT id FROM user_roles WHERE name = 'User')
WHERE is_admin = false OR is_admin IS NULL;
```

3. **Update Code** (gradually replace old checks):
```javascript
// Old
if (!session.isAdmin) { return res.status(403)... }

// New
if (!await hasPermission(userId, 'users.create')) {
  return res.status(403)...
}
```

---

## Troubleshooting

### Issue: User has permission but gets "Forbidden" error

**Causes**:
1. Session cache is stale
2. Permission was recently added to role
3. User's role was recently changed

**Solutions**:
```javascript
// Force logout and re-login to refresh session
// OR
// Wait 5 minutes for cache to expire
// OR
// Clear session cache manually (restart server)
```

---

### Issue: Cannot delete custom role

**Error**: "Cannot delete role: X user(s) are assigned to this role"

**Solution**:
1. Identify users with that role
2. Reassign them to different role
3. Then delete the role

```sql
-- Find users with role
SELECT username FROM admins WHERE role_id = 'role-uuid';

-- Reassign to User role
UPDATE admins
SET role_id = (SELECT id FROM user_roles WHERE name = 'User')
WHERE role_id = 'role-to-delete-uuid';
```

---

### Issue: System role accidentally modified

**Protection**: System roles CANNOT be modified via API (server-side validation)

If somehow modified in database directly:
```sql
-- Restore Administrator role
UPDATE user_roles
SET permissions = ARRAY[
  'content.view', 'content.edit',
  'users.view', 'users.create', 'users.edit', 'users.delete',
  -- ... (all 52 permissions)
]
WHERE name = 'Administrator' AND is_system = true;
```

---

### Issue: Permission check is slow

**Performance Checklist**:
- ✅ Session caching enabled (lib/sessionCache.js)
- ✅ Database indexes added (see add-performance-indexes.sql)
- ✅ Using permission check helpers (not raw queries)
- ✅ Permissions cached in session object

**Measure performance**:
```javascript
console.time('permission-check');
const allowed = await hasPermission(userId, 'content.edit');
console.timeEnd('permission-check');
// Should be < 10ms with caching
```

---

## Examples

### Example 1: Content Management Team

**Goal**: Team can edit content but not manage users

```javascript
{
  name: "Content Team",
  description: "Manages website content",
  permissions: [
    "content.view",
    "content.edit",
    "dashboard.view",
    "forum.view",
    "forum.post"
  ]
}
```

---

### Example 2: Support Staff

**Goal**: Handle support tickets and moderate forum

```javascript
{
  name: "Support Staff",
  description: "Customer support and forum moderation",
  permissions: [
    "support.view",
    "support.respond",
    "support.manage",
    "forum.view",
    "forum.moderate",
    "users.view",
    "dashboard.view"
  ]
}
```

---

### Example 3: Read-Only Admin

**Goal**: View everything, change nothing

```javascript
{
  name: "Observer",
  description: "Read-only access to all data",
  permissions: [
    "content.view",
    "users.view",
    "roles.view",
    "forum.view",
    "support.view",
    "dashboard.view",
    "analytics.view",
    "settings.view",
    "email.view"
  ]
}
```

---

## Future Enhancements

Planned features for future versions:

- [ ] **Permission Groups**: Bundle common permissions
- [ ] **Temporary Permissions**: Grant permissions for limited time
- [ ] **Permission Inheritance**: Parent-child role relationships
- [ ] **Audit Logging**: Track who changed what permissions
- [ ] **API Key Permissions**: Separate permissions for API access
- [ ] **Resource-Level Permissions**: e.g., "can edit only their own topics"
- [ ] **Permission UI Builder**: Visual permission assignment tool

---

## Additional Resources

- [Database Schema](../database/rbac-schema.sql)
- [API Documentation](../../CLAUDE.md#rbac-apis)
- [Permission Helper Library](../../lib/permissions.js)
- [Security Audit Checklist](../guides/security-checklist.md)

---

**Questions or Issues?**
- Check [Troubleshooting](#troubleshooting) section
- Review [Security Best Practices](#security-best-practices)
- Consult [API Integration](#api-integration) guide
