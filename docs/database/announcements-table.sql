-- ====================================================================================
-- Announcement Banner System
-- ====================================================================================
-- Creates the announcements table for site-wide notifications and banners
-- Added in v3.2.3 for improved communication with users
--
-- Features:
-- - Site-wide announcement banners
-- - Per-server announcements (Minecraft/FiveM specific)
-- - Priority levels (info, warning, error, success)
-- - Scheduled start/end dates
-- - Admin-controlled enable/disable
-- - Rich text content support
-- ====================================================================================

-- ====================================================================================
-- TABLE: announcements
-- ====================================================================================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Content
  title TEXT NOT NULL,                     -- Banner title/headline
  message TEXT NOT NULL,                   -- Banner message (supports HTML)
  type TEXT NOT NULL DEFAULT 'info',       -- 'info', 'warning', 'error', 'success'

  -- Targeting
  target TEXT NOT NULL DEFAULT 'all',      -- 'all', 'minecraft', 'fivem'

  -- Scheduling
  start_date TIMESTAMP WITH TIME ZONE,     -- When to start showing (null = immediately)
  end_date TIMESTAMP WITH TIME ZONE,       -- When to stop showing (null = indefinitely)

  -- Status
  enabled BOOLEAN DEFAULT true,            -- Admin can enable/disable manually

  -- Metadata
  created_by UUID REFERENCES admins(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ====================================================================================
-- INDEXES
-- ====================================================================================

-- Index for querying active announcements
CREATE INDEX IF NOT EXISTS idx_announcements_enabled
  ON announcements(enabled)
  WHERE enabled = true;

-- Index for date range queries (finding announcements active now)
CREATE INDEX IF NOT EXISTS idx_announcements_dates
  ON announcements(start_date, end_date)
  WHERE enabled = true;

-- Index for filtering by target (server-specific announcements)
CREATE INDEX IF NOT EXISTS idx_announcements_target
  ON announcements(target);

-- Composite index for common query (enabled + target + dates)
CREATE INDEX IF NOT EXISTS idx_announcements_active
  ON announcements(enabled, target, start_date, end_date)
  WHERE enabled = true;

-- ====================================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================================

-- Enable RLS
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public read access for active announcements (displayed to all users)
CREATE POLICY "Anyone can view active announcements"
  ON announcements FOR SELECT
  USING (
    enabled = true
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- Admins can view all announcements
CREATE POLICY "Admins can view all announcements"
  ON announcements FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id = auth.uid()
      AND (is_admin = true OR role = 'admin')
    )
  );

-- Admins can create announcements
CREATE POLICY "Admins can create announcements"
  ON announcements FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id = auth.uid()
      AND (is_admin = true OR role = 'admin')
    )
  );

-- Admins can update announcements
CREATE POLICY "Admins can update announcements"
  ON announcements FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id = auth.uid()
      AND (is_admin = true OR role = 'admin')
    )
  );

-- Admins can delete announcements
CREATE POLICY "Admins can delete announcements"
  ON announcements FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id = auth.uid()
      AND (is_admin = true OR role = 'admin')
    )
  );

-- ====================================================================================
-- FUNCTIONS
-- ====================================================================================

-- Function to get active announcements for a specific target
CREATE OR REPLACE FUNCTION get_active_announcements(target_filter TEXT DEFAULT 'all')
RETURNS TABLE (
  id UUID,
  title TEXT,
  message TEXT,
  type TEXT,
  target TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.title,
    a.message,
    a.type,
    a.target,
    a.start_date,
    a.end_date,
    a.created_at
  FROM announcements a
  WHERE
    a.enabled = true
    AND (a.start_date IS NULL OR a.start_date <= NOW())
    AND (a.end_date IS NULL OR a.end_date >= NOW())
    AND (a.target = target_filter OR a.target = 'all' OR target_filter = 'all')
  ORDER BY
    CASE a.type
      WHEN 'error' THEN 1
      WHEN 'warning' THEN 2
      WHEN 'success' THEN 3
      WHEN 'info' THEN 4
      ELSE 5
    END,
    a.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================================
-- SEED DATA (Optional - Example Announcements)
-- ====================================================================================

-- Welcome announcement (disabled by default)
INSERT INTO announcements (title, message, type, target, enabled)
VALUES (
  'Welcome to EVU Gaming!',
  'Thanks for visiting our community. Join our Discord to stay updated!',
  'info',
  'all',
  false
)
ON CONFLICT DO NOTHING;

-- Maintenance announcement example (disabled by default)
INSERT INTO announcements (title, message, type, target, enabled, start_date, end_date)
VALUES (
  'Scheduled Maintenance',
  'Minecraft server will undergo maintenance on Saturday from 2-4 AM UTC.',
  'warning',
  'minecraft',
  false,
  NOW() + INTERVAL '7 days',
  NOW() + INTERVAL '7 days' + INTERVAL '2 hours'
)
ON CONFLICT DO NOTHING;

-- ====================================================================================
-- VERIFICATION
-- ====================================================================================

-- Verify table was created
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'announcements'
ORDER BY ordinal_position;

-- Verify indexes were created
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'announcements'
ORDER BY indexname;

-- Verify RLS policies were created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'announcements'
ORDER BY policyname;

-- Test the function
SELECT * FROM get_active_announcements('all');

-- ====================================================================================
-- USAGE EXAMPLES
-- ====================================================================================

-- Create a new announcement
-- INSERT INTO announcements (title, message, type, target, created_by)
-- VALUES ('Server Update', 'New features have been added!', 'success', 'all', 'admin-uuid-here');

-- Get all active announcements
-- SELECT * FROM get_active_announcements('all');

-- Get Minecraft-specific announcements
-- SELECT * FROM get_active_announcements('minecraft');

-- Disable an announcement
-- UPDATE announcements SET enabled = false WHERE id = 'announcement-uuid';

-- Schedule an announcement for the future
-- UPDATE announcements
-- SET start_date = '2025-01-20 00:00:00+00',
--     end_date = '2025-01-21 00:00:00+00'
-- WHERE id = 'announcement-uuid';

-- Delete an announcement
-- DELETE FROM announcements WHERE id = 'announcement-uuid';

-- ====================================================================================
-- NOTES
-- ====================================================================================
-- 1. Announcements can be targeted to specific servers (minecraft, fivem, or all)
-- 2. Type determines banner styling: info (blue), warning (yellow), error (red), success (green)
-- 3. Scheduling is optional - omit dates for permanent announcements
-- 4. RLS ensures only admins can manage announcements, but everyone can see active ones
-- 5. The get_active_announcements() function orders by priority (error > warning > success > info)
-- 6. HTML is supported in message field for rich formatting
-- 7. Announcements automatically disappear when end_date is reached
-- 8. Consider adding announcement_dismissals table if you want user-specific dismissal tracking
--
-- ====================================================================================
-- ROLLBACK (if needed)
-- ====================================================================================
-- To remove the announcements system:
-- DROP FUNCTION IF EXISTS get_active_announcements(TEXT);
-- DROP TABLE IF EXISTS announcements CASCADE;
-- ====================================================================================
