-- ========================================
-- Metrics History Table
-- Database Setup for EVU-WEB
-- ========================================

CREATE TABLE IF NOT EXISTS metrics_history (
  id SERIAL PRIMARY KEY,
  total_users INTEGER DEFAULT 0,
  total_admins INTEGER DEFAULT 0,
  active_sessions INTEGER DEFAULT 0,
  total_forum_topics INTEGER DEFAULT 0,
  total_forum_comments INTEGER DEFAULT 0,
  total_support_tickets INTEGER DEFAULT 0,
  open_tickets INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries over time ranges
CREATE INDEX IF NOT EXISTS idx_metrics_history_recorded_at ON metrics_history(recorded_at DESC);

-- Enable RLS on metrics_history
ALTER TABLE IF EXISTS public.metrics_history ENABLE ROW LEVEL SECURITY;

-- Add policies for metrics_history (admin-only access)
DROP POLICY IF EXISTS "Allow authenticated users to view metrics_history" ON public.metrics_history;
CREATE POLICY "Allow authenticated users to view metrics_history"
  ON public.metrics_history FOR SELECT
  USING (auth.role() = 'authenticated'); -- Adjust based on your admin auth rules

DROP POLICY IF EXISTS "Allow service role full access to metrics_history" ON public.metrics_history;
CREATE POLICY "Allow service role full access to metrics_history"
  ON public.metrics_history FOR ALL
  USING (true)
  WITH CHECK (true);
