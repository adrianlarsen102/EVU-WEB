-- ====================================================================================
-- Forum Category Counter Race Condition Fix
-- ====================================================================================
-- Creates PostgreSQL RPC functions for atomic forum category counter updates
-- Prevents race conditions when multiple users post topics/comments simultaneously
--
-- PROBLEM: Old approach used read-modify-write pattern:
--   1. Read current count from database
--   2. Increment in JavaScript
--   3. Write back to database
--   → Two concurrent requests could both read "10", both write "11" (losing one increment)
--
-- SOLUTION: PostgreSQL RPC functions perform atomic JSONB updates
--   → Database handles increment in single transaction
--   → Prevents lost updates under concurrent access
--
-- Run this migration after deploying v3.2.3+ which includes the updated lib/database.js
-- ====================================================================================

-- ====================================================================================
-- DROP EXISTING FUNCTIONS (if any)
-- ====================================================================================

DROP FUNCTION IF EXISTS increment_category_topics(INTEGER);
DROP FUNCTION IF EXISTS increment_category_posts(INTEGER);

-- ====================================================================================
-- FUNCTION: increment_category_topics
-- ====================================================================================
-- Atomically increments the topic count for a forum category
--
-- Parameters:
--   category_index: The array index of the category in forumCategories array
--
-- Usage (from application code):
--   await supabase.rpc('increment_category_topics', { category_index: 2 })

CREATE OR REPLACE FUNCTION increment_category_topics(category_index INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE site_content
  SET content = jsonb_set(
    content,
    array['forumCategories', category_index::text, 'topics'],
    to_jsonb(COALESCE((content->'forumCategories'->category_index->'topics')::int, 0) + 1)
  )
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================================
-- FUNCTION: increment_category_posts
-- ====================================================================================
-- Atomically increments the post count for a forum category
--
-- Parameters:
--   category_index: The array index of the category in forumCategories array
--
-- Usage (from application code):
--   await supabase.rpc('increment_category_posts', { category_index: 2 })

CREATE OR REPLACE FUNCTION increment_category_posts(category_index INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE site_content
  SET content = jsonb_set(
    content,
    array['forumCategories', category_index::text, 'posts'],
    to_jsonb(COALESCE((content->'forumCategories'->category_index->'posts')::int, 0) + 1)
  )
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================================
-- VERIFICATION
-- ====================================================================================

-- Verify functions were created successfully
SELECT
  proname as function_name,
  pg_get_function_arguments(oid) as parameters,
  pg_get_functiondef(oid) as definition
FROM pg_proc
WHERE proname IN ('increment_category_topics', 'increment_category_posts')
ORDER BY proname;

-- ====================================================================================
-- TESTING (Optional - run these to test the functions)
-- ====================================================================================

-- Test 1: Verify current category counts
-- SELECT content->'forumCategories' FROM site_content WHERE id = 1;

-- Test 2: Increment topic count for first category (index 0)
-- SELECT increment_category_topics(0);

-- Test 3: Verify increment worked
-- SELECT content->'forumCategories'->0->'topics' FROM site_content WHERE id = 1;

-- Test 4: Increment post count for first category (index 0)
-- SELECT increment_category_posts(0);

-- Test 5: Verify increment worked
-- SELECT content->'forumCategories'->0->'posts' FROM site_content WHERE id = 1;

-- ====================================================================================
-- NOTES
-- ====================================================================================
-- 1. These functions operate on the site_content table (id = 1)
-- 2. They use jsonb_set to atomically update nested JSON values
-- 3. COALESCE ensures null values are treated as 0
-- 4. The category_index parameter must be a valid array index
-- 5. If category_index is out of bounds, the update will fail silently
-- 6. Consider adding bounds checking in application code before calling these functions
-- 7. The lib/database.js code includes automatic fallback if these functions don't exist
--
-- ====================================================================================
-- ROLLBACK (if needed)
-- ====================================================================================
-- To remove these functions:
-- DROP FUNCTION IF EXISTS increment_category_topics(INTEGER);
-- DROP FUNCTION IF EXISTS increment_category_posts(INTEGER);
--
-- The application will automatically fall back to the old read-modify-write pattern
-- (though it will be vulnerable to race conditions again)
-- ====================================================================================
