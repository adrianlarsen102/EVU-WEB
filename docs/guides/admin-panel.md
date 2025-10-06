# Admin Panel Setup Guide

## Installation

1. **Install Node.js** (if not already installed)
   - Download from https://nodejs.org/

2. **Install Dependencies**
   ```bash
   npm install
   ```

## Running the Server

Start the server with:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will run on http://localhost:3000

## Accessing the Admin Panel

1. Open your browser and go to: **http://localhost:3000/admin.html**

2. Login with the password: **admin123**
   - ⚠️ **IMPORTANT**: Change this password in `server.js` (line 10)

## Using the Admin Panel

The admin panel has 5 main sections:

### 1. Server Info
- Change server name, title, subtitle
- Update server version
- Set server status (Online/Offline)
- Adjust max players and uptime

### 2. Features
- Add/remove server features shown on homepage
- Edit icons, titles, and descriptions
- Drag to reorder (manual editing)

### 3. Join Info
- Update server IP/connect command
- Change Discord invite link

### 4. Changelog
- Add new version entries
- Edit existing changelog entries
- Remove old entries
- Each entry can have features, improvements, and bug fixes

### 5. Forum
- Add/edit forum categories
- Update topic and post counts
- Change category descriptions

## Important Files

- `server.js` - Backend server (change admin password here)
- `admin.html` - Admin panel interface
- `admin.js` - Admin panel logic
- `data/content.json` - All website content stored here

## Security Notes

⚠️ **Before going live:**
1. Change the admin password in `server.js` (line 10)
2. Change the session secret in `server.js` (line 14)
3. If using HTTPS, set `cookie: { secure: true }` in `server.js` (line 17)
4. Consider adding more robust authentication (database, multiple users, etc.)

## How It Works

1. All website content is stored in `data/content.json`
2. The admin panel loads this content via API
3. When you save changes, it updates the JSON file
4. The main website pages load content from the same JSON file
5. Changes appear immediately on the website (refresh to see)

## Troubleshooting

**Can't access admin panel:**
- Make sure server is running (`npm start`)
- Check console for errors
- Verify you're using correct URL (http://localhost:3000/admin.html)

**Changes not appearing:**
- Hard refresh the page (Ctrl+F5 or Cmd+Shift+R)
- Check browser console for errors
- Verify content.json was updated

**Server won't start:**
- Make sure Node.js is installed
- Run `npm install` to install dependencies
- Check if port 3000 is already in use
