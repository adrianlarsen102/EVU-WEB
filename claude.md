# EVU-WEB Project Documentation

**Complete technical reference for the EVU Gaming Network website**

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Database Architecture](#database-architecture)
- [API Routes](#api-routes)
- [Pages & Components](#pages--components)
- [Authentication System](#authentication-system)
- [Content Management](#content-management)
- [Data Structures](#data-structures)
- [Development Workflow](#development-workflow)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Security](#security)

---

## Project Overview

**EVU-WEB** is a full-stack gaming community website built with Next.js, designed specifically for managing both Minecraft and FiveM gaming servers from a single unified platform.

### Key Information
- **Version**: 2.5.2
- **Framework**: Next.js 15.5.4
- **Runtime**: Node.js 22.x (LTS)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **License**: ISC

### Primary Features
- **Dual-server support** for Minecraft and FiveM
- **Admin panel** with comprehensive CMS
- **User authentication** and profile management
- **Role-based access control** (Admin/User)
- **Automated changelog** generation from Git commits
- **GDPR-compliant** cookie consent system
- **Real-time content** updates

---

## Technology Stack

### Core Dependencies
```json
{
  "next": "^15.5.4",                    // React framework with SSR
  "react": "^18.3.1",                   // UI library
  "react-dom": "^18.3.1",               // React DOM rendering
  "@supabase/supabase-js": "^2.39.0",  // Database client
  "bcrypt": "^6.0.0",                   // Password hashing
  "@vercel/speed-insights": "^1.2.0"   // Performance monitoring
}
```

### Development Dependencies
```json
{
  "@types/node": "^20.19.19",
  "@types/react": "^18.3.25",
  "@types/react-dom": "^18.3.7",
  "@types/bcrypt": "^6.0.0",
  "standard-version": "^9.5.0"          // Semantic versioning
}
```

### Key Technologies
- **Next.js 15** - React framework with App Router
- **Supabase** - PostgreSQL database with real-time capabilities
- **Bcrypt** - Industry-standard password hashing (10 salt rounds)
- **Vercel** - Serverless deployment platform
- **Standard Version** - Automated versioning and CHANGELOG generation

---

## Project Structure

```
EVU-WEB/
├── pages/                      # Next.js pages (file-based routing)
│   ├── _app.js                # Global app wrapper with Speed Insights
│   ├── index.js               # Homepage - Server status & features
│   ├── admin.js               # Admin panel (CMS)
│   ├── join.js                # Join server instructions
│   ├── forum.js               # Community forum
│   ├── changelog.js           # Auto + manual changelog viewer
│   ├── profile.js             # User profile & login
│   └── api/                   # Backend API routes
│       ├── auth/
│       │   └── check.js       # Check authentication status
│       ├── login.js           # User/admin login
│       ├── logout.js          # Session destruction
│       ├── change-password.js # Admin password change
│       ├── content.js         # CMS content CRUD
│       ├── users.js           # User management (CRUD)
│       ├── status.js          # Server status API
│       ├── changelog-md.js    # Parse CHANGELOG.md
│       └── profile/
│           ├── index.js       # User profile CRUD
│           └── password.js    # User password change
│
├── components/                # React components
│   ├── Layout.js             # Page layout with navbar & footer
│   └── CookieConsent.js      # GDPR cookie consent banner
│
├── lib/                      # Utility libraries
│   ├── auth.js              # Authentication helpers
│   └── database.js          # Supabase database operations
│
├── public/                   # Static assets
│   └── styles/
│       ├── style.css        # Main styles with CSS variables
│       └── admin.css        # Admin panel styles
│
├── data/                     # Data storage
│   └── content.json         # Default content structure
│
├── docs/                     # Documentation
│   ├── database/            # Database setup guides
│   └── guides/              # User guides & workflows
│
├── next.config.js           # Next.js configuration
├── vercel.json              # Vercel deployment config
├── package.json             # Dependencies & scripts
├── CHANGELOG.md             # Auto-generated changelog
└── README.md                # User-facing documentation
```

---

## Features

### 1. **Admin Panel** (`/admin`)

#### Tabs & Functionality

**Server Info Tab**
- Toggle server enabled/disabled (Minecraft/FiveM)
- Configure server name, IP, port
- Set general website settings (title, Discord link)
- Dual-server structure support with backward compatibility

**Features Tab**
- Add/edit/remove server features
- Per-server feature lists (Minecraft vs FiveM)
- Support for both simple strings and detailed feature objects

**Join Info Tab**
- Configure server IPs and connect commands
- Discord link management
- Different connection methods for Minecraft vs FiveM

**Changelog Tab**
- Create version entries with semantic versioning
- Categorize changes: Features, Improvements, Fixes
- Date tracking and version management

**Forum Tab**
- Create/edit forum categories
- Track topics and posts counts
- Server-type filtering (all, minecraft, fivem)
- Category descriptions

**Users Tab**
- Create new users (admin/user roles)
- Delete users (with confirmation)
- Reset user passwords
- View user creation dates
- Default password warnings

**Security Features**
- Forced password change on first login
- Password complexity requirements (min 8 chars)
- Real-time status indicators
- Session-based authentication

### 2. **User Profiles** (`/profile`)

- Username/password authentication
- Profile customization (display name, email, bio, avatar)
- Password change functionality
- Role badges (Admin indicator)
- Account creation date tracking
- GDPR-compliant data management

### 3. **Content Pages**

**Homepage** (`/`)
- Dual-server selector tabs (Minecraft/FiveM)
- Live server status indicators
- Player count display
- Server uptime tracking
- Version information
- Feature showcase per server
- Direct connection information

**Join Page** (`/join`)
- Step-by-step connection guides
- Copy-to-clipboard server IP
- Different instructions per server type
- System requirements
- FiveM installation guide
- Discord community integration

**Forum Page** (`/forum`)
- Category browsing with server filtering
- Topic and post counts
- Recent activity feed
- Forum rules section
- Server-specific categories (Minecraft/FiveM/General)

**Changelog Page** (`/changelog`)
- **Dual-tab system:**
  - **Website Updates (Auto)**: Generated from Git commits via `standard-version`
  - **Server Updates (Manual)**: Curated game server changes from admin panel
- Categorized changes (Features, Improvements, Fixes, Performance, Refactoring, Documentation)
- Version comparison links to GitHub
- Visual "Latest" badges

### 4. **Cookie Consent System**

- GDPR-compliant banner
- Accept/Decline functionality
- **Privacy Policy** modal with:
  - Data controller information
  - Data collection transparency
  - Legal basis (GDPR)
  - User rights explanation
  - Cookie types and purposes
  - Data retention policies
- **Terms of Service** modal
- Local storage consent tracking
- Animated UI with smooth transitions

---

## Database Architecture

### Supabase Tables

#### **admins** table
```sql
- id (uuid, primary key)
- username (text, unique)
- password_hash (text)          -- bcrypt hashed
- is_default_password (boolean)
- role (text)                   -- 'admin' or 'user'
- is_admin (boolean)            -- backward compatibility
- created_at (timestamp)
- updated_at (timestamp)
- display_name (text)           -- user profiles
- email (text)                  -- user profiles
- bio (text)                    -- user profiles
- avatar_url (text)             -- user profiles
```

#### **sessions** table
```sql
- id (text, primary key)        -- 64-char hex string
- admin_id (uuid, foreign key → admins.id)
- expires_at (timestamp)        -- 24 hours from creation
- created_at (timestamp)
```

#### **site_content** table
```sql
- id (integer, primary key)     -- Always 1
- content (jsonb)               -- Full site content structure
- updated_at (timestamp)
```

### Database Functions

**Initialization** (`lib/database.js:initializeDatabase`)
- Creates default admin if none exist (username: admin, password: admin123)
- Cleans up expired sessions
- Runs on first import
- Idempotent (safe to run multiple times)

**Session Cleanup**
- Automatic hourly cleanup of expired sessions
- Runs via `setInterval` in `lib/database.js`

---

## API Routes

### Authentication APIs

#### `POST /api/login`
**Purpose**: Authenticate user/admin
**Request**:
```json
{
  "username": "string",
  "password": "string"
}
```
**Response**:
```json
{
  "success": true,
  "isDefaultPassword": boolean
}
```
**Sets cookie**: `sessionId` (HttpOnly, SameSite=Strict)

#### `GET /api/auth/check`
**Purpose**: Verify session validity
**Response**:
```json
{
  "authenticated": boolean,
  "username": "string",
  "isDefaultPassword": boolean,
  "isAdmin": boolean,
  "role": "admin" | "user"
}
```

#### `POST /api/logout`
**Purpose**: Destroy session
**Response**: `{ "success": true }`

#### `POST /api/change-password`
**Purpose**: Change admin password (admin panel)
**Requires**: Valid session
**Request**:
```json
{
  "newPassword": "string",
  "confirmPassword": "string"
}
```

### Content Management APIs

#### `GET /api/content`
**Purpose**: Fetch site content
**Public**: Yes
**Response**: JSON content structure

#### `POST /api/content`
**Purpose**: Update site content
**Requires**: Admin authentication
**Request**: Full content JSON structure
**Response**: `{ "success": true }`

#### `GET /api/changelog-md`
**Purpose**: Parse CHANGELOG.md for display
**Public**: Yes
**Response**:
```json
{
  "releases": [
    {
      "version": "2.5.2",
      "date": "2025-10-06",
      "features": ["..."],
      "improvements": ["..."],
      "fixes": ["..."],
      "performance": ["..."],
      "refactoring": ["..."],
      "documentation": ["..."]
    }
  ]
}
```

### User Management APIs

#### `GET /api/users`
**Purpose**: List all users
**Requires**: Valid session
**Response**: Array of user objects (without passwords)

#### `POST /api/users`
**Purpose**: Create new user
**Requires**: Admin authentication
**Request**:
```json
{
  "username": "string",
  "password": "string",
  "role": "admin" | "user"  // optional, defaults to "user"
}
```

#### `DELETE /api/users`
**Purpose**: Delete user
**Requires**: Admin authentication
**Request**: `{ "userId": "uuid" }`
**Protection**: Cannot delete own account

#### `PUT /api/users`
**Purpose**: Update user password or role
**Requires**: Admin authentication
**Request**:
```json
{
  "userId": "uuid",
  "newPassword": "string",  // optional
  "role": "admin" | "user"  // optional
}
```

### Profile APIs

#### `GET /api/profile`
**Purpose**: Get current user profile
**Requires**: Valid session
**Response**: User profile object

#### `PUT /api/profile`
**Purpose**: Update profile
**Requires**: Valid session
**Request**:
```json
{
  "display_name": "string",
  "email": "string",
  "bio": "string",
  "avatar_url": "string"
}
```

#### `POST /api/profile/password`
**Purpose**: Change user password
**Requires**: Valid session
**Request**:
```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

---

## Pages & Components

### Pages

#### `pages/index.js` - Homepage
- Fetches content from `/api/content`
- Server selector tabs (if dual-server enabled)
- Server status cards with live indicators
- Player count display
- Feature grid per server
- Connection box with server IP
- Backward compatible with single-server structure

#### `pages/admin.js` - Admin Panel
- Full CMS with 6 tabs
- Session-based authentication
- Password change enforcement modal
- Real-time content editing
- User management interface
- Success/error message toasts

#### `pages/join.js` - Join Server
- Server-specific connection guides
- Clipboard copy functionality
- Step-by-step instructions
- System requirements section
- Discord community link

#### `pages/forum.js` - Forum
- Server filter tabs
- Category listing with icons
- Topic/post statistics
- Recent activity feed
- Forum rules section

#### `pages/changelog.js` - Changelog
- Dual-tab system (Auto/Manual)
- Auto: Parses `CHANGELOG.md` via API
- Manual: Admin-curated from database
- Categorized change types
- "Latest" badge on newest version

#### `pages/profile.js` - User Profile
- Login form (if not authenticated)
- Profile editing interface
- Password change form
- Avatar display
- Admin badge
- Account metadata

#### `pages/_app.js` - App Wrapper
- Global CSS import
- Vercel Speed Insights integration
- Wraps all pages

### Components

#### `components/Layout.js`
- Page layout wrapper
- Navigation bar with links:
  - Servers (/)
  - Join (/join)
  - Forum (/forum)
  - Changelog (/changelog)
  - Login (/profile)
- Footer with copyright
- Cookie consent integration
- SEO meta tags

#### `components/CookieConsent.js`
- Cookie consent banner with animations
- Privacy Policy modal (GDPR-compliant)
- Terms of Service modal
- LocalStorage consent tracking
- Accept/Decline buttons
- Responsive design

---

## Authentication System

### Flow

1. **Login** → User submits credentials → `/api/login`
2. **Verification** → `lib/auth.js:verifyLogin` → Bcrypt comparison
3. **Session Creation** → `lib/database.js:createSession` → Generate 64-char hex token
4. **Cookie Set** → HttpOnly session cookie → 24-hour expiry
5. **Authentication** → `lib/auth.js:validateSession` → Validate on each request
6. **Logout** → `/api/logout` → Destroy session

### Security Features

- **Bcrypt hashing** with 10 salt rounds
- **HttpOnly cookies** to prevent XSS
- **SameSite=Strict** to prevent CSRF
- **Session expiry** after 24 hours
- **Automatic cleanup** of expired sessions
- **Forced password change** for default credentials
- **Password complexity** requirements (min 8 chars)
- **Cannot use default password** ("admin123")

### Role-Based Access Control

```javascript
// Checking admin status
if (!session.isAdmin) {
  return res.status(403).json({ error: 'Forbidden: Admin access required' });
}
```

**Roles**:
- `admin`: Full access to admin panel and content management
- `user`: Access to profile, can view content

### Backward Compatibility

The authentication system supports both:
- **New structure**: `role` field ('admin' or 'user')
- **Old structure**: `is_admin` boolean field

```javascript
const isAdmin = hasRole
  ? (admin.role === 'admin')
  : (admin.is_admin === true);
```

---

## Content Management

### Content Storage

Content is stored in Supabase `site_content` table as JSONB with ID=1 (singleton pattern).

### Content Structure Evolution

**Legacy Single-Server** (v1.x):
```json
{
  "serverInfo": { ... },
  "serverStatus": { ... },
  "features": [...],
  "joinInfo": { ... }
}
```

**Modern Dual-Server** (v2.x+):
```json
{
  "servers": {
    "minecraft": { ... },
    "fivem": { ... }
  },
  "general": { ... }
}
```

### Backward Compatibility

All pages check for structure and fallback gracefully:
```javascript
const hasServers = content?.servers && (content.servers.minecraft || content.servers.fivem);
const displayData = hasServers ? content.servers[activeServer] : content.serverInfo;
```

---

## Data Structures

### Dual-Server Content Structure

```json
{
  "servers": {
    "minecraft": {
      "enabled": true,
      "name": "EVU Minecraft",
      "serverIP": "play.evu.com",
      "port": "25565",
      "isOnline": true,
      "currentPlayers": 24,
      "maxPlayers": 100,
      "uptime": "99.9%",
      "version": "1.20.4",
      "features": [
        {
          "icon": "⛏️",
          "title": "Survival",
          "description": "Vanilla survival experience"
        }
      ]
    },
    "fivem": {
      "enabled": true,
      "name": "EVU Roleplay",
      "serverIP": "connect cfx.re/join/xxxxx",
      "isOnline": true,
      "currentPlayers": 48,
      "maxPlayers": 64,
      "uptime": "99.5%",
      "version": "QBCore 1.0",
      "features": [
        {
          "icon": "🎮",
          "title": "Roleplay",
          "description": "Immersive RP experience"
        }
      ]
    }
  },
  "general": {
    "websiteTitle": "EVU Gaming Network",
    "welcomeMessage": "Your Home for Gaming",
    "discordLink": "https://discord.gg/yourserver"
  },
  "changelog": [
    {
      "version": "1.0.0",
      "date": "2025-01-15",
      "changes": {
        "features": ["Initial launch"],
        "improvements": ["Performance"],
        "fixes": ["Bug fixes"]
      }
    }
  ],
  "forumCategories": [
    {
      "name": "General Discussion",
      "description": "General chat",
      "topics": 156,
      "posts": 892,
      "serverType": "all"  // or "minecraft" or "fivem"
    }
  ]
}
```

### Admin/User Structure

```json
{
  "id": "uuid",
  "username": "admin",
  "password_hash": "$2b$10$...",
  "is_default_password": false,
  "role": "admin",
  "is_admin": true,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z",
  "display_name": "Administrator",
  "email": "admin@evu.com",
  "bio": "Server administrator",
  "avatar_url": "https://..."
}
```

---

## Development Workflow

### Local Development

```bash
# Install dependencies
npm install

# Start development server (localhost:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Versioning Workflow

This project uses **standard-version** for semantic versioning:

```bash
# Patch release (2.5.2 → 2.5.3)
npm run release:patch

# Minor release (2.5.2 → 2.6.0)
npm run release:minor

# Major release (2.5.2 → 3.0.0)
npm run release:major

# Auto-detect based on commits
npm run release
```

**What happens:**
1. Analyzes Git commits (conventional commits)
2. Bumps version in `package.json`
3. Updates `CHANGELOG.md`
4. Creates Git tag
5. Commits changes

**Conventional Commit Format:**
```
feat: add new feature          → Minor release
fix: fix bug                   → Patch release
BREAKING CHANGE: ...           → Major release
docs: update docs              → Patch release
```

### Branching Strategy

See `docs/guides/branching.md` for full details:

- **main**: Production-ready code
- **dev**: Development branch
- **feature/**: New features
- **fix/**: Bug fixes
- **docs/**: Documentation updates

### Git Workflow

```bash
# 1. Create feature branch from dev
git checkout dev
git pull
git checkout -b feature/new-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add new feature"

# 3. Push and create PR to dev
git push -u origin feature/new-feature

# 4. After merge to dev, test thoroughly

# 5. Merge dev → main for production release
```

---

## Deployment

### Vercel Deployment

**Automatic Deployment:**
1. Push to `main` branch
2. Vercel auto-deploys
3. Runs `npm run build`
4. Deploys to global CDN

**Manual Deployment:**
```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

**Build Settings:**
- **Framework**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 22.x

### Supabase Setup

**Required Tables:**
See `docs/database/supabase-setup.sql` for full SQL schema.

**Quick Setup:**
1. Create Supabase project at [supabase.com](https://supabase.com)
2. Run SQL from deployment guide
3. Copy API keys to Vercel environment variables
4. Enable Vercel-Supabase integration (optional)

### Post-Deployment

**First-time setup:**
1. Visit `/admin`
2. Login with `admin` / `admin123`
3. **Immediately change password**
4. Configure site content
5. Create additional users as needed

---

## Environment Variables

### Required Variables

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...  # Keep secret!
```

### Local Development

Create `.env.local` in project root:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Vercel Configuration

**Option 1: Vercel-Supabase Integration**
- Automatic environment variable injection
- Recommended for production

**Option 2: Manual Configuration**
- Project Settings → Environment Variables
- Add both variables for all environments

---

## Security

### Security Features

✅ **Database Security**
- PostgreSQL with Row-Level Security (RLS)
- Service role key never exposed to client
- Encrypted at rest and in transit

✅ **Password Security**
- Bcrypt hashing (10 rounds)
- Forced password change for defaults
- Minimum 8-character requirement
- Cannot reuse default password

✅ **Session Security**
- HttpOnly cookies (no JavaScript access)
- SameSite=Strict (CSRF protection)
- 24-hour expiry
- Automatic cleanup of expired sessions

✅ **API Security**
- Role-based access control
- Session validation on protected routes
- Input validation
- Error handling without information leakage

✅ **GDPR Compliance**
- Cookie consent banner
- Privacy policy disclosure
- User data rights (access, delete, export)
- Transparent data collection
- Data retention policies

### Security Best Practices

**DO:**
- ✅ Change default password immediately
- ✅ Use strong, unique passwords
- ✅ Keep Supabase service key secret
- ✅ Regularly review user access
- ✅ Monitor session activity
- ✅ Enable HTTPS only (automatic on Vercel)

**DON'T:**
- ❌ Commit `.env.local` to Git
- ❌ Share service role key
- ❌ Use default passwords in production
- ❌ Disable security features
- ❌ Expose admin credentials

### Security Vulnerabilities

**Mitigations:**
- **XSS**: HttpOnly cookies, React auto-escaping
- **CSRF**: SameSite cookies
- **SQL Injection**: Supabase parameterized queries
- **Password Attacks**: Bcrypt slow hashing
- **Session Hijacking**: Secure, HttpOnly, SameSite cookies

---

## Customization Guide

### Changing Colors

Edit `public/styles/style.css`:
```css
:root {
  --primary-color: #6b46c1;    /* Purple */
  --accent-color: #ec4899;     /* Pink */
  --success-color: #00ff88;    /* Green */
  --bg-color: #0f0f23;         /* Dark blue */
  --secondary-color: #1a1a3e;  /* Darker blue */
  --card-bg: #16213e;          /* Card background */
  --text-primary: #ffffff;     /* White text */
  --text-secondary: #a0aec0;   /* Gray text */
  --dark-bg: #0a0a1a;          /* Darkest */
}
```

### Adding Pages

1. Create `pages/yourpage.js`
2. Use `Layout` component
3. Add link to `components/Layout.js` navbar
4. Deploy (auto-deploys on Vercel)

### Adding API Routes

1. Create `pages/api/yourroute.js`
2. Export default async handler function
3. Use authentication if needed:
   ```javascript
   import { validateSession, getSessionFromCookie } from '../../lib/auth';

   const sessionId = getSessionFromCookie(req.headers.cookie);
   const session = await validateSession(sessionId);
   if (!session) return res.status(401).json({ error: 'Unauthorized' });
   ```

---

## Troubleshooting

### Common Issues

**Installation fails**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Port already in use**
```bash
# Use different port
PORT=3001 npm run dev
```

**Database connection errors**
- Verify `.env.local` exists
- Check Supabase project status
- Confirm environment variables are correct
- Test Supabase connection in dashboard

**Forgot password**
- Delete admin row from Supabase `admins` table
- Restart server (creates new default admin)
- Or reset via SQL:
  ```sql
  UPDATE admins
  SET password_hash = '$2b$10$...',  -- admin123 hash
      is_default_password = true
  WHERE username = 'admin';
  ```

**Build errors**
```bash
# Clean Next.js cache
rm -rf .next
npm run build
```

**Session issues**
- Clear browser cookies
- Check session expiry (24 hours)
- Verify Supabase `sessions` table

---

## Documentation Links

### Internal Documentation
- [Installation Guide](docs/guides/installation.md)
- [Admin Panel Guide](docs/guides/admin-panel.md)
- [Database Setup](docs/database/setup-guide.md)
- [Deployment Guide](docs/database/deployment.md)
- [Branching Strategy](docs/guides/branching.md)
- [Versioning Guide](docs/guides/versioning.md)
- [Next.js Info](docs/guides/nextjs-info.md)
- [Dual-Server Migration](docs/guides/dual-server-migration.md)

### External Resources
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [Standard Version](https://github.com/conventional-changelog/standard-version)

---

## Version History

### v2.5.2 (2025-10-06)
- Documentation reorganization

### v2.5.0 (2025-10-06)
- Dual-server support in admin panel

### v2.3.0 (2025-10-06)
- Dual-server support for Minecraft and FiveM

### v2.2.0 (2025-10-06)
- Role-based access control system

### v2.1.0 (2025-10-06)
- Vercel Speed Insights integration

### v2.0.0 (2025-01-06)
- Complete Next.js migration
- Supabase integration
- User profiles system
- GDPR cookie consent

See [CHANGELOG.md](CHANGELOG.md) for complete history.

---

## Credits

**Built with:**
- Next.js by Vercel
- React by Meta
- Supabase by Supabase Inc.
- Bcrypt by Niels Provos and David Mazières

**Made for EVU Server**
Powered by Next.js + Supabase | Deployed on Vercel

---

## License

ISC License - See package.json

---

**Last Updated**: 2025-10-06
**Maintained By**: EVU Development Team
**Documentation Version**: 2.5.2
