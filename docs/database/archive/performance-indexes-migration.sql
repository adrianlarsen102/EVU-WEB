-- Performance Optimization: Missing Database Indexes
-- Run this migration to add critical indexes for query performance
-- Recommended for production deployments with growing data

-- ====================================================================================
-- FORUM PERFORMANCE INDEXES
-- ====================================================================================

-- Index for querying comments by topic (most common query)
-- Used in: pages/api/forum/comments.js - getCommentsByTopic()
CREATE INDEX IF NOT EXISTS idx_forum_comments_topic_id
  ON forum_comments(topic_id);

-- Index for querying topics by category (most common query)
-- Used in: pages/api/forum/topics.js - getTopicsByCategory()
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_id
  ON forum_topics(category_id);

-- Index for sorting topics by creation date (recent activity)
CREATE INDEX IF NOT EXISTS idx_forum_topics_created_at
  ON forum_topics(created_at DESC);

-- Index for sorting comments by creation date
CREATE INDEX IF NOT EXISTS idx_forum_comments_created_at
  ON forum_comments(created_at DESC);

-- Compound index for topic queries (category + pinned + created_at)
-- Optimizes query: SELECT * FROM forum_topics WHERE category_id = ? ORDER BY is_pinned DESC, created_at DESC
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_pinned_created
  ON forum_topics(category_id, is_pinned DESC, created_at DESC);

-- ====================================================================================
-- USER & ROLE PERFORMANCE INDEXES
-- ====================================================================================

-- Index for permission checks (very frequent operation)
-- Used in: lib/permissions.js - hasPermission()
CREATE INDEX IF NOT EXISTS idx_admins_role_id
  ON admins(role_id);

-- Index for username lookups (login, registration)
-- Note: username should have UNIQUE constraint already, but explicit index improves performance
CREATE INDEX IF NOT EXISTS idx_admins_username
  ON admins(username);

-- Index for email lookups (password reset, user management)
CREATE INDEX IF NOT EXISTS idx_admins_email
  ON admins(email)
  WHERE email IS NOT NULL;  -- Partial index (only indexes rows with non-null emails)

-- ====================================================================================
-- SESSION PERFORMANCE INDEXES
-- ====================================================================================

-- Index for session expiry cleanup (cron job)
-- Used in: lib/database.js - cleanup expired sessions
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at
  ON sessions(expires_at);

-- Index for user session lookups (when invalidating user sessions)
CREATE INDEX IF NOT EXISTS idx_sessions_admin_id
  ON sessions(admin_id);

-- ====================================================================================
-- SUPPORT TICKET PERFORMANCE INDEXES
-- ====================================================================================

-- Index for querying tickets by user (my tickets view)
CREATE INDEX IF NOT EXISTS idx_support_tickets_author_id
  ON support_tickets(author_id)
  WHERE author_id IS NOT NULL;  -- Partial index (guest tickets don't need this)

-- Index for filtering tickets by status (open/closed)
CREATE INDEX IF NOT EXISTS idx_support_tickets_status
  ON support_tickets(status);

-- Index for filtering tickets by priority
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority
  ON support_tickets(priority);

-- Compound index for ticket queries (status + created_at for sorting)
CREATE INDEX IF NOT EXISTS idx_support_tickets_status_created
  ON support_tickets(status, created_at DESC);

-- Index for querying ticket replies
-- Note: Table is named support_ticket_replies in the schema
CREATE INDEX IF NOT EXISTS idx_support_ticket_replies_ticket_id
  ON support_ticket_replies(ticket_id);

-- ====================================================================================
-- AUDIT LOG PERFORMANCE INDEXES (Optional - only if table exists)
-- ====================================================================================
-- Note: Run these only if you have the audit_logs table from docs/database/audit-logs-setup.sql

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_logs') THEN
    -- Index for querying audit logs by event type
    CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type
      ON audit_logs(event_type);

    -- Index for querying audit logs by severity
    CREATE INDEX IF NOT EXISTS idx_audit_logs_severity
      ON audit_logs(severity);

    -- Index for querying audit logs by timestamp (recent activity)
    CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp
      ON audit_logs(timestamp DESC);

    -- Index for querying audit logs by user
    CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
      ON audit_logs(user_id)
      WHERE user_id IS NOT NULL;

    -- Compound index for filtering by severity + timestamp
    CREATE INDEX IF NOT EXISTS idx_audit_logs_severity_timestamp
      ON audit_logs(severity, timestamp DESC);

    RAISE NOTICE 'Created audit_logs indexes';
  ELSE
    RAISE NOTICE 'Skipping audit_logs indexes (table does not exist)';
  END IF;
END $$;

-- ====================================================================================
-- PLATFORM METRICS PERFORMANCE INDEXES (Optional - only if table exists)
-- ====================================================================================
-- Note: Run these only if you have the platform_metrics table

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'platform_metrics') THEN
    -- Index for querying metrics by date (dashboard charts)
    CREATE INDEX IF NOT EXISTS idx_platform_metrics_recorded_at
      ON platform_metrics(recorded_at DESC);

    RAISE NOTICE 'Created platform_metrics indexes';
  ELSE
    RAISE NOTICE 'Skipping platform_metrics indexes (table does not exist)';
  END IF;
END $$;

-- ====================================================================================
-- VERIFICATION & STATISTICS
-- ====================================================================================

-- Query to verify all indexes were created
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    indexname LIKE 'idx_forum_%'
    OR indexname LIKE 'idx_admins_%'
    OR indexname LIKE 'idx_sessions_%'
    OR indexname LIKE 'idx_support_%'
    OR indexname LIKE 'idx_audit_%'
    OR indexname LIKE 'idx_platform_%'
  )
ORDER BY tablename, indexname;

-- Query to check index usage (run after some time in production)
-- Helps identify unused indexes that can be dropped
/*
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY idx_scan ASC;
*/

-- ====================================================================================
-- NOTES
-- ====================================================================================
-- 1. CREATE INDEX IF NOT EXISTS is idempotent (safe to run multiple times)
-- 2. Indexes improve SELECT performance but slightly slow down INSERT/UPDATE/DELETE
-- 3. For large tables, create indexes during low-traffic periods
-- 4. Monitor index usage with pg_stat_user_indexes after deployment
-- 5. Consider VACUUM ANALYZE after creating multiple indexes
-- 6. Partial indexes (WHERE clause) save space and improve performance for filtered queries

-- ====================================================================================
-- POST-MIGRATION MAINTENANCE
-- ====================================================================================

-- Run this after migration to update statistics (optional but recommended)
-- VACUUM ANALYZE forum_comments;
-- VACUUM ANALYZE forum_topics;
-- VACUUM ANALYZE admins;
-- VACUUM ANALYZE sessions;
-- VACUUM ANALYZE support_tickets;
-- VACUUM ANALYZE audit_logs;
