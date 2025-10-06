# Quick Installation Guide

## Step-by-Step Setup

### 1. Install Dependencies

```bash
npm install
```

This will install:
- Next.js (React framework)
- React & React DOM
- better-sqlite3 (database)
- bcrypt (password hashing)

### 2. Start Development Server

```bash
npm run dev
```

The server will start on **http://localhost:3000**

### 3. First Login & Password Change

1. **Open Admin Panel**
   - Navigate to: http://localhost:3000/admin

2. **Login with default credentials:**
   - Password: `admin123`

3. **Change Password (Required)**
   - A modal will appear forcing you to change the password
   - Enter a new secure password (minimum 8 characters)
   - Confirm the password
   - Click "Change Password"

4. **You're all set!**
   - Your password is now securely stored in the database
   - You can start managing your website content

### 4. Explore the Website

- **Homepage**: http://localhost:3000
- **Join Page**: http://localhost:3000/join
- **Forum**: http://localhost:3000/forum
- **Changelog**: http://localhost:3000/changelog
- **Admin Panel**: http://localhost:3000/admin

## What Happens on First Run?

1. Next.js builds the application
2. Database is automatically created at `data/admin.db`
3. Default admin account is created
4. Website content is loaded from `data/content.json`

## Troubleshooting

### Installation Issues

**Problem**: `npm install` fails with python/build errors

**Solution**: This is usually related to `better-sqlite3` needing to compile native modules.

**Windows**:
```bash
npm install --global windows-build-tools
npm install
```

**macOS**:
```bash
xcode-select --install
npm install
```

**Linux**:
```bash
sudo apt-get install build-essential
npm install
```

### Alternative: Use pre-built binaries
```bash
npm install better-sqlite3 --build-from-source
```

### Port Already in Use

If port 3000 is already taken:

```bash
# Use a different port
PORT=3001 npm run dev
```

### Database Errors

If you see database locked or connection errors:

1. Stop the server
2. Delete `data/admin.db` (this will reset to default password)
3. Restart the server

## Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Create a `.env.local` file for production settings:

```env
NODE_ENV=production
PORT=3000
```

### Hosting Platforms

#### Vercel (Recommended)
1. Push code to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Deploy automatically

#### Other Platforms
- Netlify
- DigitalOcean App Platform
- AWS Amplify
- Railway
- Render

## Next Steps

1. **Customize Content**: Use the admin panel to update server info
2. **Change Branding**: Edit colors in `public/styles/style.css`
3. **Add Pages**: Create new files in `pages/` directory
4. **Connect to FiveM**: Update the API in `status.js` to fetch real server data

## Documentation

- [NEXTJS_README.md](NEXTJS_README.md) - Full Next.js documentation
- [DATABASE_README.md](DATABASE_README.md) - Security & password management
- [ADMIN_README.md](ADMIN_README.md) - Original admin panel guide (deprecated)

## Need Help?

- Check console for error messages
- Review the documentation files
- Ensure all dependencies are installed
- Try deleting `node_modules` and running `npm install` again

## Common Commands

```bash
# Development
npm run dev          # Start dev server with hot reload

# Production
npm run build        # Build for production
npm start            # Start production server

# Maintenance
npm install          # Install/update dependencies
npm run lint         # Check code quality
```
