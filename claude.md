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
- **Version**: 2.14.0
- **Framework**: Next.js 15.5.4
- **Runtime**: Node.js 22.x (LTS)
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel
- **License**: ISC

### Primary Features
- **Dual-server support** for Minecraft and FiveM
- **Admin panel** with comprehensive CMS and quick access from profile
- **User authentication** and profile management with avatar uploads
- **Advanced RBAC system** with custom roles and granular permissions
- **Multi-theme system** with 5 themes (Dark, Light, Purple, Ocean, Forest)
- **Complete forum system** with topics, comments, and moderation
- **Support ticket system** with email notifications
- **Automated changelog** generation from Git commits
- **GDPR-compliant** data management with export/delete
- **Performance metrics** tracking and analytics
- **Email notification system** (Resend/SMTP)

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
  "@vercel/speed-insights": "^1.2.0",  // Performance monitoring
  "@vercel/analytics": "^1.5.0",       // Analytics tracking
  "formidable": "^3.5.4",              // File upload handling
  "nodemailer": "^7.0.9"               // Email sending (SMTP)
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
- **Next.js 15** - React framework with Pages Router
- **Supabase** - PostgreSQL database with real-time capabilities
- **Bcrypt** - Industry-standard password hashing (10 salt rounds)
- **Vercel** - Serverless deployment platform with Analytics
- **Standard Version** - Automated versioning and CHANGELOG generation
- **Nodemailer** - Email sending via SMTP
- **Formidable** - Multipart form data parsing for file uploads

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
- Create new users with role assignment
- Assign custom roles with specific permissions
- Delete users (with confirmation)
- Reset user passwords
- View user creation dates
- Default password warnings

**Roles Tab** (RBAC System)
- View all custom and system roles
- Create new custom roles
- Edit role permissions (52+ granular permissions)
- Delete custom roles (system roles protected)
- Permission categories:
  - Content Management (view, edit)
  - User Management (view, create, edit, delete)
  - Role Management (view, create, edit, delete)
  - Forum (view, post, edit, delete, moderate)
  - Support Tickets (view, create, respond, manage)
  - Dashboard & Analytics (view)
  - Settings (view, edit)
  - Email (view, edit, send)

**Support Tab**
- View all support tickets
- Filter by status (open, in_progress, closed)
- Filter by priority (low, medium, high)
- Reply to tickets
- Change ticket status
- Email notifications for replies

**Email Settings Tab**
- Configure email provider (Resend or SMTP)
- Set SMTP credentials
- Configure from email/name
- Test email functionality
- View email delivery status

**Dashboard Tab**
- User statistics (total, new, active)
- Ticket metrics (open, closed, avg response time)
- Forum activity (topics, comments)
- Performance metrics history
- Quick access to recent activity

**Security Features**
- Forced password change on first login
- Password complexity requirements (min 8 chars)
- Real-time status indicators
- Session-based authentication
- Permission-based access control

### 2. **User Profiles** (`/profile`)

- Username/password authentication
- Profile customization (display name, email, bio, avatar)
- Avatar image upload (with file size validation)
- Password change functionality
- Role badges with permission display
- Account creation date tracking
- Quick access to admin panel (if permitted)
- GDPR-compliant data management:
  - Export all personal data (JSON format)
  - Delete account (with password confirmation)
  - Data portability compliance

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
- **Complete forum system** with topics and threaded comments
- Category browsing with server filtering
- Create new topics and reply to existing ones
- Topic and post counts with real-time updates
- Recent activity feed showing latest posts
- Forum rules section
- Server-specific categories (Minecraft/FiveM/General)
- Moderation tools (edit, delete, lock topics)
- User authentication required for posting
- Permission-based moderation access

**Support Page** (`/support`)
- Create support tickets with priority levels
- View own tickets (users) or all tickets (admins)
- Reply to tickets with threaded conversations
- Ticket status tracking (open, in_progress, closed)
- Email notifications for new tickets and replies
- Filter tickets by status and priority
- Staff reply indicators
- Response time tracking

**Changelog Page** (`/changelog`)
- **Dual-tab system:**
  - **Website Updates (Auto)**: Generated from Git commits via `standard-version`
  - **Server Updates (Manual)**: Curated game server changes from admin panel
