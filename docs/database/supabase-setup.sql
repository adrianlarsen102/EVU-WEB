-- =====================================================
-- EVU Website - Complete Supabase Database Setup
-- =====================================================
-- Copy and paste this entire file into Supabase SQL Editor
-- This will create all tables, indexes, policies, and default data

-- =====================================================
-- 1. CREATE TABLES
-- =====================================================

-- Create admins table for authentication
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_default_password BOOLEAN DEFAULT true,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sessions table for user sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create site_content table for website content (single row)
CREATE TABLE site_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_sessions_admin_id ON sessions(admin_id);

-- =====================================================
-- 3. INSERT DEFAULT DATA
-- =====================================================

-- Insert default website content
INSERT INTO site_content (id, content) VALUES (1, '{
  "serverInfo": {
    "name": "EVU Server",
    "title": "Welcome to EVU Server",
    "subtitle": "QBCore FiveM Roleplay Experience",
    "version": "QBCore v1.0"
  },
  "serverStatus": {
    "isOnline": true,
    "maxPlayers": 64,
    "uptime": "99.9%"
  },
  "features": [
    {
      "icon": "🎮",
      "title": "Roleplay",
      "description": "Immersive roleplay experience with custom scripts and scenarios"
    },
    {
      "icon": "👮",
      "title": "Jobs",
      "description": "Multiple job opportunities including police, EMS, mechanics, and more"
    },
    {
      "icon": "🏪",
      "title": "Economy",
      "description": "Balanced economy system with legal and illegal activities"
    },
    {
      "icon": "🚗",
      "title": "Vehicles",
      "description": "Wide variety of vehicles with realistic handling and customization"
    }
  ],
  "joinInfo": {
    "serverIP": "connect cfx.re/join/xxxxx",
    "discordLink": "https://discord.gg/yourserver"
  },
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2024-01-15",
      "changes": {
        "features": [
          "Initial server launch",
          "QBCore framework implementation",
          "Custom vehicle pack"
        ],
        "improvements": [
          "Performance optimizations",
          "UI enhancements"
        ],
        "fixes": [
          "Fixed various bugs"
        ]
      }
    }
  ],
  "forumCategories": [
    {
      "name": "Announcements",
      "description": "Official server announcements and updates",
      "topics": 12,
      "posts": 45
    },
    {
      "name": "General Discussion",
      "description": "General chat about the server",
      "topics": 156,
      "posts": 892
    },
    {
      "name": "Support",
      "description": "Get help with server issues",
      "topics": 78,
      "posts": 324
    },
    {
      "name": "Suggestions",
      "description": "Suggest new features and improvements",
      "topics": 43,
      "posts": 167
    }
  ]
}'::jsonb);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

-- Allow service role to manage admins table
CREATE POLICY "Service role can do everything on admins"
  ON admins
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow service role to manage sessions table
CREATE POLICY "Service role can do everything on sessions"
  ON sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Allow service role to manage site_content table
CREATE POLICY "Service role can do everything on site_content"
  ON site_content
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- SETUP COMPLETE!
-- =====================================================
--
-- Next steps:
-- 1. Verify in Table Editor that all 3 tables exist
-- 2. Check site_content table has 1 row with your content
-- 3. Deploy to Vercel with Supabase integration
-- 4. Login to /admin with username: admin, password: admin123
-- 5. Change the default password immediately!
--
-- Note: The default admin account will be created automatically
-- by the application on first run with these credentials:
--   Username: admin
--   Password: admin123
-- =====================================================
