-- EVU-WEB Master Database Schema
-- Auto-generated consolidated schema

-- ============================================
-- Source: docs/database/complete-migration-2025.sql
-- ============================================

-- ============================================
-- EVU-WEB Complete Database Migration Script
-- Date: October 2025
-- Version: 2.8.0+
-- ============================================
-- This script contains ALL database schema updates
-- Run this on a fresh Supabase instance to get up to date
-- ============================================

-- ============================================
-- 1. ADMINS TABLE (Core Authentication)
-- ============================================

CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_default_password BOOLEAN DEFAULT true,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  is_admin BOOLEAN DEFAULT false, -- Deprecated, use 'role' instead
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- User Profile Fields
  display_name TEXT,
  email TEXT,
  bio TEXT,
  avatar_url TEXT
);

-- Index for faster username lookups
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);

-- ============================================
-- 2. SESSIONS TABLE (Authentication)
-- ============================================

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  admin_id UUID REFERENCES admins(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster session lookups
CREATE INDEX IF NOT EXISTS idx_sessions_admin_id ON sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);

-- ============================================
-- 3. SITE_CONTENT TABLE (CMS Content)
-- ============================================

CREATE TABLE IF NOT EXISTS site_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Ensure only one row exists
INSERT INTO site_content (id, content)
VALUES (1, '{}')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. FORUM TABLES (Community Forum)
-- ============================================

