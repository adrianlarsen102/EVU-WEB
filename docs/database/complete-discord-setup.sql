-- Complete Discord Webhook Setup Script
-- Run this in Supabase SQL Editor to set up Discord notifications

-- ============================================
-- 1. CREATE discord_settings TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS discord_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  enabled BOOLEAN DEFAULT FALSE,
  webhook_url TEXT,
  bot_avatar_url TEXT,
  event_config JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default row
INSERT INTO discord_settings (id, enabled)
VALUES (1, FALSE)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE discord_settings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to view discord settings" ON discord_settings;
DROP POLICY IF EXISTS "Allow admins to update discord settings" ON discord_settings;
DROP POLICY IF EXISTS "Allow insert discord settings" ON discord_settings;

-- Policy: Anyone can view (backend will handle auth)
CREATE POLICY "Allow authenticated users to view discord settings"
  ON discord_settings FOR SELECT
  USING (true);

-- Policy: Anyone can update (backend will handle auth)
CREATE POLICY "Allow admins to update discord settings"
  ON discord_settings FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Policy: Allow insert (for upsert operations)
CREATE POLICY "Allow insert discord settings"
  ON discord_settings FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 3. CREATE TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION update_discord_settings_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================
-- 4. CREATE TRIGGER
-- ============================================
DROP TRIGGER IF EXISTS discord_settings_updated_at ON discord_settings;
CREATE TRIGGER discord_settings_updated_at
  BEFORE UPDATE ON discord_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_discord_settings_timestamp();

-- ============================================
-- 5. VERIFICATION QUERIES
-- ============================================

-- Check if table was created
SELECT
  'discord_settings table exists' AS status,
  COUNT(*) AS row_count
FROM discord_settings;

-- Show table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'discord_settings'
ORDER BY ordinal_position;

-- Show RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'discord_settings';

-- Show current settings
SELECT * FROM discord_settings;
