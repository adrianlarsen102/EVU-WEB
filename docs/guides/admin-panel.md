# Admin Panel Setup Guide

> **Note:** This project uses **Next.js + Supabase**, not the legacy Express server.

## Prerequisites

1. **Node.js 22.x LTS** (or later)
   - Download from https://nodejs.org/

2. **Supabase Account**
   - Sign up at https://supabase.com
   - Create a new project

## Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**

   Create `.env.local` in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   CSRF_SECRET=generate_a_strong_random_secret_here
   ```

   Generate CSRF_SECRET:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Initialize Database**
   ```bash
   npm run db:init
   ```

## Running the Server

**Development mode** (with hot reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm run build
npm start
```

The server will run on http://localhost:3000

## Accessing the Admin Panel

1. Open your browser and go to: **http://localhost:3000/admin** (or `/profile` to login)

2. **Default credentials:**
   - Username: `admin`
   - Password: `admin123`

3. ⚠️ **CRITICAL:** You will be forced to change the password on first login

## Using the Admin Panel

The admin panel has 5 main sections:

### 1. Server Info
- Change server name, title, subtitle
- Update server version
- Set server status (Online/Offline)
- Adjust max players and uptime

### 2. Features
- Add/remove server features shown on homepage
- Edit icons, titles, and descriptions
- Drag to reorder (manual editing)

### 3. Join Info
- Update server IP/connect command
- Change Discord invite link

### 4. Changelog
- Add new version entries
- Edit existing changelog entries
- Remove old entries
- Each entry can have features, improvements, and bug fixes

### 5. Forum
- Add/edit forum categories
- Update topic and post counts
- Change category descriptions

## Important Files

- `pages/admin.js` - Admin panel React component
- `pages/api/` - Next.js API routes (serverless functions)
- `lib/database.js` - Supabase database client
- `lib/auth.js` - Authentication system
- `lib/csrf.js` - CSRF protection
- `lib/auditLog.js` - Audit logging system

## Security Features

✅ **Built-in security:**
1. **Bcrypt password hashing** (10 salt rounds)
2. **CSRF protection** for all state-changing operations
3. **Session-based authentication** (24-hour expiry)
4. **Rate limiting** on all endpoints
5. **Comprehensive audit logging** with Discord notifications
6. **Role-Based Access Control (RBAC)** with granular permissions
7. **Input validation & sanitization** to prevent XSS/SQL injection

⚠️ **Before going live:**
1. Change default admin password (`admin123`) immediately
2. Set strong `CSRF_SECRET` environment variable (32+ chars)
3. Configure Supabase Row-Level Security (RLS) policies
4. Enable HTTPS in production (automatic on Vercel)

## How It Works

1. **Content Storage:** All content stored in Supabase `site_content` table
2. **Authentication:** Session-based auth with Supabase database
3. **API Routes:** Next.js serverless functions in `pages/api/`
4. **Real-time Updates:** Changes saved to database, visible immediately
5. **Caching:** Intelligent caching with stale-while-revalidate

## Troubleshooting

**Can't access admin panel:**
- Make sure server is running (`npm run dev`)
- Check browser console for errors
- Verify correct URL: http://localhost:3000/admin
- Check environment variables are set in `.env.local`

**Login fails:**
- Default credentials: `admin` / `admin123`
- Check Supabase connection (run `npm run db:init`)
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct

**Changes not appearing:**
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for errors
- Check Supabase `site_content` table was updated

**Database errors:**
- Verify Supabase credentials in `.env.local`
- Run database initialization: `npm run db:init`
- Check Supabase dashboard for connection issues

**CSRF token errors:**
- Set `CSRF_SECRET` in `.env.local`
- Refresh the admin panel page
- Clear browser cookies and login again
- Run `npm install` to install dependencies
- Check if port 3000 is already in use
