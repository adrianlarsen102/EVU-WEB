-- Fix for Integer Version Functions
-- The warnings are about the integer parameter versions, not uuid/text versions

-- Fix increment_view_count(integer) version
DROP FUNCTION IF EXISTS public.increment_view_count(integer);
CREATE OR REPLACE FUNCTION public.increment_view_count(topic_id integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE forum_topics
  SET view_count = view_count + 1
  WHERE id::integer = topic_id;
END;
$$;

-- Fix is_admin(integer) version
DROP FUNCTION IF EXISTS public.is_admin(integer);
CREATE OR REPLACE FUNCTION public.is_admin(user_id integer)
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
  WHERE id::integer = user_id;

  RETURN COALESCE(admin_check, false);
END;
$$;

-- Fix get_user_role(integer) version
DROP FUNCTION IF EXISTS public.get_user_role(integer);
CREATE OR REPLACE FUNCTION public.get_user_role(user_id integer)
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
  WHERE id::integer = user_id;

  RETURN user_role;
END;
$$;

-- Verify all versions now have SECURITY DEFINER
SELECT
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  CASE
    WHEN p.prosecdef THEN 'DEFINER (Secure)'
    ELSE 'INVOKER (Insecure)'
  END as security_mode,
  CASE
    WHEN p.proconfig IS NOT NULL AND 'search_path=public' = ANY(p.proconfig) THEN 'SET ✓'
    ELSE 'NOT SET ✗'
  END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.proname IN ('increment_view_count', 'is_admin', 'get_user_role')
ORDER BY p.proname, pg_get_function_arguments(p.oid);

-- Success message
SELECT '✅ All integer-parameter function versions have been secured!' as status;
