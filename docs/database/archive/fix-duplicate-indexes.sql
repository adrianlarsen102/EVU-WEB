-- Fix Duplicate Index Warnings in Supabase Performance Advisor
-- These warnings indicate that multiple identical indexes exist on the same columns

-- Drop duplicate indexes on forum_comments
DO $$
BEGIN
  -- Keep only one index on topic_id, drop duplicates
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_forum_comments_topic_id_2') THEN
    DROP INDEX IF EXISTS public.idx_forum_comments_topic_id_2;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_forum_comments_topic_id_3') THEN
    DROP INDEX IF EXISTS public.idx_forum_comments_topic_id_3;
  END IF;
END $$;

-- Drop duplicate indexes on forum_topics
DO $$
BEGIN
  -- Keep only one index on category_id, drop duplicates
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_forum_topics_category_id_2') THEN
    DROP INDEX IF EXISTS public.idx_forum_topics_category_id_2;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_forum_topics_category_id_3') THEN
    DROP INDEX IF EXISTS public.idx_forum_topics_category_id_3;
  END IF;
END $$;

-- Drop duplicate indexes on sessions
DO $$
BEGIN
  -- Keep only one index on admin_id, drop duplicates
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_sessions_admin_id_2') THEN
    DROP INDEX IF EXISTS public.idx_sessions_admin_id_2;
  END IF;
END $$;

-- Drop duplicate indexes on support_ticket_replies
DO $$
BEGIN
  -- Keep only one index on ticket_id, drop duplicates
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_support_ticket_replies_ticket_id_2') THEN
    DROP INDEX IF EXISTS public.idx_support_ticket_replies_ticket_id_2;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_support_ticket_replies_ticket_id_3') THEN
    DROP INDEX IF EXISTS public.idx_support_ticket_replies_ticket_id_3;
  END IF;
END $$;

-- Drop duplicate indexes on support_tickets
DO $$
BEGIN
  -- Keep only one index on user_id, drop duplicates
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_support_tickets_user_id_2') THEN
    DROP INDEX IF EXISTS public.idx_support_tickets_user_id_2;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_support_tickets_user_id_3') THEN
    DROP INDEX IF EXISTS public.idx_support_tickets_user_id_3;
  END IF;
END $$;

-- Verification query: Check remaining indexes
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND (
    tablename = 'forum_comments' OR
    tablename = 'forum_topics' OR
    tablename = 'sessions' OR
    tablename = 'support_ticket_replies' OR
    tablename = 'support_tickets'
  )
ORDER BY tablename, indexname;
