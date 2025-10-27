# Deployment Checklist

Complete guide for deploying EVU-WEB to production and troubleshooting common issues.

---

## Pre-Deployment Checklist

### 1. Environment Variables Configuration

**Required Variables:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- ✅ `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (keep secret!)

**Optional Variables:**
- `EMAIL_PROVIDER` - Email provider (resend or smtp)
- `RESEND_API_KEY` - Resend API key (if using Resend)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - SMTP settings (if using SMTP)
- `EMAIL_FROM` - From email address
- `ADMIN_EMAIL` - Admin notification email
- `NEXT_PUBLIC_SITE_URL` - Your site URL (e.g., https://yourdomain.com)

**Vercel Configuration:**
1. Go to Project Settings → Environment Variables
2. Add all required variables
3. Set them for Production, Preview, and Development environments
4. **Never commit `.env.local` to Git!**

### 2. Supabase Database Setup

**Tables Required:**
- `admins` - User accounts and authentication
- `sessions` - User sessions
- `site_content` - Website content (JSONB)
- `user_roles` - RBAC roles
- `forum_categories` - Forum categories
- `forum_topics` - Forum topics
- `forum_comments` - Forum comments
- `support_tickets` - Support tickets
- `support_ticket_replies` - Ticket replies
- `email_settings` - Email configuration
- `platform_metrics` - Performance metrics
- `audit_logs` - Audit logging

**Setup Instructions:**
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `docs/database/supabase-setup.sql`
3. Enable Row Level Security (RLS) policies
4. Copy your project URL and service role key to environment variables

### 3. Database Content Initialization

After deploying, initialize the database content:

```bash
# Local setup
npm run db:init

# Force overwrite existing content
npm run db:init:force
```

**Alternative: Manual Initialization**
1. Visit `/api/health` to check database connection
2. Login to Supabase Dashboard
3. Run the following SQL:

```sql
INSERT INTO site_content (id, content)
VALUES (1, '{
  "general": {
    "websiteTitle": "EVU Gaming Network",
    "welcomeMessage": "Welcome to EVU Gaming",
    "discordLink": "https://discord.gg/yourserver"
  },
  "servers": {
    "minecraft": {
      "enabled": true,
      "name": "EVU Minecraft",
      "serverIP": "play.evu.com",
      "port": "25565",
      "isOnline": true,
      "currentPlayers": 0,
      "maxPlayers": 100,
      "uptime": "99.9%",
      "version": "1.20.4",
      "features": []
    },
    "fivem": {
      "enabled": true,
      "name": "EVU Roleplay",
      "serverIP": "connect cfx.re/join/xxxxx",
      "isOnline": true,
      "currentPlayers": 0,
      "maxPlayers": 64,
      "uptime": "99.5%",
      "version": "QBCore 1.0",
      "features": []
    }
  },
  "changelog": [],
  "forumCategories": []
}'::jsonb)
ON CONFLICT (id) DO NOTHING;
```

### 4. First-Time Setup

After deployment:

1. **Visit `/api/health`** - Check system health
   - Should return status: "ok"
   - Check that database is connected
   - Verify environment variables

2. **Visit `/admin`** - Admin panel
   - Default login: `admin` / `admin123`
   - **IMMEDIATELY change the password!**
   - Configure site settings
   - Add server information

3. **Configure RBAC** - Roles & Permissions
   - Visit Admin Panel → Roles tab
   - Click "Initialize Default Roles"
   - Customize permissions as needed

4. **Setup Email** (Optional)
   - Visit Admin Panel → Email Settings
   - Choose provider (Resend or SMTP)
   - Configure credentials
   - Send test email

---

## Troubleshooting Common Issues

### Issue: "Failed to load content" / 500 Errors

**Symptoms:**
- Homepage shows "Failed to load content"
- Console errors: `SyntaxError: Unexpected token '<', "<!DOCTYPE "...`
- `/api/content` returns 500 error

**Causes & Solutions:**

1. **Missing Environment Variables**
   ```bash
   # Check health endpoint
   curl https://yourdomain.com/api/health
   ```
   - If `env.status` is "error", add environment variables in Vercel
   - Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

2. **Empty Database**
   ```bash
   # Initialize content
   npm run db:init
   ```
   - Or insert content via Supabase Dashboard
   - Check `site_content` table has a row with id=1

3. **Database Connection Error**
   - Verify Supabase project is active
   - Check service role key is correct
   - Test connection from Supabase Dashboard

4. **Timeout Issues**
   - Supabase may be in "paused" state (free tier)
   - Wake it up by visiting Supabase Dashboard
   - Consider upgrading to Pro plan for production

### Issue: Authentication Not Working

**Symptoms:**
- Cannot login to admin panel
- Session expires immediately
- 401 Unauthorized errors

**Solutions:**

1. **Check Default Admin Exists**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM admins WHERE username = 'admin';
   ```
   - If empty, run `lib/database.js` initialization
   - Or manually insert admin user

2. **Session Table Issues**
   ```sql
   -- Clear expired sessions
   DELETE FROM sessions WHERE expires_at < NOW();
   ```

3. **Cookie Issues**
   - Ensure domain is correct
   - Check browser allows cookies
   - Verify HTTPS is enabled (required for Strict cookies)