- Categorized changes (Features, Improvements, Fixes, Performance, Refactoring, Documentation)
- Version comparison links to GitHub
- Visual "Latest" badges

### 4. **Multi-Theme System**

- **5 Built-in Themes:**
  - 🌙 **Dark** - Default dark purple theme
  - ☀️ **Light** - Clean light theme
  - 💜 **Purple** - Vibrant purple theme
  - 🌊 **Ocean** - Blue ocean theme
  - 🌲 **Forest** - Green forest theme

- **Features:**
  - Theme switcher dropdown in navigation
  - Persistent theme selection (localStorage)
  - Respects system preference on first load
  - Smooth theme transitions
  - CSS variables for easy customization
  - No flash of unstyled content (FOUC)
  - Accessible theme selector with icons

### 5. **Search System**

- Full-text search across:
  - Forum topics and comments
  - User profiles
  - Site content
- Real-time autocomplete suggestions
- Search result filtering by type
- Keyboard navigation support
- Debounced input for performance

### 6. **Email Notification System**

- **Supported Providers:**
  - Resend API (recommended)
  - SMTP (Gmail, Outlook, custom servers)

- **Email Templates:**
  - Welcome emails for new users
  - Password reset notifications
  - Support ticket confirmations
  - Ticket reply notifications
  - Forum mention notifications

- **Admin Controls:**
  - Configure email provider in admin panel
  - Test email functionality
  - View delivery status
  - Customize from name and email

### 7. **Cookie Consent System**

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

### 8. **Performance Monitoring**

- **Vercel Speed Insights** integration
- **Vercel Analytics** for user tracking
- **Platform Metrics System:**
  - Daily automated metrics collection (Vercel Cron)
  - User activity tracking
  - Forum engagement metrics
  - Support ticket response times
  - Historical data retention
  - Admin dashboard visualization

### 9. **User Registration System**

- Public user registration page
- Password strength validation
- Duplicate username/email prevention
- Welcome email on registration
- Default role assignment
- Email verification support (optional)
- Security headers and CSRF protection

---

## Database Architecture

### Supabase Tables

#### **admins** table
```sql
- id (uuid, primary key)
- username (text, unique)
- password_hash (text)          -- bcrypt hashed
- is_default_password (boolean)
- role (text)                   -- 'admin' or 'user' (legacy)
- is_admin (boolean)            -- backward compatibility
- role_id (uuid, foreign key → user_roles.id)  -- RBAC system
- created_at (timestamp)
- updated_at (timestamp)
- display_name (text)           -- user profiles
- email (text)                  -- user profiles
- bio (text)                    -- user profiles
- avatar_url (text)             -- user profiles
```

