# EVU FiveM Server Website

A modern, secure, and easy-to-manage website for your FiveM server built with Next.js.

## ✨ Features

- 🎨 **Modern UI**: Clean, responsive design that works on all devices
- 🔒 **Secure Admin Panel**: Database-backed authentication with bcrypt password hashing
- ⚡ **Fast Performance**: Built with Next.js for optimal speed and SEO
- 📝 **Easy Content Management**: Update everything through a simple web interface
- 🔄 **Real-time Updates**: Changes appear instantly on the website
- 📱 **Mobile Friendly**: Looks great on phones, tablets, and desktops

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm run dev

# 3. Open admin panel
# Navigate to http://localhost:3000/admin
# Login with password: admin123
# You'll be prompted to change it immediately
```

See [INSTALL.md](INSTALL.md) for detailed installation instructions.

## 📋 Pages

- **Status** (`/`) - Server status, player count, and features
- **Join** (`/join`) - How to connect to your server
- **Forum** (`/forum`) - Community forum categories
- **Changelog** (`/changelog`) - Version history and updates
- **Admin** (`/admin`) - Content management panel

## 🔐 Security

This website uses **enterprise-level security**:

- ✅ Turso Edge database for credential storage (SQLite-compatible)
- ✅ Bcrypt password hashing (10 salt rounds)
- ✅ Forced password change on first login
- ✅ Session-based authentication
- ✅ No plain-text passwords anywhere
- ✅ Database file excluded from git

**Default Login:**
- Username: `admin`
- Password: `admin123`

⚠️ **You MUST change this password on first login!**

See [DATABASE_README.md](DATABASE_README.md) for security details.

## 🎯 Admin Panel Features

Manage your entire website without touching code:

### Server Info
- Change server name and title
- Update version information
- Set server status (online/offline)
- Adjust max players and uptime

### Features
- Add/remove server features
- Customize icons and descriptions
- Showcase what makes your server unique

### Join Information
- Update server IP/connect command
- Change Discord invite link
- Manage connection instructions

### Changelog
- Add new version entries
- Document features, improvements, and bug fixes
- Keep players informed of updates

### Forum
- Create/edit forum categories
- Update topic and post counts
- Organize community discussions

### Password Management
- Change your password anytime
- Visual indicator for default password
- Enforced security requirements

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Frontend**: React 18
- **Database**: Turso (Edge SQLite with libSQL)
- **Security**: bcrypt
- **Styling**: Custom CSS
- **API**: Next.js API Routes
- **Hosting**: Vercel (optimized)

## 📁 Project Structure

```
├── pages/              # React pages and API routes
│   ├── index.js       # Homepage
│   ├── join.js        # Join page
│   ├── forum.js       # Forum page
│   ├── changelog.js   # Changelog page
│   ├── admin.js       # Admin panel
│   └── api/           # Backend API routes
├── components/        # Reusable React components
├── lib/              # Utility functions and database
├── public/           # Static files (CSS, images)
├── data/             # Content storage and database
│   ├── content.json  # Website content
│   └── admin.db      # SQLite database (auto-created)
└── docs/             # Documentation
```

## 📖 Documentation

- [INSTALL.md](INSTALL.md) - Local installation guide
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - **Deploy with Turso (SQLite)**
- [SUPABASE_DEPLOYMENT.md](SUPABASE_DEPLOYMENT.md) - **Deploy with Supabase (PostgreSQL)**
- [DATABASE_COMPARISON.md](DATABASE_COMPARISON.md) - **Compare Turso vs Supabase**
- [DATABASE_README.md](DATABASE_README.md) - Security and authentication
- [NEXTJS_README.md](NEXTJS_README.md) - Next.js features and development

## 🔧 Development

```bash
# Start development server (with hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## 🌐 Deployment

### Option 1: Vercel + Turso (Recommended - Simple)

**📖 Complete Guide:** See [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)

**Quick Start:**
1. Create Turso database at [turso.tech](https://turso.tech)
2. Import repository on [vercel.com](https://vercel.com/new)
3. Add environment variables: `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`
4. Deploy! ✨

**Free Tier:** 9GB storage, 500M row reads, edge replication

### Option 2: Vercel + Supabase (PostgreSQL + More Features)

**📖 Complete Guide:** See [SUPABASE_DEPLOYMENT.md](SUPABASE_DEPLOYMENT.md)

**Quick Start:**
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run SQL to create tables (in guide)
3. Import repository on [vercel.com](https://vercel.com/new)
4. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`
5. Deploy! ✨

**Free Tier:** 500MB database, 1GB file storage, built-in auth & storage

**Need help choosing?** See [DATABASE_COMPARISON.md](DATABASE_COMPARISON.md)

**Quick Comparison:**
- **Turso**: SQLite, simpler, edge-first, 9GB free, minimal setup
- **Supabase**: PostgreSQL, more features (auth, storage, real-time), 500MB free

### Alternative Platforms
- **Railway** - Supports persistent volumes
- **Fly.io** - Has persistent storage
- **DigitalOcean App Platform** - Supports volumes

⚠️ **Note**: Vercel requires a cloud database (Turso/Supabase/etc) due to serverless architecture.

## 🎨 Customization

### Change Colors
Edit `public/styles/style.css`:
```css
:root {
  --primary-color: #6b46c1;    /* Purple */
  --accent-color: #ec4899;      /* Pink */
  --bg-color: #0f0f23;          /* Dark blue */
  /* ... */
}
```

### Add New Pages
1. Create `pages/yourpage.js`
2. Add link to `components/Layout.js`
3. Content appears automatically!

### Connect to FiveM Server
Update `pages/index.js` to fetch real server data:
```javascript
// Uncomment and configure the API endpoint
const response = await fetch('YOUR_FIVEM_API');
```

## ❓ Troubleshooting

**Installation fails?**
- See [INSTALL.md](INSTALL.md) troubleshooting section

**Forgot password?**
- Local: Delete `local.db` and restart
- Vercel: Redeploy to reset database

**Port already in use?**
- Run `PORT=3001 npm run dev` to use different port

**Database locked?**
- Ensure only one server instance is running

## 🆕 What's New in v2.0

- ✅ Migrated to Next.js framework
- ✅ **Vercel-ready deployment** with Turso database
- ✅ Edge database with Turso (SQLite-compatible)
- ✅ **Supabase support** as PostgreSQL alternative
- ✅ Bcrypt password hashing
- ✅ Forced password change on first login
- ✅ Improved session management
- ✅ Better performance with React
- ✅ Enhanced security features
- ✅ Global edge deployment support

## 📝 License

ISC

## 🤝 Contributing

This is a template for your FiveM server. Feel free to customize it however you like!

---

**Made for EVU Server** | Powered by Next.js + Turso | Deployed on Vercel
