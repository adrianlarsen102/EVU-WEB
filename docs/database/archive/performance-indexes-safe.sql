-- Safe Performance Optimization Indexes for EVU-WEB
-- Only creates indexes for tables that exist
-- Run this in Supabase SQL Editor to improve query performance
-- Safe to run multiple times (uses IF NOT EXISTS and table existence checks)

-- ============================================
-- FORUM PERFORMANCE INDEXES
-- ============================================

-- Check if forum_topics exists before creating indexes
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_topics') THEN
    -- Composite index for category browsing with created date sorting
    CREATE INDEX IF NOT EXISTS idx_forum_topics_category_created
      ON forum_topics(category_id, created_at DESC)
      WHERE is_deleted = false;

    -- Index for pinned topics (shown first in listings)
    CREATE INDEX IF NOT EXISTS idx_forum_topics_pinned_created
      ON forum_topics(is_pinned DESC, created_at DESC)
      WHERE is_deleted = false;

    -- Index for user's forum activity
    CREATE INDEX IF NOT EXISTS idx_forum_topics_author_created
      ON forum_topics(author_id, created_at DESC)
      WHERE is_deleted = false;

    RAISE NOTICE 'Created forum_topics indexes';
  END IF;
END $$;

-- Check if forum_comments exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'forum_comments') THEN
    -- Composite index for topic comments with date sorting
    CREATE INDEX IF NOT EXISTS idx_forum_comments_topic_created
      ON forum_comments(topic_id, created_at ASC)
      WHERE is_deleted = false;

    -- Index for user's comment activity
    CREATE INDEX IF NOT EXISTS idx_forum_comments_author_created
      ON forum_comments(author_id, created_at DESC)
      WHERE is_deleted = false;

    RAISE NOTICE 'Created forum_comments indexes';
  END IF;
END $$;

-- ============================================
-- SESSION MANAGEMENT INDEXES
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sessions') THEN
    -- Composite index for session cleanup and validation
    CREATE INDEX IF NOT EXISTS idx_sessions_expires_admin
      ON sessions(expires_at, admin_id);

    -- Index for finding user sessions
    CREATE INDEX IF NOT EXISTS idx_sessions_admin
      ON sessions(admin_id, expires_at DESC);

    RAISE NOTICE 'Created sessions indexes';
  END IF;
END $$;

-- ============================================
-- AUDIT LOG INDEXES
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    -- Index for severity-based log queries (security monitoring)
    CREATE INDEX IF NOT EXISTS idx_audit_logs_severity_timestamp
      ON audit_logs(severity, timestamp DESC);

    -- Index for event-type queries (specific event tracking)
    CREATE INDEX IF NOT EXISTS idx_audit_logs_event_timestamp
      ON audit_logs(event_type, timestamp DESC);

    -- Index for user activity auditing
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_event_timestamp
      ON audit_logs(user_id, event_type, timestamp DESC);

    -- Partial index for critical security events
    CREATE INDEX IF NOT EXISTS idx_audit_logs_critical
      ON audit_logs(timestamp DESC)
      WHERE severity IN ('critical', 'error');

    RAISE NOTICE 'Created audit_logs indexes';
  END IF;
END $$;

-- ============================================
-- SUPPORT TICKET INDEXES
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'support_tickets') THEN
    -- Composite index for ticket filtering by status and priority
    CREATE INDEX IF NOT EXISTS idx_support_tickets_status_created
      ON support_tickets(status, created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_support_tickets_priority_status
      ON support_tickets(priority, status, created_at DESC);

    -- Index for user's ticket history
    CREATE INDEX IF NOT EXISTS idx_support_tickets_author_created
      ON support_tickets(author_id, created_at DESC);

    RAISE NOTICE 'Created support_tickets indexes';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'support_ticket_replies') THEN
    -- Index for ticket replies (chronological order)
    CREATE INDEX IF NOT EXISTS idx_support_replies_ticket_created
      ON support_ticket_replies(ticket_id, created_at ASC);

    RAISE NOTICE 'Created support_ticket_replies indexes';
  END IF;
END $$;

-- ============================================
-- USER MANAGEMENT INDEXES
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admins') THEN
    -- Index for role-based queries
    CREATE INDEX IF NOT EXISTS idx_admins_role
      ON admins(role_id)
      WHERE role_id IS NOT NULL;

    -- Case-insensitive username search
    CREATE INDEX IF NOT EXISTS idx_admins_username_lower
      ON admins(LOWER(username));

    -- Index for email lookups
    CREATE INDEX IF NOT EXISTS idx_admins_email_lower
      ON admins(LOWER(email))
      WHERE email IS NOT NULL;

    RAISE NOTICE 'Created admins indexes';
  END IF;
END $$;

-- ============================================
-- METRICS AND ANALYTICS INDEXES (OPTIONAL)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_metrics') THEN
    -- Index for metrics time-series queries
    CREATE INDEX IF NOT EXISTS idx_platform_metrics_recorded
      ON platform_metrics(recorded_at DESC);

    RAISE NOTICE 'Created platform_metrics indexes';
  ELSE
    RAISE NOTICE 'Skipped platform_metrics (table does not exist)';
  END IF;
END $$;

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Show all custom indexes created by this script
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ============================================
-- SUCCESS MESSAGE
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Performance indexes created successfully!';
  RAISE NOTICE 'Run ANALYZE to update table statistics for optimal query planning.';
END $$;

-- Update table statistics
ANALYZE;
