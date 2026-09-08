-- Performance Optimization Indexes for EVU-WEB
-- Run this in Supabase SQL Editor to improve query performance
-- Safe to run multiple times (uses IF NOT EXISTS)

-- ============================================
-- FORUM PERFORMANCE INDEXES
-- ============================================

-- Composite index for category browsing with created date sorting
CREATE INDEX IF NOT EXISTS idx_forum_topics_category_created
  ON forum_topics(category_id, created_at DESC)
  WHERE is_deleted = false;

-- Index for pinned topics (shown first in listings)
CREATE INDEX IF NOT EXISTS idx_forum_topics_pinned_created
  ON forum_topics(is_pinned DESC, created_at DESC)
  WHERE is_deleted = false;

-- Composite index for topic comments with date sorting
CREATE INDEX IF NOT EXISTS idx_forum_comments_topic_created
  ON forum_comments(topic_id, created_at ASC)
  WHERE is_deleted = false;

-- Index for user's forum activity
CREATE INDEX IF NOT EXISTS idx_forum_topics_author_created
  ON forum_topics(author_id, created_at DESC)
  WHERE is_deleted = false;

CREATE INDEX IF NOT EXISTS idx_forum_comments_author_created
  ON forum_comments(author_id, created_at DESC)
  WHERE is_deleted = false;

-- ============================================
-- SESSION MANAGEMENT INDEXES
-- ============================================

-- Composite index for session cleanup and validation
CREATE INDEX IF NOT EXISTS idx_sessions_expires_admin
  ON sessions(expires_at, admin_id);

-- Index for finding user sessions
CREATE INDEX IF NOT EXISTS idx_sessions_admin
  ON sessions(admin_id, expires_at DESC);

-- ============================================
-- AUDIT LOG INDEXES
-- ============================================

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

-- ============================================
-- SUPPORT TICKET INDEXES
-- ============================================

-- Composite index for ticket filtering by status and priority
CREATE INDEX IF NOT EXISTS idx_support_tickets_status_created
  ON support_tickets(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_support_tickets_priority_status
  ON support_tickets(priority, status, created_at DESC);

-- Index for user's ticket history
CREATE INDEX IF NOT EXISTS idx_support_tickets_author_status
  ON support_tickets(author_id, status, created_at DESC);

-- Index for ticket replies (chronological order)
CREATE INDEX IF NOT EXISTS idx_support_replies_ticket_created
  ON support_ticket_replies(ticket_id, created_at ASC);

-- ============================================
-- USER MANAGEMENT INDEXES
-- ============================================

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

-- ============================================
-- METRICS AND ANALYTICS INDEXES
-- ============================================

-- Index for metrics time-series queries
CREATE INDEX IF NOT EXISTS idx_platform_metrics_recorded
  ON platform_metrics(recorded_at DESC);

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

-- Show index sizes (helpful for monitoring)
SELECT
  schemaname || '.' || tablename AS table,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================
-- NOTES
-- ============================================

/*
Index Strategy:
1. Composite indexes ordered by cardinality (most selective first)
2. Partial indexes for frequently filtered subsets (WHERE clauses)
3. DESC ordering for timestamp columns (most recent first)
4. Case-insensitive indexes for text search columns

Performance Impact:
- Faster category/topic browsing in forums
- Faster session validation and cleanup
- Faster audit log queries for security monitoring
- Faster support ticket filtering and sorting
- Faster user lookups by username/email

Maintenance:
- PostgreSQL automatically maintains these indexes
- Run VACUUM ANALYZE after creating indexes
- Monitor index usage with pg_stat_user_indexes
*/
