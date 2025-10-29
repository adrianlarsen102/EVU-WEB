-- Discord Webhook Configuration Table
-- Stores Discord webhook URL and event configuration

CREATE TABLE IF NOT EXISTS discord_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  enabled BOOLEAN DEFAULT FALSE,
  webhook_url TEXT,
  bot_avatar_url TEXT,
  event_config JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default row
INSERT INTO discord_settings (id, enabled)
VALUES (1, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Add RLS policies (optional, depends on your setup)
ALTER TABLE discord_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated users can view
CREATE POLICY "Allow authenticated users to view discord settings"
  ON discord_settings FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only admins can update (adjust based on your auth setup)
CREATE POLICY "Allow admins to update discord settings"
  ON discord_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update timestamp (with security fixes)
CREATE OR REPLACE FUNCTION update_discord_settings_timestamp()
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

-- Create trigger
DROP TRIGGER IF EXISTS discord_settings_updated_at ON discord_settings;
CREATE TRIGGER discord_settings_updated_at
  BEFORE UPDATE ON discord_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_discord_settings_timestamp();

-- Grant permissions (adjust based on your setup)
GRANT SELECT, UPDATE ON discord_settings TO authenticated;

COMMENT ON TABLE discord_settings IS 'Discord webhook notification configuration';
COMMENT ON COLUMN discord_settings.enabled IS 'Global Discord webhook enable/disable';
COMMENT ON COLUMN discord_settings.webhook_url IS 'Discord webhook URL';
COMMENT ON COLUMN discord_settings.bot_avatar_url IS 'Custom avatar URL for Discord bot';
COMMENT ON COLUMN discord_settings.event_config IS 'JSON configuration for which events to send';
