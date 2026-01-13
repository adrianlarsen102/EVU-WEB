-- Password Reset Tokens Table
-- For forgot password functionality

-- IMPORTANT: Check your admins table ID type first!
-- If admins.id is SERIAL/INTEGER, use the first version
-- If admins.id is UUID, use the second version

-- VERSION 1: For SERIAL/INTEGER IDs (older schema)
-- Uncomment this block if your admins table uses SERIAL PRIMARY KEY:
/*
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- VERSION 2: For UUID IDs (newer schema)
-- Uncomment this block if your admins table uses UUID PRIMARY KEY:
/*
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
*/

-- DYNAMIC VERSION: Detects type automatically
-- Use this version (recommended):
DO $$
DECLARE
  admin_id_type TEXT;
BEGIN
  -- Detect the data type of admins.id
  SELECT data_type INTO admin_id_type
  FROM information_schema.columns
  WHERE table_name = 'admins'
    AND column_name = 'id';

  -- Create table based on detected type
  IF admin_id_type = 'uuid' THEN
    EXECUTE '
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    ';
    RAISE NOTICE 'Created password_reset_tokens table with UUID IDs';
  ELSE
    EXECUTE '
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        used_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    ';
    RAISE NOTICE 'Created password_reset_tokens table with SERIAL IDs';
  END IF;
END $$;

-- Indexes for faster lookups (works for both versions)
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token_hash ON password_reset_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Row Level Security (RLS)
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- No one can read password reset tokens directly
DROP POLICY IF EXISTS "No direct access to reset tokens" ON password_reset_tokens;
CREATE POLICY "No direct access to reset tokens" ON password_reset_tokens
  FOR ALL USING (false);

-- Comments
COMMENT ON TABLE password_reset_tokens IS 'Stores password reset tokens for forgot password functionality';
COMMENT ON COLUMN password_reset_tokens.token_hash IS 'SHA256 hash of the reset token (not the token itself)';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token expiry time (1 hour from creation)';
COMMENT ON COLUMN password_reset_tokens.used IS 'Whether the token has been used';

-- Cleanup query (run periodically via cron or manually)
-- DELETE FROM password_reset_tokens WHERE expires_at < NOW() - INTERVAL '24 hours';
