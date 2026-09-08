-- Fix All Duplicate Index Warnings from Supabase Performance Advisor
-- Based on actual warnings from the database

-- ============================================
-- 1. forum_comments table - 3 duplicate pairs
-- ============================================

-- Drop idx_forum_comments_author (keep idx_forum_comments_author_id)
DROP INDEX IF EXISTS public.idx_forum_comments_author;

-- Drop idx_forum_comments_created (keep idx_forum_comments_created_at)
DROP INDEX IF EXISTS public.idx_forum_comments_created;

-- Drop idx_forum_comments_topic (keep idx_forum_comments_topic_id)
DROP INDEX IF EXISTS public.idx_forum_comments_topic;

-- ============================================
-- 2. forum_topics table - 3 duplicate pairs
-- ============================================

-- Drop idx_forum_topics_author (keep idx_forum_topics_author_id)
DROP INDEX IF EXISTS public.idx_forum_topics_author;

-- Drop idx_forum_topics_category (keep idx_forum_topics_category_id)
DROP INDEX IF EXISTS public.idx_forum_topics_category;

-- Drop idx_forum_topics_created (keep idx_forum_topics_created_at)
DROP INDEX IF EXISTS public.idx_forum_topics_created;

-- ============================================
-- 3. sessions table - 1 duplicate pair
-- ============================================

-- Drop idx_sessions_expires (keep idx_sessions_expires_at)
DROP INDEX IF EXISTS public.idx_sessions_expires;

-- ============================================
-- 4. support_ticket_replies table - 2 sets of duplicates
-- ============================================

-- Drop duplicates for created_at (keep idx_support_ticket_replies_created_at)
DROP INDEX IF EXISTS public.idx_support_ticket_replies_created;
DROP INDEX IF EXISTS public.idx_ticket_replies_created;

-- Drop duplicates for ticket_id (keep idx_support_ticket_replies_ticket_id)
DROP INDEX IF EXISTS public.idx_support_ticket_replies_ticket;
DROP INDEX IF EXISTS public.idx_ticket_replies_ticket;

-- ============================================
-- 5. support_tickets table - 2 duplicate pairs
-- ============================================

-- Drop idx_support_tickets_author (keep idx_support_tickets_author_id)
DROP INDEX IF EXISTS public.idx_support_tickets_author;

-- Drop idx_support_tickets_created (keep idx_support_tickets_created_at)
DROP INDEX IF EXISTS public.idx_support_tickets_created;

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- List all indexes on the affected tables to confirm duplicates are removed
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'forum_comments',
    'forum_topics',
    'sessions',
    'support_ticket_replies',
    'support_tickets'
  )
ORDER BY tablename, indexname;

-- Count of indexes per table (should be lower after running this script)
SELECT
  tablename,
  COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN (
    'forum_comments',
    'forum_topics',
    'sessions',
    'support_ticket_replies',
    'support_tickets'
  )
GROUP BY tablename
ORDER BY tablename;
