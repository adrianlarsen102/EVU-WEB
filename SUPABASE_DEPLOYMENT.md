# Deploying with Supabase Database (Alternative)

Supabase is a powerful PostgreSQL-based alternative to Turso with generous free tier and additional features like authentication, storage, and real-time subscriptions.

## 📋 Why Choose Supabase?

### Advantages
- ✅ **PostgreSQL** - More powerful than SQLite for complex queries
- ✅ **Built-in Auth** - Can replace custom authentication (optional)
- ✅ **Real-time** - Subscribe to database changes
- ✅ **Storage** - Built-in file storage for images/videos
- ✅ **Free Tier** - 500MB database, 1GB file storage, 2GB bandwidth
- ✅ **Auto Backups** - Daily backups included
- ✅ **Dashboard** - Powerful database management UI

### When to Use Supabase vs Turso

**Choose Supabase if you want:**
- PostgreSQL instead of SQLite
- Built-in authentication system
- File storage capabilities
- Real-time features
- More complex database operations

**Choose Turso if you want:**
- Stay with SQLite syntax
- Simpler setup
- Edge replication
- Lower latency globally

## 🚀 Migration Guide

### Step 1: Install Supabase Client

Update `package.json`:

```json
{
  "dependencies": {
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "bcrypt": "^5.1.1"
  }
}
```

Then run:
```bash
npm install
```

### Step 2: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New project"**
3. Choose organization or create new one
4. Fill in project details:
   - **Name**: `evu-admin`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to your users
5. Click **"Create new project"** (takes ~2 minutes)

### Step 3: Get Connection Details

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Project API Key** (anon/public): `eyJhbGc...`
   - **Service Role Key**: `eyJhbGc...` (keep secret!)

### Step 4: Create Database Schema

1. In Supabase dashboard, go to **SQL Editor**
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

-- Create index on sessions for faster lookups
CREATE INDEX idx_sessions_expires ON sessions(expires_at);
CREATE INDEX idx_sessions_admin_id ON sessions(admin_id);

-- Enable Row Level Security (RLS)
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

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
```

4. Click **"Run"**

### Step 5: Update Database Code

Create a new file `lib/database-supabase.js`:

```javascript
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

let initialized = false;