-- Forum Topics Table
CREATE TABLE IF NOT EXISTS forum_topics (
  id SERIAL PRIMARY KEY,
  category_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  author_username TEXT NOT NULL,
  view_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for forum topics
CREATE INDEX IF NOT EXISTS idx_forum_topics_category ON forum_topics(category_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_author ON forum_topics(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_topics_created ON forum_topics(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_topics_pinned ON forum_topics(is_pinned, created_at DESC);

-- Forum Comments Table
CREATE TABLE IF NOT EXISTS forum_comments (
  id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES forum_topics(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  author_username TEXT NOT NULL,
  is_deleted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for forum comments
CREATE INDEX IF NOT EXISTS idx_forum_comments_topic ON forum_comments(topic_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_author ON forum_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_forum_comments_created ON forum_comments(created_at);

-- Drop and recreate function to avoid return type conflicts
DROP FUNCTION IF EXISTS increment_view_count(INTEGER);

-- Function to increment view count (for performance)
CREATE FUNCTION increment_view_count(topic_id INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE forum_topics
  SET view_count = view_count + 1
  WHERE id = topic_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. SUPPORT TICKETS SYSTEM
-- ============================================

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS support_tickets (
  id SERIAL PRIMARY KEY,
  ticket_number INTEGER UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'closed')),
  author_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  author_username TEXT NOT NULL,
  author_email TEXT,
  assigned_to UUID REFERENCES admins(id) ON DELETE SET NULL,
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- Indexes for support tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_number ON support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_author ON support_tickets(author_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created ON support_tickets(created_at DESC);

-- Support Ticket Replies Table
CREATE TABLE IF NOT EXISTS support_ticket_replies (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES support_tickets(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_id UUID REFERENCES admins(id) ON DELETE SET NULL,
  author_username TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for ticket replies
CREATE INDEX IF NOT EXISTS idx_ticket_replies_ticket ON support_ticket_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_replies_created ON support_ticket_replies(created_at);

-- Sequence for ticket numbers
CREATE SEQUENCE IF NOT EXISTS ticket_number_seq START 1000;

-- Drop existing function if it exists with wrong return type
DROP FUNCTION IF EXISTS generate_ticket_number();

-- Function to generate ticket numbers
CREATE FUNCTION generate_ticket_number()
RETURNS INTEGER AS $$
BEGIN
  RETURN nextval('ticket_number_seq');
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. EMAIL SETTINGS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS email_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  provider TEXT NOT NULL DEFAULT 'resend' CHECK (provider IN ('resend', 'smtp')),
  enabled BOOLEAN DEFAULT false,
  resend_api_key TEXT,
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_user TEXT,
  smtp_pass TEXT,
  smtp_secure BOOLEAN DEFAULT false,
  email_from TEXT DEFAULT 'noreply@yourdomain.com',
  admin_email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT single_email_settings CHECK (id = 1)
);

-- Ensure only one row exists
INSERT INTO email_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Note: RLS is typically managed through Supabase dashboard
-- These are example policies - adjust based on your security needs

-- Enable RLS on all tables
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS
-- (This is done automatically by Supabase for service_role key)

-- ============================================
-- 8. FUNCTIONS AND TRIGGERS
-- ============================================

-- Drop and recreate function to avoid conflicts
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Auto-update updated_at timestamp
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at
  BEFORE UPDATE ON admins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_forum_topics_updated_at ON forum_topics;
CREATE TRIGGER update_forum_topics_updated_at
  BEFORE UPDATE ON forum_topics
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_forum_comments_updated_at ON forum_comments;
CREATE TRIGGER update_forum_comments_updated_at
  BEFORE UPDATE ON forum_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_support_tickets_updated_at ON support_tickets;
CREATE TRIGGER update_support_tickets_updated_at
  BEFORE UPDATE ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_email_settings_updated_at ON email_settings;
CREATE TRIGGER update_email_settings_updated_at
  BEFORE UPDATE ON email_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- Drop and recreate cleanup function
DROP FUNCTION IF EXISTS cleanup_expired_sessions();

-- Function to cleanup expired sessions (run periodically)
CREATE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM sessions WHERE expires_at < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================

-- Verify tables exist
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN (
    'admins', 'sessions', 'site_content',
    'forum_topics', 'forum_comments',
    'support_tickets', 'support_ticket_replies',
    'email_settings'
  );

  RAISE NOTICE 'Migration complete. % tables verified.', table_count;
END $$;


-- ============================================
-- Source: scripts/create-error-logs-table.sql
-- ============================================

-- Create error_logs table for application error tracking
-- Separate from audit_logs to keep security events separate from errors

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id TEXT,
  endpoint TEXT,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  notes TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_endpoint ON error_logs(endpoint);

-- Enable Row Level Security
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admin users can read all error logs
CREATE POLICY "Admins can read error_logs"
  ON error_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id::text = auth.uid()::text
      AND (is_admin = true OR role = 'admin')
    )
  );

-- Policy: System can insert error logs
CREATE POLICY "System can insert error_logs"
  ON error_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can update error logs (for marking as resolved)
CREATE POLICY "Admins can update error_logs"
  ON error_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id::text = auth.uid()::text
      AND (is_admin = true OR role = 'admin')
    )
  );

COMMENT ON TABLE error_logs IS 'Application error logs for debugging and monitoring';
COMMENT ON COLUMN error_logs.error_type IS 'Type of error (API_ERROR, DATABASE_ERROR, etc.)';
COMMENT ON COLUMN error_logs.message IS 'Human-readable error message';
COMMENT ON COLUMN error_logs.details IS 'Additional error details (stack trace, context, etc.)';
COMMENT ON COLUMN error_logs.severity IS 'Error severity level: low, medium, high, critical';
COMMENT ON COLUMN error_logs.resolved IS 'Whether the error has been acknowledged/fixed';
COMMENT ON COLUMN error_logs.resolved_by IS 'Admin user ID who marked error as resolved';
COMMENT ON COLUMN error_logs.notes IS 'Admin notes about the error resolution';


-- ============================================
-- Source: docs/database/audit-logs-setup.sql
-- ============================================

-- Audit Logs Table Setup
-- Tracks all administrative actions for security and compliance
-- Run this SQL in your Supabase SQL editor

-- Note: First check your admins table ID type
-- Run: SELECT data_type FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'id';
-- If it returns 'uuid', use UUID. If 'integer', use the version below.

-- Create audit_logs table (using TEXT for user_id to be compatible with both)
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id TEXT,  -- TEXT to support both UUID and INTEGER from admins table
  metadata JSONB DEFAULT '{}'::jsonb,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);

-- Add comments to table and columns
COMMENT ON TABLE audit_logs IS 'Audit log of all administrative actions for security and compliance';
COMMENT ON COLUMN audit_logs.id IS 'Unique identifier for the audit log entry';
COMMENT ON COLUMN audit_logs.event_type IS 'Type of event (e.g., USER_CREATED, CONTENT_UPDATED)';
COMMENT ON COLUMN audit_logs.user_id IS 'ID of the user who performed the action';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context data about the event (JSON)';
COMMENT ON COLUMN audit_logs.severity IS 'Severity level: info, warning, error, critical';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the request';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent string from the request';
COMMENT ON COLUMN audit_logs.timestamp IS 'When the event occurred';

-- Enable Row Level Security (RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- IMPORTANT: Since this app uses session-based auth (NOT Supabase Auth),
-- we need to use service_role for all operations and handle permissions in API layer.
-- RLS is enabled for security, but policies allow service_role to do everything.

-- Create policy: Service role can view all audit logs
CREATE POLICY "Service role can view audit logs" ON audit_logs
  FOR SELECT
  TO service_role
  USING (true);

-- Create policy: Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs" ON audit_logs
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create policy: No updates allowed (audit logs are immutable)
CREATE POLICY "Audit logs are immutable" ON audit_logs
  FOR UPDATE
  USING (false);

-- Create policy: No deletes allowed (except via cleanup function with SECURITY DEFINER)
CREATE POLICY "Audit logs cannot be deleted by users" ON audit_logs
  FOR DELETE
  USING (false);

-- Grant necessary permissions
-- Only service_role needs access since we use session-based auth in API
GRANT SELECT, INSERT ON audit_logs TO service_role;

-- Create function to auto-cleanup old logs (optional)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE timestamp < NOW() - (retention_days || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to cleanup function
COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Deletes audit logs older than specified retention period (default 90 days)';

-- Example: Schedule automatic cleanup (run monthly via pg_cron if available)
-- SELECT cron.schedule('cleanup-audit-logs', '0 0 1 * *', 'SELECT cleanup_old_audit_logs(90)');

-- Insert initial audit log entry for table creation
INSERT INTO audit_logs (event_type, user_id, metadata, severity, timestamp)
VALUES (
  'SYSTEM_INITIALIZED',
  NULL,
  '{"table": "audit_logs", "action": "created"}'::jsonb,
  'info',
  NOW()
);

-- Verify table creation
SELECT
  'Audit logs table created successfully!' as status,
  COUNT(*) as initial_entries
FROM audit_logs;


-- ============================================
-- Source: docs/database/complete-discord-setup.sql
-- ============================================

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


-- ============================================
-- Source: docs/database/statusio-setup.sql
-- ============================================

-- Status.io Integration Settings Table
-- This table stores the configuration for Status.io integration

CREATE TABLE IF NOT EXISTS statusio_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT false,
  api_id TEXT,
  api_key TEXT,
  statuspage_id TEXT,
  component_mapping JSONB DEFAULT '{}',
  auto_report_outages BOOLEAN NOT NULL DEFAULT true,
  auto_report_maintenance BOOLEAN NOT NULL DEFAULT false,
  notify_subscribers_on_outage BOOLEAN NOT NULL DEFAULT true,
  notify_subscribers_on_recovery BOOLEAN NOT NULL DEFAULT true,
  outage_threshold_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_statusio_settings_enabled ON statusio_settings(enabled);

-- Add comment
COMMENT ON TABLE statusio_settings IS 'Status.io integration configuration for status page updates and incident reporting';

-- Component mapping example structure:
-- {
--   "minecraft": "component-id-123",
--   "fivem": "component-id-456",
--   "website": "component-id-789"
-- }

-- Insert default row (disabled by default)
INSERT INTO statusio_settings (id, enabled, component_mapping)
VALUES (1, false, '{}')
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- Source: docs/database/metrics-history.sql
-- ============================================

-- ========================================
-- Metrics History Table
-- Database Setup for EVU-WEB
-- ========================================

CREATE TABLE IF NOT EXISTS metrics_history (
  id SERIAL PRIMARY KEY,
  total_users INTEGER DEFAULT 0,
  total_admins INTEGER DEFAULT 0,
  active_sessions INTEGER DEFAULT 0,
  total_forum_topics INTEGER DEFAULT 0,
  total_forum_comments INTEGER DEFAULT 0,
  total_support_tickets INTEGER DEFAULT 0,
  open_tickets INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries over time ranges
CREATE INDEX IF NOT EXISTS idx_metrics_history_recorded_at ON metrics_history(recorded_at DESC);

-- Enable RLS on metrics_history
ALTER TABLE IF EXISTS public.metrics_history ENABLE ROW LEVEL SECURITY;

-- Add policies for metrics_history (admin-only access)
DROP POLICY IF EXISTS "Allow authenticated users to view metrics_history" ON public.metrics_history;
CREATE POLICY "Allow authenticated users to view metrics_history"
  ON public.metrics_history FOR SELECT
  USING (auth.role() = 'authenticated'); -- Adjust based on your admin auth rules

DROP POLICY IF EXISTS "Allow service role full access to metrics_history" ON public.metrics_history;
CREATE POLICY "Allow service role full access to metrics_history"
  ON public.metrics_history FOR ALL
  USING (true)
  WITH CHECK (true);


-- ============================================
-- Source: docs/database/announcements-table.sql
-- ============================================

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


-- ============================================
-- Source: docs/database/password-reset-tokens-table.sql
-- ============================================

-- Password Reset Tokens Table
-- For forgot password functionality

-- IMPORTANT: Check your admins table ID type first!
-- If admins.id is SERIAL/INTEGER, use the first version
-- If admins.id is UUID, use the second version

-- VERSION 1: For SERIAL/INTEGER IDs (older schema)
-- Uncomment this block if your admins table uses SERIAL PRIMARY KEY:
/*
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- VERSION 2: For UUID IDs (newer schema)
-- Uncomment this block if your admins table uses UUID PRIMARY KEY:
/*
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- DYNAMIC VERSION: Detects type automatically
-- Use this version (recommended):
DO $$
DECLARE
  admin_id_type TEXT;
BEGIN
  -- Detect the data type of admins.id
  SELECT data_type INTO admin_id_type
  FROM information_schema.columns
  WHERE table_name = 'admins'
    AND column_name = 'id';

  -- Create table based on detected type
  IF admin_id_type = 'uuid' THEN
    EXECUTE '
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    ';
    RAISE NOTICE 'Created password_reset_tokens table with UUID IDs';
  ELSE
    EXECUTE '
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    ';
    RAISE NOTICE 'Created password_reset_tokens table with SERIAL IDs';
  END IF;
END $$;

-- Indexes for faster lookups (works for both versions)
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Row Level Security (RLS)
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- No one can read password reset tokens directly
DROP POLICY IF EXISTS "No direct access to reset tokens" ON password_reset_tokens;
CREATE POLICY "No direct access to reset tokens" ON password_reset_tokens
  FOR ALL USING (false);

-- Comments
COMMENT ON TABLE password_reset_tokens IS 'Stores password reset tokens for forgot password functionality';
COMMENT ON COLUMN password_reset_tokens.token_hash IS 'SHA256 hash of the reset token (not the token itself)';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token expiry time (1 hour from creation)';
COMMENT ON COLUMN password_reset_tokens.used IS 'Whether the token has been used';

-- Cleanup query (run periodically via cron or manually)
-- DELETE FROM password_reset_tokens WHERE expires_at < NOW() - INTERVAL '24 hours';


-- ============================================
-- Source: docs/database/rbac-setup.sql
-- ============================================

-- ========================================
-- RBAC (Role-Based Access Control) System
-- Database Setup for EVU-WEB
-- ========================================

-- 1. Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
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


-- ============================================
-- Source: docs/database/add-performance-indexes.sql
-- ============================================

-- Performance Optimization: Add Missing Database Indexes
-- Version: 2.14.0 - VERIFIED & TESTED
-- Date: 2025-10-23
-- Status: ✅ All column names verified against actual schema
-- Purpose: Improve query performance across all tables

-- ============================================
-- VERIFICATION STATUS
-- ============================================
-- ✅ forum_topics uses: author_id (NOT user_id)
-- ✅ forum_comments uses: author_id (NOT user_id)
-- ✅ support_tickets uses: author_id (NOT user_id)
-- ✅ All column names match actual database schema

-- ============================================
-- HIGH PRIORITY INDEXES
-- ============================================

-- Sessions table: Frequently queried by expiry date
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
ON sessions(expires_at);

-- Sessions table: Cleanup queries
CREATE INDEX IF NOT EXISTS idx_sessions_admin_id
ON sessions(admin_id);

-- Admins table: RBAC system queries
CREATE INDEX IF NOT EXISTS idx_admins_role_id
ON admins(role_id);

-- Admins table: Username lookups (login)
CREATE INDEX IF NOT EXISTS idx_admins_username
ON admins(username);

-- Forum topics: Category listing
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id
ON forum_topics(category_id);

-- Forum topics: Author's topics (VERIFIED: uses author_id)
CREATE INDEX IF NOT EXISTS idx_forum_topics_author_id
ON forum_topics(author_id);

-- Forum comments: Topic thread loading
CREATE INDEX IF NOT EXISTS idx_forum_comments_topic_id
ON forum_comments(topic_id);

-- Forum comments: Author's comments (VERIFIED: uses author_id)
CREATE INDEX IF NOT EXISTS idx_forum_comments_author_id
ON forum_comments(author_id);

-- Support tickets: Author's tickets (VERIFIED: uses author_id)
CREATE INDEX IF NOT EXISTS idx_support_tickets_author_id
ON support_tickets(author_id);

-- Support tickets: Status filtering
CREATE INDEX IF NOT EXISTS idx_support_tickets_status
ON support_tickets(status);

-- Support tickets: Priority filtering
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority
ON support_tickets(priority);

-- Support ticket replies: Ticket thread loading
CREATE INDEX IF NOT EXISTS idx_support_ticket_replies_ticket_id
ON support_ticket_replies(ticket_id);

-- ============================================
-- MEDIUM PRIORITY INDEXES
-- ============================================

-- Admins table: Recent registrations
CREATE INDEX IF NOT EXISTS idx_admins_created_at
ON admins(created_at DESC);

-- Forum topics: Recent topics, sorting
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at
ON forum_topics(created_at DESC);

-- Forum topics: Updated topics, sorting
CREATE INDEX IF NOT EXISTS idx_forum_topics_updated_at
ON forum_topics(updated_at DESC);

-- Forum topics: Pinned topics (show first)
CREATE INDEX IF NOT EXISTS idx_forum_topics_pinned
ON forum_topics(is_pinned DESC, created_at DESC);

-- Forum comments: Recent comments
CREATE INDEX IF NOT EXISTS idx_forum_comments_created_at
ON forum_comments(created_at DESC);

-- Support tickets: Recent tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at
ON support_tickets(created_at DESC);

-- Support tickets: Updated tickets
CREATE INDEX IF NOT EXISTS idx_support_tickets_updated_at
ON support_tickets(updated_at DESC);

-- Platform metrics: Time-series queries


-- ============================================
-- COMPOSITE INDEXES (Advanced Queries)
-- ============================================

-- Forum topics: Category + Status (pinned/locked)
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_status
ON forum_topics(category_id, is_pinned DESC, is_locked, created_at DESC);

-- Support tickets: Author + Status (VERIFIED: uses author_id)
CREATE INDEX IF NOT EXISTS idx_support_tickets_author_status
ON support_tickets(author_id, status, created_at DESC);

-- Support tickets: Status + Priority (admin dashboard)
CREATE INDEX IF NOT EXISTS idx_support_tickets_status_priority
ON support_tickets(status, priority, created_at DESC);

-- Sessions: Admin + Expiry (active sessions per user)
CREATE INDEX IF NOT EXISTS idx_sessions_admin_expires
ON sessions(admin_id, expires_at);

-- ============================================
-- FULL-TEXT SEARCH INDEXES (PostgreSQL)
-- ============================================

-- Forum topics: Title search
CREATE INDEX IF NOT EXISTS idx_forum_topics_title_search
ON forum_topics USING gin(to_tsvector('english', title));

-- Forum topics: Content search
CREATE INDEX IF NOT EXISTS idx_forum_topics_content_search
ON forum_topics USING gin(to_tsvector('english', content));

-- Forum comments: Content search
CREATE INDEX IF NOT EXISTS idx_forum_comments_content_search
ON forum_comments USING gin(to_tsvector('english', content));

-- Support tickets: Subject search
CREATE INDEX IF NOT EXISTS idx_support_tickets_subject_search
ON support_tickets USING gin(to_tsvector('english', subject));

-- Admins: Username/Display name search
CREATE INDEX IF NOT EXISTS idx_admins_name_search
ON admins USING gin(to_tsvector('english', username || ' ' || COALESCE(display_name, '')));



-- Notify PostgREST to reload the schema cache
NOTIFY pgrst, 'reload schema';
