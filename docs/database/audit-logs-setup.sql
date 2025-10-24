-- Audit Logs Table Setup
-- Tracks all administrative actions for security and compliance
-- Run this SQL in your Supabase SQL editor

-- Note: First check your admins table ID type
-- Run: SELECT data_type FROM information_schema.columns WHERE table_name = 'admins' AND column_name = 'id';
-- If it returns 'uuid', use UUID. If 'integer', use the version below.

-- Create audit_logs table (using TEXT for user_id to be compatible with both)
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  user_id TEXT,  -- TEXT to support both UUID and INTEGER from admins table
  metadata JSONB DEFAULT '{}'::jsonb,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  ip_address TEXT,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_severity ON audit_logs(severity);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(user_id, timestamp DESC);

-- Add comments to table and columns
COMMENT ON TABLE audit_logs IS 'Audit log of all administrative actions for security and compliance';
COMMENT ON COLUMN audit_logs.id IS 'Unique identifier for the audit log entry';
COMMENT ON COLUMN audit_logs.event_type IS 'Type of event (e.g., USER_CREATED, CONTENT_UPDATED)';
COMMENT ON COLUMN audit_logs.user_id IS 'ID of the user who performed the action';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context data about the event (JSON)';
COMMENT ON COLUMN audit_logs.severity IS 'Severity level: info, warning, error, critical';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the request';
COMMENT ON COLUMN audit_logs.user_agent IS 'User agent string from the request';
COMMENT ON COLUMN audit_logs.timestamp IS 'When the event occurred';

-- Enable Row Level Security (RLS)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policy: Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id = auth.uid()
      AND (role = 'admin' OR is_admin = true)
    )
  );

-- Create policy: System can insert audit logs (via service role)
CREATE POLICY "System can insert audit logs" ON audit_logs
  FOR INSERT
  WITH CHECK (true);

-- Create policy: No one can update or delete audit logs (immutable)
CREATE POLICY "Audit logs are immutable" ON audit_logs
  FOR UPDATE
  USING (false);

CREATE POLICY "Audit logs cannot be deleted" ON audit_logs
  FOR DELETE
  USING (false);

-- Grant necessary permissions
GRANT SELECT ON audit_logs TO authenticated;
GRANT INSERT ON audit_logs TO service_role;

-- Create function to auto-cleanup old logs (optional)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_logs
  WHERE timestamp < NOW() - (retention_days || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment to cleanup function
COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Deletes audit logs older than specified retention period (default 90 days)';

-- Example: Schedule automatic cleanup (run monthly via pg_cron if available)
-- SELECT cron.schedule('cleanup-audit-logs', '0 0 1 * *', 'SELECT cleanup_old_audit_logs(90)');

-- Insert initial audit log entry for table creation
INSERT INTO audit_logs (event_type, user_id, metadata, severity, timestamp)
VALUES (
  'SYSTEM_INITIALIZED',
  NULL,
  '{"table": "audit_logs", "action": "created"}'::jsonb,
  'info',
  NOW()
);

-- Verify table creation
SELECT
  'Audit logs table created successfully!' as status,
  COUNT(*) as initial_entries
FROM audit_logs;