async function initializeDatabase() {
  if (initialized) return;

  try {
    // Check if default admin exists
    const { data: admins, error } = await supabase
      .from('admins')
      .select('id')
      .limit(1);

    if (error) throw error;

    if (!admins || admins.length === 0) {
      // Create default admin with password "admin123"
      const defaultPassword = 'admin123';
      const passwordHash = bcrypt.hashSync(defaultPassword, SALT_ROUNDS);

      const { error: insertError } = await supabase
        .from('admins')
        .insert({
          username: 'admin',
          password_hash: passwordHash,
          is_default_password: true
        });

      if (insertError) throw insertError;

      console.log('Created default admin account. Username: admin, Password: admin123');
      console.log('⚠️  IMPORTANT: You will be prompted to change this password on first login!');
    }

    // Clean up expired sessions
    await supabase
      .from('sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());

    initialized = true;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

async function verifyPassword(username, password) {
  await initializeDatabase();

  try {
    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !admin) {
      return null;
    }

    const isValid = bcrypt.compareSync(password, admin.password_hash);

    if (isValid) {
      return {
        id: admin.id,
        username: admin.username,
        isDefaultPassword: admin.is_default_password === true
      };
    }

    return null;
  } catch (error) {
    console.error('Verify password error:', error);
    return null;
  }
}

async function changePassword(adminId, newPassword) {
  await initializeDatabase();

  try {
    const passwordHash = bcrypt.hashSync(newPassword, SALT_ROUNDS);

    const { error } = await supabase
      .from('admins')
      .update({
        password_hash: passwordHash,
        is_default_password: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', adminId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Change password error:', error);
    return false;
  }
}

async function createSession(adminId) {
  await initializeDatabase();

  try {
    const sessionId = require('crypto').randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const { error } = await supabase
      .from('sessions')
      .insert({
        id: sessionId,
        admin_id: adminId,
        expires_at: expiresAt.toISOString()
      });

    if (error) throw error;

    return sessionId;
  } catch (error) {
    console.error('Create session error:', error);
    return null;
  }
}

async function validateSession(sessionId) {
  await initializeDatabase();

  try {
    const { data: session, error } = await supabase
      .from('sessions')
      .select(`
        *,
        admins (
          id,
          username,
          is_default_password
        )
      `)
      .eq('id', sessionId)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !session) {
      return null;
    }

    return {
      adminId: session.admin_id,
      username: session.admins.username,
      isDefaultPassword: session.admins.is_default_password === true
    };
  } catch (error) {
    console.error('Validate session error:', error);
    return null;
  }
}

async function destroySession(sessionId) {
  await initializeDatabase();

  try {
    await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId);
  } catch (error) {
    console.error('Destroy session error:', error);
  }
}

async function cleanupExpiredSessions() {
  try {
    await supabase
      .from('sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());
  } catch (error) {
    console.error('Cleanup sessions error:', error);
  }
}

// Initialize database on first import
initializeDatabase().catch(console.error);

// Cleanup expired sessions every hour
setInterval(() => {
  cleanupExpiredSessions().catch(console.error);
}, 60 * 60 * 1000);

module.exports = {
  verifyPassword,
  changePassword,
  createSession,
  validateSession,
  destroySession
};
```

### Step 6: Update Environment Variables

Create `.env.local` for local development:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...your-service-role-key
```

**⚠️ Important:**
- `NEXT_PUBLIC_SUPABASE_URL` - Public, safe to expose
- `SUPABASE_SERVICE_ROLE_KEY` - **KEEP SECRET!** Never expose to client

### Step 7: Switch to Supabase Database

Rename the current database file:
```bash
mv lib/database.js lib/database-turso.js
mv lib/database-supabase.js lib/database.js
```

Or manually update `lib/database.js` with the Supabase code above.

### Step 8: Test Locally

```bash
npm install
npm run dev
```

Visit `http://localhost:3000/admin` and test login.

### Step 9: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com/new)
2. Import your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://xxxxx.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGc...`
4. Click **"Deploy"**

## 🎯 Advanced Features (Optional)

### Use Supabase Auth Instead of Custom

Supabase has built-in authentication. To use it:

1. **Enable Email Auth** in Supabase dashboard
2. Install auth helpers:
   ```bash
   npm install @supabase/auth-helpers-nextjs
   ```
3. Replace custom auth with Supabase Auth
4. Much simpler - no password hashing needed!

### Add File Storage

Store images for your server:

```javascript
// Upload server logo
const { data, error } = await supabase
  .storage
  .from('server-assets')
  .upload('logo.png', file);
```

### Real-time Updates

Subscribe to content changes:

```javascript
const channel = supabase
  .channel('content-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'admins' },
    (payload) => console.log('Change!', payload)
  )
  .subscribe();
```

## 💰 Pricing Comparison

### Supabase Free Tier
- 500 MB database space
- 1 GB file storage
- 2 GB bandwidth
- 50 MB file uploads
- 500K Edge Function invocations

### Supabase Pro ($25/month)
- 8 GB database space
- 100 GB file storage
- 250 GB bandwidth
- 5 GB file uploads
- 2M Edge Function invocations

## 🔐 Security Best Practices

### Row Level Security (RLS)

Already enabled in setup! This ensures:
- Only your server can access the database
- Service role key required for operations
- Extra layer of protection

### API Keys

- **Anon/Public Key**: Safe to expose (used for client-side)
- **Service Role Key**: NEVER expose! (used server-side only)

### Environment Variables

Never commit these to git:
```
SUPABASE_SERVICE_ROLE_KEY=...  # SECRET!
```

## 🐛 Troubleshooting

### "Invalid API key"
- Check environment variables are set correctly
- Verify you're using the **service role key** (not anon key)

### "Row level security" errors
- Make sure RLS policies are created
- Use service role key for server-side operations

### Connection timeout
- Check Supabase project is not paused (free tier pauses after inactivity)
- Restart project in Supabase dashboard

### Build fails on Vercel
- Ensure all environment variables are added
- Check package.json has `@supabase/supabase-js`

## 📊 Supabase Dashboard Features

### Database
- Visual table editor
- SQL query editor
- Automated backups
- Database logs

### Authentication
- Email/password login
- OAuth providers (Google, GitHub, etc.)
- Magic links
- User management

### Storage
- File upload/download
- Image transformations
- CDN delivery
- Access policies

### API
- Auto-generated REST API
- Auto-generated GraphQL API
- Real-time subscriptions

## 🔄 Migrating from Turso to Supabase

If you started with Turso and want to switch:

1. **Export data from Turso:**
   ```bash
   turso db shell evu-admin-db
   .output backup.sql
   .dump admins
   .dump sessions
   .quit
   ```

2. **Import to Supabase:**
   - Go to SQL Editor in Supabase
   - Paste exported SQL
   - Run query

3. **Update code** (use database-supabase.js)
4. **Deploy!**

## ✅ Supabase Deployment Checklist

- [ ] Created Supabase project
- [ ] Created database tables (admins, sessions)
- [ ] Enabled RLS and created policies
- [ ] Got Project URL and Service Role Key
- [ ] Updated `lib/database.js` with Supabase code
- [ ] Updated `package.json` with `@supabase/supabase-js`
- [ ] Added environment variables to Vercel
- [ ] Tested locally
- [ ] Deployed to Vercel
- [ ] Tested admin login on production

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase + Next.js Guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🎉 Summary

Supabase offers a more feature-rich alternative to Turso:
- ✅ PostgreSQL database (more powerful than SQLite)
- ✅ Built-in authentication (optional)
- ✅ File storage included
- ✅ Real-time capabilities
- ✅ Free tier is generous
- ✅ Great developer experience

**Both are excellent choices!** Pick based on your needs:
- **Simple SQLite syntax?** → Use Turso
- **More features and PostgreSQL?** → Use Supabase

Your EVU website works great with either! 🚀
