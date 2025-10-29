-- Security Fixes for Supabase Advisor Warnings
-- Run this in Supabase SQL Editor to fix RLS and function security issues

-- ============================================
-- FIX 1: Enable RLS on tables missing it
-- ============================================

-- Enable RLS on metrics_history
ALTER TABLE IF EXISTS public.metrics_history ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user_roles
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;

-- Add policies for metrics_history (admin-only access)
DROP POLICY IF EXISTS "Allow authenticated users to view metrics_history" ON public.metrics_history;
CREATE POLICY "Allow authenticated users to view metrics_history"
  ON public.metrics_history FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow service role full access to metrics_history" ON public.metrics_history;
CREATE POLICY "Allow service role full access to metrics_history"
  ON public.metrics_history FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Add policies for user_roles (all authenticated users can view, only service role can modify)
DROP POLICY IF EXISTS "Allow authenticated users to view user_roles" ON public.user_roles;
CREATE POLICY "Allow authenticated users to view user_roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow service role full access to user_roles" ON public.user_roles;
CREATE POLICY "Allow service role full access to user_roles"
  ON public.user_roles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- FIX 2: Fix Function Search Path (Security)
-- ============================================

-- Update email settings timestamp function
DROP FUNCTION IF EXISTS public.update_email_settings_timestamp() CASCADE;
CREATE OR REPLACE FUNCTION public.update_email_settings_timestamp()
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

-- Update discord settings timestamp function
DROP FUNCTION IF EXISTS public.update_discord_settings_timestamp() CASCADE;
CREATE OR REPLACE FUNCTION public.update_discord_settings_timestamp()
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

-- Increment view count function (only if forum_topics table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'forum_topics') THEN
    DROP FUNCTION IF EXISTS public.increment_view_count(uuid) CASCADE;
    CREATE OR REPLACE FUNCTION public.increment_view_count(topic_id uuid)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
    BEGIN
      UPDATE forum_topics
      SET view_count = view_count + 1
      WHERE id = topic_id;
    END;
    $func$;
  END IF;
END $$;

-- Generate ticket number function (only if support_tickets table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'support_tickets') THEN
    DROP FUNCTION IF EXISTS public.generate_ticket_number() CASCADE;
    CREATE OR REPLACE FUNCTION public.generate_ticket_number()
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
    DECLARE
      new_number text;
      counter integer;
    BEGIN
      SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_number FROM 6) AS integer)), 0) + 1
      INTO counter
      FROM support_tickets
      WHERE ticket_number LIKE 'EVU-%';

      new_number := 'EVU-' || LPAD(counter::text, 6, '0');
      RETURN new_number;
    END;
    $func$;
  END IF;
END $$;

-- Cleanup expired sessions function (only if sessions table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'sessions') THEN
    DROP FUNCTION IF EXISTS public.cleanup_expired_sessions() CASCADE;
    CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
    BEGIN
      DELETE FROM sessions
      WHERE expires_at < NOW();
    END;
    $func$;
  END IF;
END $$;

-- Cleanup old audit logs function (only if audit_logs table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'audit_logs') THEN
    DROP FUNCTION IF EXISTS public.cleanup_old_audit_logs(integer) CASCADE;
    CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs(retention_days integer DEFAULT 90)
    RETURNS integer
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
    DECLARE
      deleted_count integer;
    BEGIN
      DELETE FROM audit_logs
      WHERE timestamp < NOW() - (retention_days || ' days')::interval;

      GET DIAGNOSTICS deleted_count = ROW_COUNT;
      RETURN deleted_count;
    END;
    $func$;
  END IF;
END $$;

-- Is admin check function
DROP FUNCTION IF EXISTS public.is_admin(text) CASCADE;
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

-- Get user role function
DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;
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

-- Update updated_at column trigger function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
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

-- Update support ticket updated_at function (only if support_tickets table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'support_tickets') THEN
    DROP FUNCTION IF EXISTS public.update_support_ticket_updated_at() CASCADE;
    CREATE OR REPLACE FUNCTION public.update_support_ticket_updated_at()
    RETURNS TRIGGER
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
    BEGIN
      UPDATE support_tickets
      SET updated_at = NOW()
      WHERE id = NEW.ticket_id;
      RETURN NEW;
    END;
    $func$;
  END IF;
END $$;

-- ============================================
-- Recreate triggers with fixed functions
-- ============================================

-- Email settings trigger (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'email_settings') THEN
    DROP TRIGGER IF EXISTS email_settings_updated_at ON email_settings;
    CREATE TRIGGER email_settings_updated_at
      BEFORE UPDATE ON email_settings
      FOR EACH ROW
      EXECUTE FUNCTION update_email_settings_timestamp();
  END IF;
END $$;

-- Discord settings trigger (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'discord_settings') THEN
    DROP TRIGGER IF EXISTS discord_settings_updated_at ON discord_settings;
    CREATE TRIGGER discord_settings_updated_at
      BEFORE UPDATE ON discord_settings
      FOR EACH ROW
      EXECUTE FUNCTION update_discord_settings_timestamp();
  END IF;
END $$;

-- Support ticket reply trigger (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'support_replies') THEN
    DROP TRIGGER IF EXISTS support_reply_update_ticket ON support_replies;
    CREATE TRIGGER support_reply_update_ticket
      AFTER INSERT ON support_replies
      FOR EACH ROW
      EXECUTE FUNCTION update_support_ticket_updated_at();
  END IF;
END $$;

-- ============================================
-- Verification Query
-- ============================================

-- Run this to verify RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('metrics_history', 'user_roles', 'discord_settings')
ORDER BY tablename;

-- ============================================
-- FIX 3: Additional Functions Missing search_path
-- ============================================

-- Fix increment_view_count (if it exists without conditional wrapper)
DROP FUNCTION IF EXISTS public.increment_view_count(uuid) CASCADE;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'forum_topics') THEN
    CREATE OR REPLACE FUNCTION public.increment_view_count(topic_id uuid)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
    BEGIN
      UPDATE forum_topics
      SET view_count = view_count + 1
      WHERE id = topic_id;
    END;
    $func$;
  END IF;
END $$;

-- Fix is_admin function
DROP FUNCTION IF EXISTS public.is_admin(text) CASCADE;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admins') THEN
    CREATE OR REPLACE FUNCTION public.is_admin(user_id text)
    RETURNS boolean
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
    DECLARE
      admin_check boolean;
    BEGIN
      SELECT is_admin INTO admin_check
      FROM admins
      WHERE id::text = user_id;

      RETURN COALESCE(admin_check, false);
    END;
    $func$;
  END IF;
END $$;

-- Fix get_user_role function
DROP FUNCTION IF EXISTS public.get_user_role(uuid) CASCADE;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admins') THEN
    CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
    AS $func$
    DECLARE
      user_role text;
    BEGIN
      SELECT role INTO user_role
      FROM admins
      WHERE id = user_id;

      RETURN user_role;
    END;
    $func$;
  END IF;
END $$;

-- ============================================
-- Verification Query
-- ============================================

-- Run this to verify RLS is enabled on all tables
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('metrics_history', 'user_roles', 'discord_settings')
ORDER BY tablename;

-- Run this to verify functions have search_path set
SELECT
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'update_email_settings_timestamp',
    'update_discord_settings_timestamp',
    'increment_view_count',
    'generate_ticket_number',
    'cleanup_expired_sessions',
    'cleanup_old_audit_logs',
    'is_admin',
    'get_user_role',
    'update_updated_at_column',
    'update_support_ticket_updated_at'
  )
ORDER BY routine_name;