#### **user_roles** table
```sql
- id (uuid, primary key)
- name (text, unique)           -- Role name (e.g., "Administrator")
- description (text)            -- Role description
- permissions (text[])          -- Array of permission strings
- is_system (boolean)           -- Cannot be deleted/modified
- created_at (timestamp)
- updated_at (timestamp)
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

#### **forum_categories** table
```sql
- id (uuid, primary key)
- name (text)
- description (text)
- server_type (text)            -- 'all', 'minecraft', 'fivem'
- icon (text)                   -- Emoji/icon
- topic_count (integer)
- post_count (integer)
- created_at (timestamp)
```

#### **forum_topics** table
```sql
- id (uuid, primary key)
- category_id (uuid, foreign key → forum_categories.id)
- user_id (uuid, foreign key → admins.id)
- title (text)
- content (text)
- is_locked (boolean)
- is_pinned (boolean)
- view_count (integer)
- reply_count (integer)
- created_at (timestamp)
- updated_at (timestamp)
```

#### **forum_comments** table
```sql
- id (uuid, primary key)
- topic_id (uuid, foreign key → forum_topics.id)
- user_id (uuid, foreign key → admins.id)
- content (text)
- is_edited (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### **support_tickets** table
```sql
- id (uuid, primary key)
- user_id (uuid, foreign key → admins.id)
- subject (text)
- priority (text)               -- 'low', 'medium', 'high'
- status (text)                 -- 'open', 'in_progress', 'closed'
- created_at (timestamp)
- updated_at (timestamp)
```

#### **support_replies** table
```sql
- id (uuid, primary key)
- ticket_id (uuid, foreign key → support_tickets.id)
- user_id (uuid, foreign key → admins.id)
- message (text)
- is_staff_reply (boolean)
- created_at (timestamp)
```

#### **email_settings** table
```sql
- id (integer, primary key)     -- Always 1
- provider (text)               -- 'resend' or 'smtp'
- resend_api_key (text)
- smtp_host (text)
- smtp_port (integer)
- smtp_user (text)
- smtp_pass (text)
- from_email (text)
- from_name (text)
- updated_at (timestamp)
```

#### **platform_metrics** table
```sql
- id (uuid, primary key)
- total_users (integer)
- active_users (integer)        -- Last 30 days
- total_topics (integer)
- total_comments (integer)
- open_tickets (integer)
- avg_response_time (float)     -- Hours
- recorded_at (timestamp)
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

#### `POST /api/profile/upload-avatar`
**Purpose**: Upload user avatar image
**Requires**: Valid session
**Request**: Multipart form data with `avatar` file
**Response**: `{ "success": true, "avatarUrl": "string" }`

#### `POST /api/profile/delete-account`
**Purpose**: Delete user account (GDPR compliance)
**Requires**: Valid session + password confirmation
**Request**: `{ "password": "string" }`

#### `GET /api/profile/export-data`
**Purpose**: Export all user data (GDPR compliance)
**Requires**: Valid session
**Response**: JSON with complete user data

### RBAC APIs

#### `GET /api/roles`
**Purpose**: List all roles and available permissions
**Requires**: `roles.view` permission
**Response**:
```json
{
  "roles": [
    {
      "id": "uuid",
      "name": "string",
      "description": "string",
      "permissions": ["array", "of", "permissions"],
      "is_system": boolean
    }
  ],
  "availablePermissions": {
    "permission.key": "Description"
  }
}
```

#### `POST /api/roles`
**Purpose**: Create new custom role
**Requires**: `roles.create` permission
**Request**:
```json
{
  "name": "string",
  "description": "string",
  "permissions": ["array", "of", "permissions"],
  "isSystem": false
}
```

#### `PUT /api/roles`
**Purpose**: Update existing role
**Requires**: `roles.edit` permission
**Request**:
```json
{
  "roleId": "uuid",
  "name": "string",
  "description": "string",
  "permissions": ["array"]
}
```
**Protection**: Cannot modify system roles

#### `DELETE /api/roles`
**Purpose**: Delete custom role
**Requires**: `roles.delete` permission
**Request**: `{ "roleId": "uuid" }`
**Protection**: Cannot delete system roles or roles with assigned users

#### `POST /api/roles/initialize`
**Purpose**: Initialize default roles (Administrator, Moderator, User)
**Requires**: Admin authentication
**Response**: Creates system roles if they don't exist

### Forum APIs

#### `GET /api/forum/topics`
**Purpose**: Get forum topics for a category
**Public**: Yes (viewing), authentication required for posting
**Query**: `?categoryId=uuid`

#### `POST /api/forum/topics`
**Purpose**: Create new forum topic
**Requires**: Valid session + `forum.post` permission
**Request**:
```json
{
  "categoryId": "uuid",
  "title": "string",
  "content": "string"
}
```

#### `GET /api/forum/comments`
**Purpose**: Get comments for a topic
**Public**: Yes
**Query**: `?topicId=uuid`

#### `POST /api/forum/comments`
**Purpose**: Post comment on topic
**Requires**: Valid session + `forum.post` permission
**Request**:
```json
{
  "topicId": "uuid",
  "content": "string"
}
```

#### `POST /api/forum/moderation`
**Purpose**: Moderate forum content (edit/delete/lock)
**Requires**: `forum.moderate` permission
**Request**:
```json
{
  "action": "delete" | "edit" | "lock",
  "targetType": "topic" | "comment",
  "targetId": "uuid",
  "content": "string"  // for edit action
}
```

#### `GET /api/forum/recent`
**Purpose**: Get recent forum activity
**Public**: Yes
**Response**: Recent topics and comments

### Support Ticket APIs

#### `GET /api/support/tickets`
**Purpose**: Get support tickets (own tickets or all if admin)
**Requires**: Valid session
**Response**: Array of ticket objects

#### `POST /api/support/tickets`
**Purpose**: Create new support ticket
**Requires**: Valid session
**Request**:
```json
{
  "subject": "string",
  "message": "string",
  "priority": "low" | "medium" | "high"
}
```

#### `POST /api/support/replies`
**Purpose**: Reply to support ticket
**Requires**: Valid session (own ticket or `support.manage` permission)
**Request**:
```json
{
  "ticketId": "uuid",
  "message": "string",
  "isStaffReply": boolean
}
```

### Email & Settings APIs

#### `GET /api/email-settings`
**Purpose**: Get email configuration
**Requires**: `email.view` permission

#### `POST /api/email-settings`
**Purpose**: Update email settings
**Requires**: `email.edit` permission
**Request**:
```json
{
  "provider": "resend" | "smtp",
  "resendApiKey": "string",
  "smtpHost": "string",
  "smtpPort": number,
  "smtpUser": "string",
  "smtpPass": "string",
  "fromEmail": "string",
  "fromName": "string"
}
```

#### `POST /api/test-email`
**Purpose**: Send test email
**Requires**: `email.send` permission
**Request**: `{ "to": "email@example.com" }`

### Analytics & Metrics APIs

#### `GET /api/admin/dashboard`
**Purpose**: Get admin dashboard statistics
**Requires**: `dashboard.view` permission
**Response**:
```json
{
  "users": { "total": number, "new": number },
  "tickets": { "open": number, "closed": number },
  "forum": { "topics": number, "comments": number },
  "metrics": { /* performance data */ }
}
```

#### `GET /api/admin/metrics-history`
**Purpose**: Get historical metrics data
**Requires**: `analytics.view` permission
**Query**: `?days=30` (default 30)
**Response**: Time-series metrics data

#### `POST /api/cron/record-metrics`
**Purpose**: Record current metrics (called by Vercel Cron)
**Public**: Yes (protected by Vercel Cron secret)

### Search APIs

#### `GET /api/search`
**Purpose**: Full-text search across content
**Public**: Yes
**Query**: `?q=search+term&type=all|forum|users`

#### `GET /api/search/autocomplete`
**Purpose**: Get search suggestions
**Public**: Yes
**Query**: `?q=partial+term`

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

### Automated Release Workflow

**How it works:**
1. Push commits to `main` branch
2. GitHub Actions runs release workflow
3. Automatically bumps version and updates CHANGELOG
4. Creates release branch (e.g., `release/v2.6.0`)
5. Creates Pull Request automatically (requires `GH_TOKEN` secret)
6. After merging PR, GitHub Release is created

**Required Secret:**
- `GH_TOKEN` - Personal Access Token with `repo` scope
- Add at: https://github.com/adrianlarsen102/EVU-WEB/settings/secrets/actions

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

### v2.14.0 (2025-10-21)
- Profile page optimization
- Admin panel quick access from profile

### v2.13.1 (2025-10-21)
- Favicon implementation
- Website loading performance fixes
- Improved text contrast across themes

### v2.13.0 (2025-10-21)
- **Comprehensive RBAC system** with custom roles
- Granular permission management
- Role-based access control across all features

### v2.12.0 (2025-10-20)
- **Multi-theme system** (Dark, Light, Purple, Ocean, Forest)
- Performance metrics tracking
- Platform enhancements (Phase 1-3)
- Request timeout implementation
- Daily metrics cron job

### v2.11.0 (2025-10-09)
- **GDPR data management** (export/delete account)
- Improved security headers

### v2.10.0 (2025-10-09)
- Avatar upload functionality
- Image handling with Formidable

### v2.9.0 (2025-10-08)
- **Complete forum system** with topics and comments
- Forum counter automation
- Cumulative Layout Shift (CLS) fixes

### v2.8.0 (2025-10-08)
- **Support ticket system** with admin panel
- **Email notification system** (Resend + SMTP)
- Email settings management
- User registration system
- Password strength validation
- Forum moderation tools
- Dynamic recent activity feed

### v2.7.0 (2025-10-06)
- Vercel Analytics integration

### v2.6.0 (2025-10-06)
- Usercentrics CMP integration
- Automated release workflow

### v2.5.0 (2025-10-06)
- Dual-server support in admin panel

### v2.3.0 (2025-10-06)
- Dual-server support for Minecraft and FiveM

### v2.2.0 (2025-10-06)
- Basic role-based access control (Admin/User)

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

**Last Updated**: 2025-10-23
**Maintained By**: EVU Development Team
**Documentation Version**: 2.14.0
