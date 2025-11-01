-- Create error_logs table for application error tracking
-- Separate from audit_logs to keep security events separate from errors

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type TEXT NOT NULL,
  message TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  user_id TEXT,
  endpoint TEXT,
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  notes TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_error_logs_timestamp ON error_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_error_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_endpoint ON error_logs(endpoint);

-- Enable Row Level Security
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Admin users can read all error logs
CREATE POLICY "Admins can read error_logs"
  ON error_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id::text = auth.uid()::text
      AND (is_admin = true OR role = 'admin')
    )
  );

-- Policy: System can insert error logs
CREATE POLICY "System can insert error_logs"
  ON error_logs
  FOR INSERT
  WITH CHECK (true);

-- Policy: Admins can update error logs (for marking as resolved)
CREATE POLICY "Admins can update error_logs"
  ON error_logs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id::text = auth.uid()::text
      AND (is_admin = true OR role = 'admin')
    )
  );

COMMENT ON TABLE error_logs IS 'Application error logs for debugging and monitoring';
COMMENT ON COLUMN error_logs.error_type IS 'Type of error (API_ERROR, DATABASE_ERROR, etc.)';
COMMENT ON COLUMN error_logs.message IS 'Human-readable error message';
COMMENT ON COLUMN error_logs.details IS 'Additional error details (stack trace, context, etc.)';
COMMENT ON COLUMN error_logs.severity IS 'Error severity level: low, medium, high, critical';
COMMENT ON COLUMN error_logs.resolved IS 'Whether the error has been acknowledged/fixed';
COMMENT ON COLUMN error_logs.resolved_by IS 'Admin user ID who marked error as resolved';
COMMENT ON COLUMN error_logs.notes IS 'Admin notes about the error resolution';
