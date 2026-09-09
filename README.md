# EVU Gaming Network Website

**Version 3.7.0** - A modern, secure, and feature-rich website for your gaming community built with Next.js. Supports both Minecraft and FiveM servers with seamless switching.

## ✨ Features

- 🎮 **Dual Server Support**: Manage both Minecraft and FiveM servers from one website
- 🔄 **Easy Server Switching**: Tab-based interface to switch between server information
- 🎨 **Modern UI**: Clean, responsive design with 5 theme options (Dark, Light, Purple, Ocean, Forest)
- 🔒 **Secure Admin Panel**: Database-backed authentication with bcrypt password hashing
- ⚡ **Fast Performance**: Built with Next.js for optimal speed and SEO
- 📝 **Easy Content Management**: Update everything through a simple web interface
- 🔄 **Real-time Updates**: Changes appear instantly on the website
- 📱 **Mobile Friendly**: Looks great on phones, tablets, and desktops
- 👥 **User Profiles**: User login system with profile management and avatar uploads
- 🎯 **Role-Based Access**: Advanced RBAC system with custom roles and 52+ permissions
- 📊 **Automatic Versioning**: Git-based changelog generation
- 💬 **Discord Webhooks**: Real-time notifications for 25+ event types
- 📊 **Status.io Integration**: Automated incident reporting and status page updates
- 🎫 **Support Tickets**: Integrated ticket system with email notifications
- 📧 **Email System**: Resend or SMTP support for automated emails
- 🛡️ **Enterprise Security**: CSRF protection, audit logging, rate limiting, input validation

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm run dev

