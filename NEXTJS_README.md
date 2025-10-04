# EVU Server Website - Next.js Version

This website has been converted to Next.js for better performance, SEO, and developer experience.

## Installation

1. **Install Node.js** (if not already installed)
   - Download from https://nodejs.org/

2. **Install Dependencies**
   ```bash
   npm install
   ```

## Running the Server

### Development Mode (with hot reload)
```bash
npm run dev
```

### Production Mode
```bash
npm run build
npm start
```

The server will run on http://localhost:3000

## Project Structure

```
├── pages/
│   ├── _app.js           # App wrapper (imports global CSS)
│   ├── index.js          # Homepage (Status page)
│   ├── join.js           # Join server page
│   ├── forum.js          # Forum page
│   ├── changelog.js      # Changelog page
│   ├── admin.js          # Admin panel
│   └── api/              # API routes
│       ├── content.js    # Get/update content
│       ├── login.js      # Admin login
│       ├── logout.js     # Admin logout
│       ├── status.js     # Server status
│       └── auth/
│           └── check.js  # Check auth status
├── components/
│   └── Layout.js         # Shared layout component
├── lib/
│   ├── auth.js           # Authentication logic
│   └── database.js       # SQLite database & password hashing
├── public/
│   └── styles/
│       └── style.css     # Global styles
├── data/
│   ├── content.json      # Website content
│   └── admin.db          # SQLite database (auto-created, not in git)
└── next.config.js        # Next.js configuration
```

## Features

### Pages
- **Homepage (/)**: Server status and features
- **Join (/join)**: How to connect to the server
- **Forum (/forum)**: Community forum categories
- **Changelog (/changelog)**: Version history
- **Admin (/admin)**: Content management panel

### Admin Panel

Access at: **http://localhost:3000/admin**

**Default Credentials:**
- Username: `admin`
- Password: `admin123`

⚠️ **SECURITY**: On first login, you will be **REQUIRED** to change the default password. The system uses SQLite database with bcrypt password hashing for secure authentication.

The admin panel allows you to:
- Edit server information and status
- Manage server features
- Update join information
- Add/edit changelog entries
- Manage forum categories
- Change your password anytime

See [DATABASE_README.md](DATABASE_README.md) for detailed security information.

## API Routes

All API routes are under `/api/`:

- `GET /api/content` - Get all website content
- `POST /api/content` - Update content (requires auth)
- `POST /api/login` - Admin login
- `POST /api/logout` - Admin logout
- `POST /api/change-password` - Change admin password (requires auth)
- `GET /api/auth/check` - Check authentication status
- `GET /api/status` - Get server status

## Key Differences from Express Version

### Benefits of Next.js:
1. **React Components**: Pages are now React components, making them more maintainable
2. **API Routes**: Built-in API routing (no need for separate Express server)
3. **Automatic Routing**: File-based routing system
4. **Server-Side Rendering**: Better SEO and initial load performance
5. **Hot Module Replacement**: Changes appear instantly in development
6. **Optimized Production Builds**: Automatic code splitting and optimization

### Migration Notes:
- HTML files converted to React JSX
- JavaScript now uses React hooks (useState, useEffect)
- CSS remains the same, imported globally in `_app.js`
- Session management simplified (cookie-based)
- All content still stored in `data/content.json`

## Development

### Adding a New Page

1. Create a new file in `pages/` (e.g., `pages/rules.js`)
2. Export a React component:

```javascript
import Layout from '../components/Layout';

export default function Rules() {
  return (
    <Layout title="Server Rules">
      <div className="hero">
        <div className="container">
          <h1>Server Rules</h1>
        </div>
      </div>
    </Layout>
  );
}
```

3. Add navigation link in `components/Layout.js`

### Adding an API Route

Create a file in `pages/api/` (e.g., `pages/api/hello.js`):

```javascript
export default function handler(req, res) {
  res.status(200).json({ message: 'Hello!' });
}
```

## Security Notes

⚠️ **Before deploying to production:**

1. Change admin password in `lib/auth.js`
2. Use environment variables for secrets
3. Enable HTTPS (required for secure cookies)
4. Consider using a database for sessions instead of in-memory storage
5. Add rate limiting for login attempts
6. Implement CSRF protection

## Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Deploy automatically

### Other Platforms
- **Netlify**: Supports Next.js out of the box
- **DigitalOcean App Platform**: Full Next.js support
- **AWS Amplify**: Supports SSR and API routes
- **Custom Server**: Run `npm run build && npm start`

## Troubleshooting

**Port already in use:**
```bash
# Kill process on port 3000 (Windows)
npx kill-port 3000

# Or use a different port
PORT=3001 npm run dev
```

**Changes not appearing:**
- Check terminal for errors
- Hard refresh (Ctrl+F5)
- Restart dev server

**API not working:**
- Ensure `data/content.json` exists
- Check browser console for errors
- Verify API route paths

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Deployment Guide](https://nextjs.org/docs/deployment)
