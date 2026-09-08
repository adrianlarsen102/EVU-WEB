-- ============================================
-- QUICK FIX: Remove All 11 Duplicate Index Warnings
-- ============================================
-- Run this script in Supabase SQL Editor to fix all Performance Advisor warnings
-- Safe to run multiple times (uses IF EXISTS)

-- forum_comments table (3 pairs)
DROP INDEX IF EXISTS public.idx_forum_comments_author CASCADE;
DROP INDEX IF EXISTS public.idx_forum_comments_created CASCADE;
DROP INDEX IF EXISTS public.idx_forum_comments_topic CASCADE;

-- forum_topics table (3 pairs)
DROP INDEX IF EXISTS public.idx_forum_topics_author CASCADE;
DROP INDEX IF EXISTS public.idx_forum_topics_category CASCADE;
DROP INDEX IF EXISTS public.idx_forum_topics_created CASCADE;

-- sessions table (1 pair)
DROP INDEX IF EXISTS public.idx_sessions_expires CASCADE;

-- support_ticket_replies table (2 sets with 3 indexes each)
DROP INDEX IF EXISTS public.idx_support_ticket_replies_created CASCADE;
DROP INDEX IF EXISTS public.idx_ticket_replies_created CASCADE;
DROP INDEX IF EXISTS public.idx_support_ticket_replies_ticket CASCADE;
DROP INDEX IF EXISTS public.idx_ticket_replies_ticket CASCADE;

-- support_tickets table (2 pairs)
DROP INDEX IF EXISTS public.idx_support_tickets_author CASCADE;
DROP INDEX IF EXISTS public.idx_support_tickets_created CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Successfully removed 11 duplicate indexes!';
  RAISE NOTICE 'Refresh the Performance Advisor to verify all warnings are cleared.';
END $$;
