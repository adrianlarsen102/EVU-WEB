-- ====================================================================================
-- Email Logging System
-- ====================================================================================
-- Creates the email_logs table for tracking all emails sent by the system
-- Added in v3.2.3 for debugging, compliance, and monitoring
--
-- Features:
-- - Track all outgoing emails
-- - Success/failure status
-- - Error messages for debugging
-- - Recipient tracking (with privacy considerations)
-- - Email type categorization
-- - Delivery timestamps
-- - Retention policies
-- ====================================================================================

-- ====================================================================================
-- TABLE: email_logs
-- ====================================================================================

CREATE TABLE IF NOT EXISTS email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Email details
  recipient TEXT NOT NULL,                 -- Email address
  subject TEXT NOT NULL,                   -- Email subject
  email_type TEXT NOT NULL,                -- 'welcome', 'password_reset', 'ticket_reply', etc.

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'sent', 'failed', 'bounced'
  error_message TEXT,                      -- Error details if failed
  provider TEXT,                           -- 'resend', 'smtp', 'sendgrid', etc.

  -- Metadata
  user_id UUID REFERENCES admins(id) ON DELETE SET NULL,  -- Recipient user (if applicable)
  related_entity_type TEXT,                -- 'ticket', 'forum_topic', 'announcement', etc.
  related_entity_id UUID,                  -- ID of related entity
  template_name TEXT,                      -- Email template used

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,        -- When successfully sent
  failed_at TIMESTAMP WITH TIME ZONE,      -- When failed

  -- Privacy & Compliance
  -- Note: Consider GDPR - anonymize or delete after retention period
  retention_until TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '90 days')
);

-- ====================================================================================
-- INDEXES
-- ====================================================================================

-- Index for querying by status
CREATE INDEX IF NOT EXISTS idx_email_logs_status
  ON email_logs(status);

-- Index for querying by recipient (for user history)
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient
  ON email_logs(recipient);

-- Index for querying by user ID
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id
  ON email_logs(user_id)
  WHERE user_id IS NOT NULL;

-- Index for querying by email type
CREATE INDEX IF NOT EXISTS idx_email_logs_type
  ON email_logs(email_type);

-- Index for time-based queries (recent emails)
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at
  ON email_logs(created_at DESC);

-- Index for failed emails (debugging)
CREATE INDEX IF NOT EXISTS idx_email_logs_failed
  ON email_logs(status, created_at DESC)
  WHERE status IN ('failed', 'bounced');

-- Index for retention cleanup
CREATE INDEX IF NOT EXISTS idx_email_logs_retention
  ON email_logs(retention_until)
  WHERE retention_until IS NOT NULL;

-- ====================================================================================
-- FUNCTIONS
-- ====================================================================================