# 3. Complete Initial Setup
# Navigate to http://localhost:3000/setup
# Register your first administrator account securely
```

See [Installation Guide](docs/guides/installation.md) for detailed installation instructions.

## 📋 Pages

- **Home** (`/`) - Server status, player count, and features
- **Join** (`/join`) - Step-by-step connection guides
- **Forum** (`/forum`) - Complete forum system with topics and comments
- **Support** (`/support`) - Support ticket system for users
- **Changelog** (`/changelog`) - Auto-generated and manual version history
- **Profile** (`/profile`) - User login, registration, and profile management
- **Admin** (`/admin`) - Comprehensive content management panel
- **Privacy** (`/privacy`) - GDPR-compliant privacy policy
- **Terms** (`/terms`) - Terms and conditions

## 🔐 Security

This website uses **enterprise-level security**:

### 🛡️ Security Status (v3.7.0)
- ✅ **npm audit: 0 vulnerabilities**
- ✅ All dependencies up-to-date with security patches
- ✅ Next.js 16.3.4 (critical RCE & DoS vulnerabilities fixed)
- ✅ React 19.2.8 (latest stable)
- ✅ Supabase 2.112.4 (50+ security patches)
- ✅ Node.js >=22.0.0 support (including Node 25.x)

### 🔒 Security Features
- ✅ Supabase PostgreSQL database for credential storage
- ✅ Bcrypt password hashing (10 salt rounds)
- ✅ Stateless Cryptographic CSRF token protection on all state-changing operations
- ✅ Rate limiting (15+ endpoint-specific limiters)
- ✅ Input validation & sanitization (XSS/SQL injection prevention)
- ✅ Comprehensive audit logging (25+ event types)
- ✅ Session-based authentication with caching
- ✅ Secure initial `/setup` wizard for admin creation
- ✅ Enhanced security headers (CSP, HSTS, COEP, COOP, CORP)
- ✅ No plain-text passwords anywhere
- ✅ Environment variables for secrets

**Admin Setup:**
- Navigate to `/setup` on first launch to securely register your admin account.
- No insecure default passwords are included.

See [Database Setup Guide](docs/database/setup-guide.md) for security details.

## 🎯 Admin Panel Features

Manage your entire website without touching code:

### 📊 Dashboard
- View user statistics (total, new, active)
- Monitor ticket metrics (open, closed, response times)
- Track forum activity
- View performance metrics history

### 🖥️ Server Info
- Manage dual-server settings (Minecraft/FiveM)
- Update server status, IP, and port
- Configure website title and Discord link

### ⭐ Features
- Add/remove server features
- Customize icons and descriptions
- Per-server feature lists

### 🚀 Join Information
- Update connection instructions
- Manage server IPs and commands
- Discord integration

### 📝 Changelog
- Create version entries with semantic versioning
- Categorize changes (Features, Improvements, Fixes)
- Date tracking and version management

### 💬 Forum Management
- Create/edit forum categories
- Server-type filtering (all, minecraft, fivem)
- Topic and post count tracking

### 🎭 Moderation
- Review all forum topics and comments
- Edit, delete, or lock content
- Moderation action logging

### 🎫 Support Tickets
- View all support tickets with filtering
- Reply to tickets
- Change ticket status (open, in_progress, closed)
- Priority management

### 👥 Users
- Create new users with role assignment
- **Edit user profiles** (username, email, display name, role)
- Delete users with confirmation
- Reset passwords
- View creation dates

### 📧 Email Settings
- Configure email provider (Resend or SMTP)
- Test email functionality
- Customize from email/name
- View delivery status

### 💬 Discord Webhooks (v2.18.0)
- Enable/disable Discord notifications
- Configure webhook URL and bot avatar
- Toggle 25+ individual event types
- Test webhook with live notification
- Event categories: User Events, Security Alerts, Forum Activity, Support Tickets, Admin Actions

### 📊 Status.io Integration (v3.1.0)
- Connect to Status.io status page service
- Configure API credentials (API ID, API Key, Status Page ID)
- Map servers to Status.io components
- Automatic incident reporting on server outages
- Automatic status updates when servers recover
- Test connection and create test incidents
- Configurable outage thresholds
- Subscriber notification controls

### 🔐 Roles & Permissions
- Create custom roles
- Configure 52+ granular permissions
- Manage role assignments
- System role protection

## 🛠️ Tech Stack

- **Framework**: Next.js 16.3.4 (Webpack mode for Windows compatibility)
- **Frontend**: React 19.2.8
- **Database**: Supabase (PostgreSQL) v2.112.4
- **Runtime**: Node.js >=22.0.0 (Native Node 25.x support)
- **Security**: bcrypt, Stateless CSRF protection, rate limiting, input validation
- **Styling**: Custom CSS with 5 theme options
- **API**: Next.js API Routes
- **Email**: Nodemailer v7.0.13 (SMTP/Resend)
- **Analytics**: Vercel Analytics & Speed Insights
- **Testing**: Jest + Playwright
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

**Getting errors?** See [Troubleshooting Guide](docs/guides/troubleshooting.md) for quick solutions.

**Common Issues:**

**"Failed to load content" / 500 Error**
- Check `/api/health` endpoint
- Verify environment variables in Vercel
- Run `npm run db:init` to initialize content

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
- Visit Supabase dashboard to wake up paused project

**Deployment issues?**
- See [Deployment Checklist](docs/guides/deployment-checklist.md)

## 🆕 What's New in v3.7.0

### Latest Updates
- 🚀 **Node 25.x Support** - Upgraded engine requirements to support modern Node.js versions (>=22.0.0)
- 🔒 **Stateless CSRF Security** - Replaced in-memory CSRF tokens with highly scalable, stateless cryptographic signatures ideal for Vercel and serverless edge deployment
- 🛡️ **Secure Setup Wizard** - Replaced hardcoded default admin credentials with a secure `/setup` registration flow
- ⬆️ **Next.js 16.3.4** - Updated from 16.1.6
- 📦 **Supabase 2.112.4** - Updated from 2.93.3
- ⚛️ **React 19.2.8** - Updated from 19.2.4
- 🛠️ **Webpack Configuration** - Added for Windows compatibility (Turbopack symlink fix)
- 🔐 **Enhanced Security Headers** - COEP, COOP, CORP added
- 📝 **Comprehensive CSP** - Added upgrade-insecure-requests
- ✅ **npm audit: 0 vulnerabilities**

### Previous Major Updates (v2.0+)
- ✅ **Discord Webhook Notifications** - Real-time alerts for 25+ event types
- ✅ **User Edit Modal** - Full profile editing in admin panel
- ✅ **Vercel-ready deployment** with Supabase
- ✅ Advanced RBAC system with custom roles
- ✅ Multi-theme system (5 themes)
- ✅ Complete forum system with moderation
- ✅ Support ticket system with email notifications
- ✅ CSRF protection and rate limiting
- ✅ Comprehensive audit trail
- ✅ Input validation & sanitization
- ✅ GDPR-compliant data management
- ✅ Performance metrics tracking
- ✅ Email notification system (Resend/SMTP)
- ✅ User registration and avatar uploads
- ✅ Global edge deployment support

## 📝 License

ISC

## 🤝 Contributing

This is a template for your FiveM server. Feel free to customize it however you like!

---

**Made for EVU Team** | Powered by Next.js + Supabase | Deployed on Vercel
