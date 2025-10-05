# Deploying EVU Website with Supabase + Vercel

Complete guide for deploying your EVU FiveM server website using Supabase (PostgreSQL database) and Vercel (hosting).

## 📋 Overview

- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel (Serverless)
- **Authentication**: Custom with bcrypt
- **Content Storage**: Supabase JSONB
- **Free Tier**: 500MB database, unlimited API requests

## 🚀 Deployment Steps

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New project"**
3. Choose organization or create new one
4. Fill in project details:
   - **Name**: `evu-web` (or your preference)
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"** (takes ~2 minutes)

### Step 2: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Paste this SQL:

```sql
-- Create admins table
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_default_password BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sessions table
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  admin_id INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_sessions_admin_id ON sessions(admin_id);

-- Create content table for website content storage
CREATE TABLE site_content (
  id INTEGER PRIMARY KEY DEFAULT 1,
  content JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- Insert default content
INSERT INTO site_content (id, content) VALUES (1, '{
  "serverInfo": {
    "name": "EVU",
    "title": "Welcome to EVU",
    "subtitle": "Premium FiveM Roleplay Server",
    "version": "v1.0.0"
  },
  "serverStatus": {
    "isOnline": true,
    "maxPlayers": 64,
    "uptime": "99.9%"
  },
  "features": [
    {
      "icon": "🚗",
      "title": "Custom Vehicles",
      "description": "Hundreds of custom vehicles to choose from"
    },
    {
      "icon": "💼",
      "title": "Realistic Jobs",
      "description": "Work as a cop, medic, mechanic, and more"
    },
    {
      "icon": "🏠",
      "title": "Housing System",
      "description": "Buy and customize your own properties"
    }
  ],
  "joinInfo": {
    "serverIP": "connect fivem.server.ip",
    "discordLink": "https://discord.gg/yourserver"
  },
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2024-01-01",
      "changes": {
        "features": ["Initial release", "Core systems implemented"],
        "improvements": [],
        "fixes": []
      }
    }
  ],
  "forumCategories": [
    {
      "name": "General Discussion",
      "description": "General server talk",
      "topics": 42,
      "posts": 328
    }
  ]
}'::jsonb);

-- Enable Row Level Security (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (bypass RLS)
CREATE POLICY "Service role can do everything on admins"
  ON admins
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can do everything on sessions"
  ON sessions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can do everything on site_content"
  ON site_content
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
```

4. Click **"Run"** (bottom right)
5. Verify success - you should see "Success. No rows returned"

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Click **"Deploy"** (it will fail - that's expected!)

### Step 4: Add Supabase Integration to Vercel

**Option A: Use Vercel Integration (Recommended)**

1. In your Vercel project, go to **Settings** → **Integrations**
2. Click **"Browse Marketplace"**
3. Search for **"Supabase"**
4. Click **"Add Integration"**
5. Select your Vercel project
6. Select your Supabase project
7. Click **"Connect"**
8. Environment variables are automatically added!

**Option B: Manual Environment Variables**

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Service Role Key**: `eyJhbGc...` (secret key, not anon key!)
3. In Vercel project, go to **Settings** → **Environment Variables**
4. Add these variables:
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase project URL
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: Your service role key (keep this secret!)
5. Select **Production**, **Preview**, and **Development**
6. Click **"Save"**

### Step 5: Redeploy

1. Go to **Deployments** tab
2. Click **•••** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (~2 minutes)

### Step 6: Access Your Site

1. Click **"Visit"** to open your deployed site
2. Go to `/admin` to access admin panel
3. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
4. **IMPORTANT**: You'll be forced to change the password immediately

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] SQL tables created (admins, sessions, site_content)
- [ ] Vercel project deployed
- [ ] Supabase integration added (or environment variables set)
- [ ] Site is accessible
- [ ] Admin login works
- [ ] Password change works
- [ ] Content can be saved

## 🔧 Troubleshooting

### "500 Internal Server Error" on login

**Problem**: Database tables don't exist

**Solution**:
1. Go to Supabase SQL Editor
2. Run the SQL from Step 2 above
3. Verify tables exist in **Table Editor**

### "Failed to read content"

**Problem**: `site_content` table is empty

**Solution**:
1. Go to Supabase **Table Editor**
2. Open `site_content` table
3. Should have 1 row with id=1
4. If empty, run the INSERT statement from Step 2

### Environment variables not set

**Problem**: Vercel can't connect to Supabase

**Solution**:
1. Go to Vercel → **Settings** → **Environment Variables**
2. Verify both variables are set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Redeploy after adding variables

### Build fails with "Module not found"

**Problem**: Missing dependencies

**Solution**:
1. Check `package.json` includes:
   - `@supabase/supabase-js`
   - `bcrypt`
   - `next`
   - `react`
   - `react-dom`
2. Commit and push changes
3. Vercel will auto-deploy

## 🎨 Customization

After deployment, customize your site through the admin panel:

1. **Server Info**: Name, title, version
2. **Server Status**: Online/offline, max players, uptime
3. **Features**: Add/remove server features with icons
4. **Join Info**: Update server IP and Discord link
5. **Changelog**: Document updates and patches
6. **Forum**: Manage forum categories

## 🔒 Security Notes

- ✅ Never commit `.env` files to Git
- ✅ Always use `SUPABASE_SERVICE_ROLE_KEY` (not anon key)
- ✅ Change default admin password immediately
- ✅ Keep your Supabase password secure
- ✅ Row Level Security (RLS) is enabled on all tables

## 📊 Database Schema

### admins
- `id` - Serial primary key
- `username` - Unique username
- `password_hash` - Bcrypt hashed password
- `is_default_password` - Boolean flag
- `created_at` - Timestamp
- `updated_at` - Timestamp

### sessions
- `id` - Session ID (primary key)
- `admin_id` - Foreign key to admins
- `created_at` - Timestamp
- `expires_at` - Expiration timestamp

### site_content
- `id` - Always 1 (single row constraint)
- `content` - JSONB containing all site content
- `updated_at` - Timestamp

## 🆓 Free Tier Limits

**Supabase Free Tier:**
- 500MB database storage
- 1GB file storage
- 2GB bandwidth
- Unlimited API requests
- 50,000 monthly active users

**Vercel Free Tier:**
- 100GB bandwidth
- Unlimited deployments
- Automatic HTTPS
- Custom domains

## 🚀 Next Steps

1. **Custom Domain**: Add your domain in Vercel settings
2. **Analytics**: Enable Vercel Analytics
3. **Monitoring**: Check Supabase logs regularly
4. **Backups**: Supabase creates daily backups automatically
5. **Updates**: Edit content through admin panel at `/admin`

---

**Need Help?** Check the main [README.md](README.md) for more information.
