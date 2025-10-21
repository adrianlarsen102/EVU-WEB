-- ========================================
-- RBAC (Role-Based Access Control) System
-- Database Setup for EVU-WEB
-- ========================================

-- 1. Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_system BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Add role_id column to admins table
ALTER TABLE admins ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES user_roles(id) ON DELETE SET NULL;

-- 3. Create index on role_id for faster queries
CREATE INDEX IF NOT EXISTS idx_admins_role_id ON admins(role_id);

-- 4. Update the updated_at column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- Initialize Default Roles
-- ========================================

-- Note: After running this SQL, you MUST call the /api/roles/initialize endpoint
-- to create the default system roles. This can be done via:
--
-- POST /api/roles/initialize
--
-- This will create the following default roles:
-- - Administrator: Full system access
-- - Moderator: Forum and support moderation
-- - Support Agent: Handle support tickets
-- - Content Manager: Manage website content
-- - User: Standard user permissions

-- ========================================
-- Migration for Existing Users
-- ========================================

-- After calling /api/roles/initialize, all existing users will be automatically
-- migrated to the new role system:
-- - Users with is_admin=true or role='admin' → Administrator role
-- - Users with is_admin=false or role='user' → User role

-- ========================================
-- Example Queries
-- ========================================

-- View all roles and their permissions
-- SELECT id, name, description, permissions, is_system FROM user_roles ORDER BY created_at;

-- View users and their assigned roles
-- SELECT a.username, a.role, a.is_admin, r.name as role_name, r.permissions
-- FROM admins a
-- LEFT JOIN user_roles r ON a.role_id = r.id
-- ORDER BY a.created_at;

-- Count users per role
-- SELECT r.name, COUNT(a.id) as user_count
-- FROM user_roles r
-- LEFT JOIN admins a ON a.role_id = r.id
-- GROUP BY r.id, r.name
-- ORDER BY user_count DESC;

-- ========================================
-- Permission System Reference
-- ========================================

-- Available permissions (as of latest version):
-- Content Management:
--   - content.view: View site content
--   - content.edit: Edit site content
--
-- User Management:
--   - users.view: View user list
--   - users.create: Create new users
--   - users.edit: Edit user details
--   - users.delete: Delete users
--
-- Role Management:
--   - roles.view: View roles
--   - roles.create: Create new roles
--   - roles.edit: Edit existing roles
--   - roles.delete: Delete roles
--
-- Forum Management:
--   - forum.view: View forum
--   - forum.post: Create forum posts
--   - forum.edit: Edit forum posts
--   - forum.delete: Delete forum posts
--   - forum.moderate: Moderate forum (edit/delete any post)
--
-- Support Tickets:
--   - support.view: View support tickets
--   - support.create: Create support tickets
--   - support.respond: Respond to tickets
--   - support.manage: Manage all tickets
--
-- Dashboard & Analytics:
--   - dashboard.view: View admin dashboard
--   - analytics.view: View analytics and metrics
--
-- System Settings:
--   - settings.view: View system settings
--   - settings.edit: Edit system settings
--
-- Email Settings:
--   - email.view: View email settings
--   - email.edit: Edit email settings
--   - email.send: Send emails

-- ========================================
-- Cleanup/Reset (USE WITH CAUTION!)
-- ========================================

-- To completely reset the RBAC system (THIS WILL DELETE ALL CUSTOM ROLES):
-- DELETE FROM user_roles WHERE is_system = false;
-- UPDATE admins SET role_id = NULL;

-- To remove RBAC entirely and revert to old system:
-- DROP TRIGGER IF EXISTS update_user_roles_updated_at ON user_roles;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- DROP INDEX IF EXISTS idx_admins_role_id;
-- ALTER TABLE admins DROP COLUMN IF EXISTS role_id;
-- DROP TABLE IF EXISTS user_roles;