### Issue: 401 Error on Support Tickets

**Symptoms:**
- Console: `GET /api/support/tickets 401 (Unauthorized)`
- Cannot view tickets

**Solution:**
- This is expected behavior for logged-out users
- Login to view tickets
- If logged in and still getting 401, check session validation

### Issue: Vercel Deployment Fails

**Symptoms:**
- Build fails with errors
- Deployment times out

**Solutions:**

1. **Check Build Logs**
   - Look for missing dependencies
   - Check for syntax errors
   - Verify Node version (should be 22.x)

2. **Common Build Errors**
   ```bash
   # Missing dependencies
   npm install

   # TypeScript errors
   npm run lint

   # Build test locally
   npm run build
   ```

3. **Timeout During Build**
   - Reduce bundle size
   - Check for infinite loops in getStaticProps
   - Optimize images

### Issue: Email Not Sending

**Symptoms:**
- Test email fails
- No notifications received

**Solutions:**

1. **Resend API**
   - Verify API key is correct
   - Check domain is verified in Resend
   - Review Resend dashboard for errors

2. **SMTP**
   - Test credentials with external tool
   - Check SMTP port (587 for TLS, 465 for SSL)
   - Verify firewall allows outbound SMTP

3. **Check Email Settings**
   ```bash
   # Test endpoint
   curl https://yourdomain.com/api/email-settings
   ```

### Issue: Forum Not Loading

**Symptoms:**
- Forum page is empty
- Categories don't appear

**Solution:**
1. Check `site_content` table has `forumCategories` array
2. Initialize default categories via admin panel
3. Verify database query is not timing out

### Issue: Performance Issues

**Symptoms:**
- Slow page loads
- Timeouts
- High server usage

**Solutions:**

1. **Enable Caching**
   - API routes already have cache headers
   - Use CDN for static assets
   - Enable Vercel Edge Network

2. **Database Optimization**
   - Add indexes to frequently queried columns
   - Review slow queries in Supabase
   - Consider connection pooling

3. **Reduce Bundle Size**
   ```bash
   # Analyze bundle
   npm run build

   # Look for large dependencies
   # Consider code splitting
   ```

---

## Health Monitoring

### Health Check Endpoint

**URL:** `/api/health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-27T12:00:00.000Z",
  "checks": {
    "env": {
      "supabaseUrl": true,
      "supabaseKey": true,
      "status": "ok"
    },
    "database": {
      "status": "ok",
      "connected": true
    }
  }
}
```

**Status Codes:**
- `200` - All systems operational
- `503` - Degraded (some checks failing)
- `500` - Error (critical failure)

### Monitoring Checklist

**Daily:**
- ✅ Check `/api/health` endpoint
- ✅ Monitor error logs in Vercel
- ✅ Review Supabase usage metrics

**Weekly:**
- ✅ Check database size and connections
- ✅ Review performance metrics
- ✅ Audit user accounts and sessions

**Monthly:**
- ✅ Update dependencies (`npm outdated`)
- ✅ Review security vulnerabilities (`npm audit`)
- ✅ Backup database
- ✅ Test disaster recovery

---

## Security Checklist

### Before Going Live

- [ ] Change default admin password
- [ ] Enable HTTPS (automatic on Vercel)
- [ ] Configure CORS if needed
- [ ] Review Content Security Policy
- [ ] Enable rate limiting (Vercel provides this)
- [ ] Setup monitoring and alerts
- [ ] Review and restrict database permissions
- [ ] Enable Supabase Row Level Security (RLS)
- [ ] Configure backup strategy
- [ ] Setup domain and SSL certificate

### Regular Maintenance

- [ ] Review audit logs weekly
- [ ] Update dependencies monthly
- [ ] Rotate API keys quarterly
- [ ] Review user permissions
- [ ] Test backup restoration
- [ ] Monitor for suspicious activity

---

## Rollback Procedure

If deployment fails:

1. **Revert in Vercel**
   - Go to Deployments tab
   - Find last working deployment
   - Click "Promote to Production"

2. **Rollback Database**
   ```sql
   -- Restore from backup
   -- Or revert specific changes
   ```

3. **Clear Cache**
   - Purge Vercel cache
   - Clear CDN cache if applicable

4. **Verify Health**
   - Check `/api/health`
   - Test critical paths
   - Monitor error rates

---

## Performance Optimization

### Recommended Settings

**Vercel:**
- Enable Edge Network
- Configure caching headers (already done)
- Use Image Optimization
- Enable Speed Insights

**Supabase:**
- Enable connection pooling
- Add database indexes
- Use RLS policies efficiently
- Monitor query performance

**Next.js:**
- Use static generation where possible
- Optimize images with next/image
- Minimize client-side JavaScript
- Enable compression (already enabled)

---

## Getting Help

**Documentation:**
- [Next.js Docs](https://nextjs.org/docs)
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)

**Support:**
- Check `/api/health` for diagnostics
- Review Vercel deployment logs
- Check Supabase logs
- Review GitHub issues

**Common Commands:**
```bash
# Check health
curl https://yourdomain.com/api/health

# Initialize database
npm run db:init

# Test build locally
npm run build && npm start

# Check logs
vercel logs <deployment-url>
```

---

**Last Updated:** 2025-10-27
**Version:** 2.17.1
