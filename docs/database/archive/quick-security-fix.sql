-- Quick Security Fix for Remaining Warnings
-- This directly fixes the 3 remaining functions that are showing warnings

-- Fix 1: increment_view_count
DROP FUNCTION IF EXISTS public.increment_view_count(uuid);
CREATE OR REPLACE FUNCTION public.increment_view_count(topic_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE forum_topics
  SET view_count = view_count + 1
  WHERE id = topic_id;
END;
$$;

-- Fix 2: is_admin
DROP FUNCTION IF EXISTS public.is_admin(text);
CREATE OR REPLACE FUNCTION public.is_admin(user_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_check boolean;
BEGIN
  SELECT is_admin INTO admin_check
  FROM admins
  WHERE id::text = user_id;

  RETURN COALESCE(admin_check, false);
END;
$$;

-- Fix 3: get_user_role
DROP FUNCTION IF EXISTS public.get_user_role(uuid);
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM admins
  WHERE id = user_id;

  RETURN user_role;
END;
$$;

-- Verify the fixes
SELECT
  routine_name,
  routine_type,
  security_type,
  CASE
    WHEN prosecdef THEN 'SECURITY DEFINER'
    ELSE 'SECURITY INVOKER'
  END as security_mode
FROM information_schema.routines
LEFT JOIN pg_proc ON proname = routine_name
WHERE routine_schema = 'public'
  AND routine_name IN ('increment_view_count', 'is_admin', 'get_user_role')
ORDER BY routine_name;

-- Show success message
SELECT 'All 3 functions have been fixed with SET search_path = public' as result;
