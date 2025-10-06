-- =====================================================
-- Migration: Add User Profile Fields
-- =====================================================
-- Run this if you already have an existing database
-- This adds profile fields to the admins table

-- Add new columns to admins table
ALTER TABLE admins
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Set existing admins as admin users
UPDATE admins SET is_admin = true WHERE is_admin IS NULL OR is_admin = false;

-- =====================================================
-- Migration Complete!
-- =====================================================
-- Now users can:
-- - Set their email, display name, avatar, and bio
-- - Regular users (is_admin=false) can only edit their own profile
-- - Admin users (is_admin=true) can manage all users
-- =====================================================
