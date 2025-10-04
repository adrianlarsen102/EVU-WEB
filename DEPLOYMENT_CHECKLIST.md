# Vercel Deployment Checklist

Use this checklist when deploying your EVU website to Vercel.

## ✅ Pre-Deployment

- [ ] Code is pushed to GitHub
- [ ] `package.json` has `@libsql/client` dependency
- [ ] `.env.example` exists (template for environment variables)
- [ ] `.gitignore` includes `.env` and database files

## ✅ Turso Database Setup

- [ ] Created Turso account at [turso.tech](https://turso.tech)
- [ ] Created a new database (e.g., `evu-admin-db`)
- [ ] Copied database URL (starts with `libsql://`)
- [ ] Generated auth token
- [ ] Saved both values securely

## ✅ Vercel Project Setup

- [ ] Created Vercel account
- [ ] Imported GitHub repository
- [ ] Added environment variable: `TURSO_DATABASE_URL`
- [ ] Added environment variable: `TURSO_AUTH_TOKEN`
- [ ] Environment variables applied to all environments (Production, Preview, Development)

## ✅ First Deployment

- [ ] Clicked "Deploy" button
- [ ] Build completed successfully (check build logs)
- [ ] No errors in deployment logs
- [ ] Site is accessible at Vercel URL

## ✅ Post-Deployment Testing

- [ ] Homepage loads: `https://your-project.vercel.app`
- [ ] Join page loads: `https://your-project.vercel.app/join`
- [ ] Forum page loads: `https://your-project.vercel.app/forum`
- [ ] Changelog loads: `https://your-project.vercel.app/changelog`
- [ ] Admin panel loads: `https://your-project.vercel.app/admin`

## ✅ Admin Panel Testing

- [ ] Can access admin login page
- [ ] Can login with default password: `admin123`
- [ ] Password change modal appears automatically
- [ ] Can change password successfully
- [ ] Can login with new password
- [ ] Can edit server info
- [ ] Changes save successfully
- [ ] Changes appear on homepage

## ✅ Database Verification

- [ ] Check Turso dashboard shows your database
- [ ] `admins` table exists
- [ ] `sessions` table exists
- [ ] Admin record is present in `admins` table

## ✅ Optional: Custom Domain

- [ ] Purchased domain name
- [ ] Added domain in Vercel project settings
- [ ] Updated DNS records
- [ ] SSL certificate issued
- [ ] Site accessible via custom domain

## ✅ Security Checklist

- [ ] Changed default password
- [ ] Environment variables are secure (not in code)
- [ ] `.env` files not committed to git
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Auth tokens rotated if ever exposed

## 🎉 Deployment Complete!

Once all items are checked, your EVU website is live and secure!

**Your Website:** https://your-project.vercel.app
**Admin Panel:** https://your-project.vercel.app/admin

---

## 📞 Need Help?

- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Full deployment guide
- [Vercel Support](https://vercel.com/support)
- [Turso Documentation](https://docs.turso.tech)
