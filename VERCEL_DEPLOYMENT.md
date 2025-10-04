# Deploying to Vercel with Turso Database

This guide will walk you through deploying your EVU website to Vercel using Turso as your database.

## 📋 Prerequisites

- GitHub account with your code pushed
- Vercel account (free tier works great)
- 10-15 minutes

## 🚀 Quick Deployment Steps

### Step 1: Create Turso Database

#### Option A: Via Vercel Marketplace (Easiest)

1. Go to [Vercel Marketplace - Turso](https://vercel.com/marketplace/tursocloud)
2. Click **"Add Integration"**
3. Select your Vercel account
4. Follow the prompts to create a new Turso database
5. Name your database (e.g., `evu-admin-db`)
6. Copy the database URL and auth token (you'll need these)

#### Option B: Direct from Turso

1. Go to [turso.tech](https://turso.tech) and sign up
2. Click **"Create Database"**
3. Name your database (e.g., `evu-admin-db`)
4. Choose a location closest to your users
5. Click **"Create"**
6. Run these commands to get your credentials:
   ```bash
   # Install Turso CLI
   curl -sSfL https://get.tur.so/install.sh | bash

   # Login
   turso auth login

   # Get database URL
   turso db show evu-admin-db --url

   # Create auth token
   turso db tokens create evu-admin-db
   ```

### Step 2: Deploy to Vercel

1. **Go to [vercel.com](https://vercel.com/new)**

2. **Import your GitHub repository**
   - Click "Import Project"
   - Select "Import Git Repository"
   - Choose `adrianlarsen102/EVU-WEB`

3. **Configure environment variables**
   - Click "Environment Variables"
   - Add these two variables:

   | Name | Value |
   |------|-------|
   | `TURSO_DATABASE_URL` | `libsql://your-database.turso.io` |
   | `TURSO_AUTH_TOKEN` | `your-auth-token-here` |

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete
   - Your site will be live at `https://your-project.vercel.app`

### Step 3: First Login

1. Visit your deployed site: `https://your-project.vercel.app/admin`
2. Login with default credentials:
   - Password: `admin123`
3. **Change password immediately** (forced by the system)
4. Start managing your website!

## 🔧 Detailed Configuration

### Environment Variables Explained

**`TURSO_DATABASE_URL`**
- Format: `libsql://your-database-name.turso.io`
- This is your Turso database connection string
- Example: `libsql://evu-admin-db-yourname.turso.io`

**`TURSO_AUTH_TOKEN`**
- This is a secure token for authenticating with your database
- Looks like: `eyJhbGc...` (long string)
- Keep this secret!

### Adding Environment Variables in Vercel

1. Go to your project dashboard on Vercel
2. Click "Settings" tab
3. Click "Environment Variables" in sidebar
4. For each variable:
   - Enter the name (e.g., `TURSO_DATABASE_URL`)
   - Enter the value
   - Select all environments (Production, Preview, Development)
   - Click "Save"

## 🔄 Updating Your Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
git add .
git commit -m "Updated server info"
git push
```

Your site will rebuild automatically in ~2 minutes.

### Manual Deployments

1. Go to your project on Vercel
2. Click "Deployments" tab
3. Click "..." menu on latest deployment
4. Click "Redeploy"

## 🧪 Testing Your Deployment

### 1. Check Website Pages

- Homepage: `https://your-project.vercel.app`
- Join page: `https://your-project.vercel.app/join`
- Forum: `https://your-project.vercel.app/forum`
- Changelog: `https://your-project.vercel.app/changelog`

### 2. Test Admin Panel

- Go to: `https://your-project.vercel.app/admin`
- Login with password: `admin123`
- Change password when prompted
- Try editing server info
- Save changes
- Check if changes appear on homepage

### 3. Verify Database

In Turso dashboard:
- You should see 2 tables: `admins` and `sessions`
- `admins` table should have 1 row (your admin account)

## 🐛 Troubleshooting

### Build Fails

**Error: Missing environment variables**
- Solution: Add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` in Vercel settings

**Error: Module not found '@libsql/client'**
- Solution: Make sure `package.json` includes `@libsql/client`
- Redeploy to install missing dependencies

### Runtime Errors

**Error: Database connection failed**
- Check environment variables are set correctly
- Verify database URL format: `libsql://...`
- Ensure auth token is valid (regenerate if needed)

**Error: Unable to authenticate**
- Database might not be initialized
- Redeploy to trigger database setup
- Check Vercel logs for errors

### Admin Panel Issues

**Can't login**
- Try resetting by redeploying
- Check Vercel logs for errors
- Verify database connection

**Password change not working**
- Check browser console for errors
- Ensure you're using HTTPS (required for cookies)

## 📊 Monitoring

### View Logs

1. Go to your project on Vercel
2. Click "Deployments" tab
3. Click on latest deployment
4. Click "Functions" to see API logs
5. Look for errors or database connection issues

### Database Usage

Check your Turso dashboard:
- Storage used
- Number of queries
- Active connections

Free tier includes:
- 9 GB storage
- 500M row reads/month
- Unlimited databases

## 💰 Pricing

### Vercel
- **Free tier**: Perfect for this project
  - 100 GB bandwidth/month
  - Unlimited deployments
  - Automatic HTTPS

### Turso
- **Free tier**: More than enough
  - 9 GB storage
  - 500M row reads
  - Multiple databases

- **Paid tier** ($4.99/month):
  - 50 GB storage
  - 1B row reads
  - Priority support

## 🔐 Security Best Practices

### 1. Change Default Password
✅ Forced on first login
✅ System won't let you skip this

### 2. Protect Environment Variables
❌ Never commit `.env` files
✅ Use Vercel's environment variable settings
✅ Rotate auth tokens periodically

### 3. Enable HTTPS
✅ Vercel provides this automatically
✅ Required for secure cookies

### 4. Monitor Access
- Check Vercel logs regularly
- Monitor Turso database activity
- Watch for suspicious login attempts

## 🌍 Custom Domain

### Add Your Domain

1. Buy a domain (GoDaddy, Namecheap, etc.)
2. In Vercel project settings:
   - Click "Domains"
   - Enter your domain (e.g., `evuserver.com`)
   - Follow DNS configuration instructions
3. Wait 24-48 hours for DNS propagation
4. Your site will be available at your custom domain!

## 🔄 Local Development

To test locally with Turso:

1. **Copy environment variables**
   ```bash
   cp .env.example .env.local
   ```

2. **Add your Turso credentials**
   ```
   TURSO_DATABASE_URL=libsql://your-db.turso.io
   TURSO_AUTH_TOKEN=your-token
   ```

3. **Run development server**
   ```bash
   npm install
   npm run dev
   ```

4. **Test at** `http://localhost:3000`

### Use Local Database (Optional)

For offline development:

```
# In .env.local
TURSO_DATABASE_URL=file:local.db
# Leave TURSO_AUTH_TOKEN empty or commented out
```

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Turso Documentation](https://docs.turso.tech)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Turso + Vercel Integration Guide](https://turso.tech/blog/turso-cloud-integration-for-vercel-marketplace)

## ❓ Common Questions

**Q: Can I use a different database?**
A: Yes! You can use Vercel Postgres, Planet Scale, or any other database. You'll need to update `lib/database.js`.

**Q: What if I run out of free tier?**
A: Turso free tier is very generous. For a FiveM server website, you likely won't exceed limits. Paid tier is only $4.99/month.

**Q: Can I have multiple admin users?**
A: Currently supports one admin. To add more, modify the database schema and admin panel.

**Q: Is my data backed up?**
A: Turso automatically backs up your database. You can also export data manually.

**Q: Can I migrate from SQLite to Turso?**
A: You just did! The migration is complete. Old local database files are no longer needed.

## 🎉 You're Done!

Your EVU server website is now live on Vercel with Turso database!

- ✅ Secure authentication with bcrypt
- ✅ Global edge database with Turso
- ✅ Auto-deployments from GitHub
- ✅ Free hosting and database
- ✅ Custom domain support
- ✅ Automatic HTTPS

Update your website anytime through the admin panel at:
**`https://your-project.vercel.app/admin`**

Enjoy! 🚀
