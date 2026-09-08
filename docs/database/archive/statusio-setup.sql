-- Status.io Integration Settings Table
-- This table stores the configuration for Status.io integration

CREATE TABLE IF NOT EXISTS statusio_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  enabled BOOLEAN NOT NULL DEFAULT false,
  api_id TEXT,
  api_key TEXT,
  statuspage_id TEXT,
  component_mapping JSONB DEFAULT '{}',
  auto_report_outages BOOLEAN NOT NULL DEFAULT true,
  auto_report_maintenance BOOLEAN NOT NULL DEFAULT false,
  notify_subscribers_on_outage BOOLEAN NOT NULL DEFAULT true,
  notify_subscribers_on_recovery BOOLEAN NOT NULL DEFAULT true,
  outage_threshold_minutes INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT single_row CHECK (id = 1)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_statusio_settings_enabled ON statusio_settings(enabled);

-- Add comment
COMMENT ON TABLE statusio_settings IS 'Status.io integration configuration for status page updates and incident reporting';

-- Component mapping example structure:
-- {
--   "minecraft": "component-id-123",
--   "fivem": "component-id-456",
--   "website": "component-id-789"
-- }

-- Insert default row (disabled by default)
INSERT INTO statusio_settings (id, enabled, component_mapping)
VALUES (1, false, '{}')
ON CONFLICT (id) DO NOTHING;