-- Function to log email sent
CREATE OR REPLACE FUNCTION log_email_sent(
  p_recipient TEXT,
  p_subject TEXT,
  p_email_type TEXT,
  p_provider TEXT DEFAULT 'unknown',
  p_user_id UUID DEFAULT NULL,
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_template_name TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO email_logs (
    recipient,
    subject,
    email_type,
    status,
    provider,
    user_id,
    related_entity_type,
    related_entity_id,
    template_name,
    sent_at
  )
  VALUES (
    p_recipient,
    p_subject,
    p_email_type,
    'sent',
    p_provider,
    p_user_id,
    p_related_entity_type,
    p_related_entity_id,
    p_template_name,
    NOW()
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log email failed
CREATE OR REPLACE FUNCTION log_email_failed(
  p_recipient TEXT,
  p_subject TEXT,
  p_email_type TEXT,
  p_error_message TEXT,
  p_provider TEXT DEFAULT 'unknown',
  p_user_id UUID DEFAULT NULL,
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO email_logs (
    recipient,
    subject,
    email_type,
    status,
    error_message,
    provider,
    user_id,
    related_entity_type,
    related_entity_id,
    failed_at
  )
  VALUES (
    p_recipient,
    p_subject,
    p_email_type,
    'failed',
    p_error_message,
    p_provider,
    p_user_id,
    p_related_entity_type,
    p_related_entity_id,
    NOW()
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get recent email logs (admin dashboard)
CREATE OR REPLACE FUNCTION get_recent_email_logs(
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  recipient TEXT,
  subject TEXT,
  email_type TEXT,
  status TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.id,
    e.recipient,
    e.subject,
    e.email_type,
    e.status,
    e.error_message,
    e.created_at,
    e.sent_at
  FROM email_logs e
  ORDER BY e.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Function to get email statistics
CREATE OR REPLACE FUNCTION get_email_stats(
  p_days INTEGER DEFAULT 7
)
RETURNS TABLE (
  total_sent INTEGER,
  total_failed INTEGER,
  total_pending INTEGER,
  success_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*) FILTER (WHERE status = 'sent')::INTEGER AS total_sent,
    COUNT(*) FILTER (WHERE status IN ('failed', 'bounced'))::INTEGER AS total_failed,
    COUNT(*) FILTER (WHERE status = 'pending')::INTEGER AS total_pending,
    ROUND(
      (COUNT(*) FILTER (WHERE status = 'sent')::NUMERIC /
       NULLIF(COUNT(*)::NUMERIC, 0) * 100), 2
    ) AS success_rate
  FROM email_logs
  WHERE created_at >= NOW() - INTERVAL '1 day' * p_days;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup old email logs (GDPR compliance)
CREATE OR REPLACE FUNCTION cleanup_old_email_logs()
RETURNS INTEGER AS $$
DECLARE
  v_deleted_count INTEGER;
BEGIN
  -- Delete emails past retention period
  WITH deleted AS (
    DELETE FROM email_logs
    WHERE retention_until IS NOT NULL
      AND retention_until < NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO v_deleted_count FROM deleted;

  RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================================
-- AUTOMATED CLEANUP (Scheduled Job)
-- ====================================================================================

-- You can call this from a cron job (e.g., Vercel Cron)
-- Example: Daily cleanup at 3 AM
-- SELECT cleanup_old_email_logs();

-- ====================================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================================

-- Enable RLS
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Admins can view all email logs
CREATE POLICY "Admins can view all email logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE id = auth.uid()
      AND (is_admin = true OR role = 'admin')
    )
  );

-- System can insert email logs (for application use)
-- Note: This assumes your application uses a service role key
-- No user-level INSERT policy needed

-- ====================================================================================
-- VERIFICATION
-- ====================================================================================

-- Verify table was created
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'email_logs'
ORDER BY ordinal_position;

-- Verify indexes were created
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'email_logs'
ORDER BY indexname;

-- Verify functions were created
SELECT
  proname as function_name,
  pg_get_function_arguments(oid) as parameters
FROM pg_proc
WHERE proname LIKE '%email%'
ORDER BY proname;

-- Test email statistics function
SELECT * FROM get_email_stats(7);

-- ====================================================================================
-- USAGE EXAMPLES
-- ====================================================================================

-- Log successful email
-- SELECT log_email_sent(
--   'user@example.com',
--   'Welcome to EVU Gaming!',
--   'welcome',
--   'resend',
--   'user-uuid',
--   NULL,
--   NULL,
--   'welcome_email_template'
-- );

-- Log failed email
-- SELECT log_email_failed(
--   'invalid@email',
--   'Test Email',
--   'test',
--   'SMTP connection timeout',
--   'smtp'
-- );

-- Get recent email logs
-- SELECT * FROM get_recent_email_logs(20, 0);

-- Get email statistics for last 30 days
-- SELECT * FROM get_email_stats(30);

-- Cleanup old logs
-- SELECT cleanup_old_email_logs();

-- Get failed emails for debugging
-- SELECT * FROM email_logs
-- WHERE status = 'failed'
-- ORDER BY created_at DESC
-- LIMIT 10;

-- Get emails for specific user
-- SELECT * FROM email_logs
-- WHERE user_id = 'user-uuid'
-- ORDER BY created_at DESC;

-- ====================================================================================
-- EMAIL TYPES
-- ====================================================================================
-- Suggested email_type values for consistency:
-- - 'welcome' - Welcome email for new users
-- - 'password_reset' - Password reset email
-- - 'ticket_created' - Support ticket confirmation
-- - 'ticket_reply' - Support ticket reply notification
-- - 'forum_mention' - Forum mention notification
-- - 'forum_reply' - Forum reply notification
-- - 'announcement' - System announcement
-- - 'test' - Test email
-- - 'admin_notification' - Admin alert
-- - 'security_alert' - Security-related email
--
-- ====================================================================================
-- PRIVACY & GDPR COMPLIANCE
-- ====================================================================================
-- 1. Default retention: 90 days (configurable)
-- 2. Automatically delete logs after retention period
-- 3. Consider anonymizing recipient after 30 days:
--    UPDATE email_logs SET recipient = 'anonymized@domain.com'
--    WHERE created_at < NOW() - INTERVAL '30 days';
-- 4. User data deletion: CASCADE deletes email logs when user is deleted
-- 5. Right to be forgotten: Delete all logs for a specific user:
--    DELETE FROM email_logs WHERE user_id = 'user-uuid';
--
-- ====================================================================================
-- MONITORING & ALERTS
-- ====================================================================================
-- Set up monitoring for:
-- 1. High failure rate (> 10% in last hour)
-- 2. No emails sent in last hour (system issue?)
-- 3. Bounce rate increase
-- 4. Specific error patterns
--
-- Example query for monitoring:
-- SELECT
--   email_type,
--   COUNT(*) as total,
--   COUNT(*) FILTER (WHERE status = 'failed') as failed,
--   ROUND(COUNT(*) FILTER (WHERE status = 'failed')::NUMERIC / COUNT(*)::NUMERIC * 100, 2) as failure_rate
-- FROM email_logs
-- WHERE created_at >= NOW() - INTERVAL '1 hour'
-- GROUP BY email_type
-- HAVING COUNT(*) FILTER (WHERE status = 'failed')::NUMERIC / COUNT(*)::NUMERIC > 0.1;
--
-- ====================================================================================
-- ROLLBACK (if needed)
-- ====================================================================================
-- To remove the email logging system:
-- DROP FUNCTION IF EXISTS log_email_sent(TEXT, TEXT, TEXT, TEXT, UUID, TEXT, UUID, TEXT);
-- DROP FUNCTION IF EXISTS log_email_failed(TEXT, TEXT, TEXT, TEXT, TEXT, UUID, TEXT, UUID);
-- DROP FUNCTION IF EXISTS get_recent_email_logs(INTEGER, INTEGER);
-- DROP FUNCTION IF EXISTS get_email_stats(INTEGER);
-- DROP FUNCTION IF EXISTS cleanup_old_email_logs();
-- DROP TABLE IF EXISTS email_logs CASCADE;
-- ====================================================================================
