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
3. Copy and paste this complete SQL:

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
3. Import your GitHub repository (`adrianlarsen102/EVU-WEB`)
4. Click **"Deploy"** (it will fail - that's expected, we need environment variables!)

### Step 4: Add Supabase Integration to Vercel

**Option A: Use Vercel Integration (Recommended - Easiest)**

1. In your Vercel project, go to **Settings** → **Integrations**
2. Click **"Browse Marketplace"**
3. Search for **"Supabase"**
4. Click **"Add Integration"**
5. Select your Vercel project
6. Select your Supabase project
7. Click **"Connect"**
8. Environment variables (`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`) are automatically added!

**Option B: Manual Environment Variables**

If the integration doesn't work:

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Service Role Key**: `eyJhbGc...` (⚠️ Use the **service_role** key, NOT the anon key!)
3. In Vercel project, go to **Settings** → **Environment Variables**
4. Add these variables:

   **Variable 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
   - Environments: Select **Production**, **Preview**, and **Development**
   - Click **"Save"**

   **Variable 2:**
   - Name: `SUPABASE_SERVICE_ROLE_KEY`
   - Value: Your service role key from Supabase API settings
   - Environments: Select **Production**, **Preview**, and **Development**
   - Click **"Save"**

### Step 5: Redeploy

1. Go to **Deployments** tab in Vercel
2. Click **•••** menu on the latest deployment
3. Click **"Redeploy"**
4. Wait for deployment to complete (~2 minutes)
5. You should see "Deployment Completed" with a green checkmark

### Step 6: Access Your Site & Admin Panel

1. Click **"Visit"** to open your deployed site
2. Your site is now live at `https://your-project.vercel.app`
3. Go to `/admin` (e.g., `https://your-project.vercel.app/admin`)
4. Login with default credentials:
   - Username: `admin`
   - Password: `admin123`
5. **IMPORTANT**: You'll be forced to change the password immediately
6. Choose a strong password and save it securely

## ✅ Verification Checklist

After deployment, verify everything works:

- [ ] Supabase project created
- [ ] SQL tables created (admins, sessions, site_content)
- [ ] Vercel project deployed successfully
- [ ] Supabase integration added (or environment variables set)
- [ ] Site homepage loads (`https://your-project.vercel.app`)
- [ ] Admin login works (`/admin`)
- [ ] Password change works (forced on first login)
- [ ] Content can be edited and saved in admin panel

## 🔧 Troubleshooting

### "500 Internal Server Error" on login

**Problem**: Database tables don't exist or weren't created properly

**Solution**:
1. Go to Supabase → **SQL Editor**
2. Run the complete SQL from Step 2 above
3. Go to Supabase → **Table Editor**
4. Verify you see 3 tables: `admins`, `sessions`, `site_content`
5. Check `site_content` table has 1 row with id=1

### "Failed to read content" or content doesn't load

**Problem**: `site_content` table is empty

**Solution**:
1. Go to Supabase → **Table Editor**
2. Open `site_content` table
3. Should have 1 row with id=1 and JSON content
4. If empty, run the INSERT statement from Step 2 SQL

### "Invalid API key" or authentication errors

**Problem**: Environment variables not set correctly

**Solution**:
1. Go to Vercel → **Settings** → **Environment Variables**
2. Verify both variables exist:
   - `NEXT_PUBLIC_SUPABASE_URL` ✓
   - `SUPABASE_SERVICE_ROLE_KEY` ✓
3. Make sure you used the **service_role** key (not anon/public key)
4. Go to Supabase → **Settings** → **API** to get the correct keys
5. After updating variables, go to **Deployments** and redeploy

### Build fails with "Module not found: @supabase/supabase-js"

**Problem**: Missing dependencies in package.json

**Solution**:
1. Check your repository has latest code with Supabase package
2. Run `git pull` to get latest changes
3. Verify `package.json` includes `@supabase/supabase-js`
4. Commit and push if needed
5. Vercel will auto-deploy

### Default admin account doesn't work

**Problem**: Admin wasn't created in database

**Solution**:
1. Go to Supabase → **Table Editor** → **admins**
2. If empty, manually insert admin:
   ```sql
   INSERT INTO admins (username, password_hash, is_default_password)
   VALUES ('admin', '$2b$10$abcdefghijklmnopqrstuvwxy', true);
   ```
3. Or redeploy - the code will auto-create the admin on first load

## 🎨 Customization

After successful deployment, customize your site through the admin panel at `/admin`:

### Server Info Tab
- **Server Name**: Your server's name
- **Title**: Welcome message
- **Subtitle**: Server description
- **Version**: Current version number
- **Status**: Online/Offline
- **Max Players**: Maximum player count
- **Uptime**: Server uptime percentage

### Features Tab
- Add/remove server features
- Use emojis for icons (🎮 🚗 💼 🏠)
- Customize descriptions

### Join Info Tab
- Update server IP or connect command
- Update Discord invite link

### Changelog Tab
- Document version updates
- Add features, improvements, and bug fixes
- Set release dates

### Forum Tab
- Create forum categories
- Set topic and post counts

## 🔒 Security Notes

✅ **Password Security**
- Default password MUST be changed on first login
- Passwords are hashed with bcrypt (10 salt rounds)
- Never stored in plain text

✅ **Environment Variables**
- Never commit `.env` files to Git (.gitignore handles this)
- Always use `SUPABASE_SERVICE_ROLE_KEY` server-side
- `NEXT_PUBLIC_SUPABASE_URL` is safe to expose

✅ **Database Security**
- Row Level Security (RLS) enabled on all tables
- Service role policies restrict access
- Expired sessions are automatically cleaned up

✅ **Supabase Security**
- Keep your database password secure
- Never share service role key
- Use anon key only for client-side operations (not used in this project)

## 📊 Database Schema

### Tables Created

**admins**
- `id` - Auto-incrementing primary key
- `username` - Unique username (default: "admin")
- `password_hash` - Bcrypt hashed password
- `is_default_password` - Boolean flag for forced password change
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

**sessions**
- `id` - Session ID (random 32-byte hex string)
- `admin_id` - Foreign key to admins table
- `created_at` - Session creation timestamp
- `expires_at` - Expiration timestamp (24 hours)

**site_content**
- `id` - Always 1 (single row constraint)
- `content` - JSONB containing all website content
- `updated_at` - Last content update timestamp

## 🆓 Free Tier Limits

**Supabase Free Tier:**
- ✅ 500MB database storage
- ✅ 1GB file storage
- ✅ 2GB bandwidth per month
- ✅ Unlimited API requests
- ✅ 50,000 monthly active users
- ✅ Daily automated backups

**Vercel Free Tier:**
- ✅ 100GB bandwidth per month
- ✅ Unlimited deployments
- ✅ Automatic HTTPS
- ✅ Custom domains
- ✅ Serverless functions

**Perfect for small to medium FiveM servers!**

## 🚀 Next Steps

After successful deployment:

1. **Custom Domain**: Add your own domain in Vercel settings
2. **Test Everything**: Try all admin panel features
3. **Customize Content**: Update all sections with your server info
4. **Monitor Usage**: Check Supabase dashboard for database usage
5. **Set Up Backups**: Supabase auto-backs up daily, but export manually for safety
6. **Analytics**: Consider enabling Vercel Analytics
7. **Share**: Give your players the site URL!

## 📚 Helpful Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Project README](README.md)

## 💡 Tips

- **Bookmark your admin panel**: `https://your-site.vercel.app/admin`
- **Save your Supabase password**: You'll need it for database access
- **Monitor your free tier**: Check Supabase and Vercel dashboards monthly
- **Regular backups**: Export your database occasionally from Supabase
- **Update content regularly**: Keep your changelog and features fresh

## ✨ You're Done!

Your EVU FiveM server website is now live and fully functional. Players can visit your site, and you can manage all content through the admin panel without touching any code!

**Default Admin Login:**
- URL: `https://your-site.vercel.app/admin`
- Username: `admin`
- Password: `admin123` (change immediately!)

Enjoy your new website! 🎉
