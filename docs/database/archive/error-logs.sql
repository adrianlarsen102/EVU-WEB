-- ========================================
-- Error Logs Table
-- Database Setup for EVU-WEB
-- ========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  severity TEXT DEFAULT 'error',
  error_type TEXT,
  message TEXT NOT NULL,
  stack_trace TEXT,
  context JSONB DEFAULT '{}'::jsonb,
  resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES admins(id) ON DELETE SET NULL
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);

-- Enable RLS
ALTER TABLE IF EXISTS public.error_logs ENABLE ROW LEVEL SECURITY;

-- Add policies for error_logs (admin-only access)
DROP POLICY IF EXISTS "Allow authenticated users to view error_logs" ON public.error_logs;
CREATE POLICY "Allow authenticated users to view error_logs"
  ON public.error_logs FOR SELECT
  USING (auth.role() = 'authenticated'); 

DROP POLICY IF EXISTS "Allow service role full access to error_logs" ON public.error_logs;
CREATE POLICY "Allow service role full access to error_logs"
  ON public.error_logs FOR ALL
  USING (true)
  WITH CHECK (true);
