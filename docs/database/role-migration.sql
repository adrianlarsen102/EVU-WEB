-- =====================================================
-- EVU Website - User Role System Migration
-- =====================================================
-- Run this SQL in Supabase SQL Editor to add role-based access control
-- This migration adds a proper role system to distinguish admins from regular users

-- =====================================================
-- 1. ADD ROLE COLUMN (if not using is_admin)
-- =====================================================

-- Add role column with enum type
DO $$
BEGIN
  -- Check if role column doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admins' AND column_name = 'role'
  ) THEN
    ALTER TABLE admins ADD COLUMN role TEXT DEFAULT 'user';
  END IF;
END $$;

-- =====================================================
-- 2. MIGRATE EXISTING DATA
-- =====================================================

-- Update existing admins based on is_admin field
UPDATE admins SET role = 'admin' WHERE is_admin = true;
UPDATE admins SET role = 'user' WHERE is_admin = false OR is_admin IS NULL;

-- Set the default admin account to admin role
UPDATE admins SET role = 'admin', is_admin = true
WHERE username = 'admin' AND role != 'admin';

-- =====================================================
-- 3. ADD CONSTRAINTS
-- =====================================================

-- Add check constraint for valid roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_role'
  ) THEN
    ALTER TABLE admins
    ADD CONSTRAINT valid_role CHECK (role IN ('admin', 'user', 'moderator'));
  END IF;
END $$;

-- =====================================================
-- 4. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql;

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id INTEGER)
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role FROM admins WHERE id = user_id;
  RETURN user_role;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. UPDATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================
--
-- What was added:
-- - role column with values: 'admin', 'user', 'moderator'
-- - Check constraint to ensure valid roles
-- - Helper functions for role checking
-- - Indexes for better performance
--
-- Role Hierarchy:
-- - admin: Full access to admin panel and content management
-- - user: Regular website users (profile access only)
-- - moderator: Future feature for limited admin access
--
-- Next steps:
-- 1. Update your application code to use role field
-- 2. Test admin panel access with different roles
-- 3. When creating new users, specify their role
-- =====================================================
