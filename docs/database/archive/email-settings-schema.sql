-- Email Settings Table
-- Stores email configuration in database for admin panel management

CREATE TABLE IF NOT EXISTS email_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  provider TEXT NOT NULL DEFAULT 'resend', -- 'resend' or 'smtp'

  -- Resend settings
  resend_api_key TEXT,

  -- SMTP settings
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_user TEXT,
  smtp_pass TEXT,
  smtp_secure BOOLEAN DEFAULT false,

  -- Shared settings
  email_from TEXT DEFAULT 'noreply@yourdomain.com',
  admin_email TEXT,

  -- Status
  enabled BOOLEAN DEFAULT false,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Ensure only one row exists
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default row
INSERT INTO email_settings (id, enabled)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_email_settings_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_email_settings_timestamp
BEFORE UPDATE ON email_settings
FOR EACH ROW
EXECUTE FUNCTION update_email_settings_timestamp();

-- RLS Policies (if RLS is enabled)
ALTER TABLE email_settings ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access to email_settings"
  ON email_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE email_settings IS 'Email configuration settings managed through admin panel';
COMMENT ON COLUMN email_settings.provider IS 'Email provider: resend or smtp';
COMMENT ON COLUMN email_settings.enabled IS 'Whether email notifications are enabled';
