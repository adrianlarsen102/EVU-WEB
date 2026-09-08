# Troubleshooting Guide

Quick solutions to common issues with EVU-WEB.

---

## 🚨 Critical Errors

### "Failed to load content" / 500 Error

**Error in console:**
```
Failed to load content: SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
GET /api/content 500 (Internal Server Error)
```

**Quick Fix:**

1. **Check health endpoint:**
   ```
   Visit: https://yourdomain.com/api/health
   ```

2. **Missing environment variables?**
   - Go to Vercel → Project → Settings → Environment Variables
   - Ensure these are set:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`
   - Redeploy after adding variables

3. **Empty database?**
   ```bash
   # Initialize content
   npm run db:init
   ```

4. **Supabase paused? (Free tier)**
   - Visit your Supabase dashboard
   - Wake up the project
   - Wait 30 seconds and refresh

---

## 🔐 Authentication Issues

### Cannot Login to Admin Panel

1. **Default credentials:**
   - Username: `admin`
   - Password: `admin123`

2. **Check admin exists:**
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM admins WHERE username = 'admin';
   ```

3. **Reset admin password:**
   ```sql
   -- Bcrypt hash for 'admin123'
   UPDATE admins
   SET password_hash = '$2b$10$rN8qJ5H5xQxKxH5xQxKxH5xQxKxH5xQxKxH5xQxKxH5xQxKxH5xQx',
       is_default_password = true
   WHERE username = 'admin';
   ```

### Session Expires Immediately

- Clear browser cookies
- Check HTTPS is enabled
- Verify `sessions` table exists

---

## 📧 Email Not Sending

### Using Resend

1. Verify API key in environment variables: `RESEND_API_KEY`
2. Check domain is verified in Resend dashboard
3. Review Resend logs for errors

### Using SMTP

1. Test credentials:
   ```bash
   # Gmail example
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password  # NOT your Gmail password!
   ```

2. Common SMTP ports:
   - 587 (TLS - recommended)
   - 465 (SSL)
   - 25 (Plain - usually blocked)

---

## 🗄️ Database Issues

### Tables Missing

Run the SQL schema:
```bash
# Location: docs/database/supabase-setup.sql
```

Or create tables manually in Supabase SQL Editor.

### Connection Timeout

1. Check Supabase project status
2. Verify service role key is correct
3. Check firewall/network settings
4. Free tier may be paused - wake it up

---

## 🚀 Deployment Issues

### Build Fails on Vercel

1. **Check build logs** for specific errors
2. **Test locally:**
   ```bash
   npm run build
   npm start
   ```
3. **Common issues:**
   - Missing dependencies → `npm install`
   - TypeScript errors → `npm run lint`
   - Node version → Should be 22.x

### Environment Variables Not Working

1. Add in Vercel dashboard (not just .env.local)
2. Set for all environments (Production, Preview, Development)
3. **Redeploy** after adding variables
4. Check spelling and formatting

---

## 🔍 Health Check

**Endpoint:** `/api/health`

**Expected response:**
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

**If not OK:**
- Check which check is failing
- Fix the corresponding issue
- Verify after changes

---

## 📊 Common HTTP Status Codes

- **401 Unauthorized** - Not logged in or session expired
- **403 Forbidden** - Logged in but insufficient permissions
- **404 Not Found** - Endpoint or resource doesn't exist
- **500 Internal Server Error** - Server-side error (check logs)
- **503 Service Unavailable** - Database or service is down

---

## 🛠️ Useful Commands

```bash
# Check health
curl https://yourdomain.com/api/health

# Initialize database content
npm run db:init

# Force reinitialize (overwrites existing)
npm run db:init:force

# Test build locally
npm run build
npm start

# Check for outdated packages
npm outdated

# Check for security vulnerabilities
npm audit

# View Vercel logs
vercel logs <deployment-url>
```

---

## 📚 Full Documentation

For detailed guides, see:
- [Deployment Checklist](docs/guides/deployment-checklist.md)
- [Installation Guide](docs/guides/installation.md)
- [Database Setup](docs/database/setup-guide.md)
- [Admin Panel Guide](docs/guides/admin-panel.md)

---

## 🆘 Still Having Issues?

1. Check the health endpoint: `/api/health`
2. Review Vercel deployment logs
3. Check Supabase logs and metrics
4. Review browser console for errors
5. Check [CLAUDE.md](CLAUDE.md) for technical details

**Need Help?**
- Open an issue on GitHub
- Check documentation in `/docs` folder
- Review error logs in Vercel dashboard

---

**Quick Links:**
- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Dashboard](https://supabase.com/dashboard)
- [Next.js Docs](https://nextjs.org/docs)

---

**Last Updated:** 2025-10-27
