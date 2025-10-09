# EVU Gaming Network Website

A modern, secure, and easy-to-manage website for your gaming community built with Next.js. Supports both Minecraft and FiveM servers with seamless switching.

## ✨ Features

- 🎮 **Dual Server Support**: Manage both Minecraft and FiveM servers from one website
- 🔄 **Easy Server Switching**: Tab-based interface to switch between server information
- 🎨 **Modern UI**: Clean, responsive design that works on all devices
- 🔒 **Secure Admin Panel**: Database-backed authentication with bcrypt password hashing
- ⚡ **Fast Performance**: Built with Next.js for optimal speed and SEO
- 📝 **Easy Content Management**: Update everything through a simple web interface
- 🔄 **Real-time Updates**: Changes appear instantly on the website
- 📱 **Mobile Friendly**: Looks great on phones, tablets, and desktops
- 👥 **User Profiles**: User login system with profile management
- 🎯 **Role-Based Access**: Separate admin and user roles
- 📊 **Automatic Versioning**: Git-based changelog generation

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

See [Installation Guide](docs/guides/installation.md) for detailed installation instructions.

## 📋 Pages

- **Status** (`/`) - Server status, player count, and features
- **Join** (`/join`) - How to connect to your server
- **Forum** (`/forum`) - Community forum categories
- **Changelog** (`/changelog`) - Version history and updates
- **Admin** (`/admin`) - Content management panel

## 🔐 Security

This website uses **enterprise-level security**:

- ✅ Supabase PostgreSQL database for credential storage
- ✅ Bcrypt password hashing (10 salt rounds)
- ✅ Forced password change on first login
- ✅ Session-based authentication
- ✅ No plain-text passwords anywhere
- ✅ Environment variables for secrets

**Default Login:**
- Username: `admin`
- Password: `admin123`

⚠️ **You MUST change this password on first login!**

See [Database Setup Guide](docs/database/setup-guide.md) for security details.

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

- **Framework**: Next.js 15
- **Frontend**: React 18
- **Database**: Supabase (PostgreSQL)
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
└── data/             # Content storage
    └── content.json  # Website content
```

## 📖 Documentation

### Getting Started
- [Installation Guide](docs/guides/installation.md) - Local setup and configuration
- [Database Deployment](docs/database/deployment.md) - Deploy to Vercel with Supabase
- [Admin Panel Guide](docs/guides/admin-panel.md) - Managing your website

### Development
- [Branching Strategy](docs/guides/branching.md) - Git workflow and branch protection
- [Versioning Guide](docs/guides/versioning.md) - Semantic versioning and changelogs
- [Next.js Info](docs/guides/nextjs-info.md) - Framework features and development

### Database
- [Setup Guide](docs/database/setup-guide.md) - Security and authentication
- [Initial Setup SQL](docs/database/supabase-setup.sql) - Database schema
- [Role Migration](docs/database/role-migration.sql) - User role system
- [Dual-Server Migration](docs/database/dual-server-migration.sql) - Multi-server support

### Migration Guides
- [Dual-Server Migration](docs/guides/dual-server-migration.md) - Upgrading to multi-server support

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

### Vercel + Supabase

**📖 Complete Guide:** See [Database Deployment Guide](docs/database/deployment.md)

**Quick Start:**
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run SQL to create tables (in deployment guide)
3. Import repository on [vercel.com](https://vercel.com/new)
4. Configure Vercel Supabase integration for automatic environment variables
5. Deploy! ✨

**Environment Variables:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (keep secret!)
- `RESEND_API_KEY` - (Optional) Resend API key for email notifications
- `EMAIL_FROM` - (Optional) Sender email address
- `ADMIN_EMAIL` - (Optional) Admin email for ticket notifications
- `NEXT_PUBLIC_SITE_URL` - Your site URL for email links

**Free Tier:** 500MB database, 1GB file storage, unlimited API requests

**Email Setup (Optional):**
Sign up at [resend.com](https://resend.com) for free email service (3,000 emails/month). Copy `.env.local.example` to `.env.local` and add your Resend API key.

### Alternative Platforms
- **Railway** - Supports PostgreSQL
- **Fly.io** - Has managed PostgreSQL
- **DigitalOcean App Platform** - Supports databases

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
- See [Installation Guide](docs/guides/installation.md) troubleshooting section

**Forgot password?**
- Delete the admin row from Supabase `admins` table
- Redeploy to create new default admin

**Port already in use?**
- Run `PORT=3001 npm run dev` to use different port

**Database connection errors?**
- Verify environment variables in `.env.local`
- Check Supabase project status

## 🆕 What's New in v2.0

- ✅ Migrated to Next.js 15 framework
- ✅ **Vercel-ready deployment** with Supabase
- ✅ Supabase PostgreSQL database integration
- ✅ Vercel integration for automatic environment setup
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

**Made for EVU Team** | Powered by Next.js + Supabase | Deployed on Vercel
